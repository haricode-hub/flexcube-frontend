from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import subprocess
import tempfile
import shutil
import csv
import os
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="FlexCube Form Data API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FormData(BaseModel):
    selectedEndpoint: str
    data: Dict[str, Any]


# Git repo configuration
DATA_REPO_URL = "https://github.com/jmrdevops/FCUBS_CASA.git"
# Set this env var with jmrdevops token
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
TEMP_REPO_DIR = None


def setup_data_repo():
    global TEMP_REPO_DIR
    if TEMP_REPO_DIR and os.path.exists(TEMP_REPO_DIR):
        return  # Already set up

    TEMP_REPO_DIR = tempfile.mkdtemp(prefix="fcubs_data_")
    repo_url_with_token = DATA_REPO_URL.replace(
        "https://", f"https://jmrdevops:{GITHUB_TOKEN}@") if GITHUB_TOKEN else DATA_REPO_URL

    try:
        # Clone the repo
        subprocess.run(["git", "clone", repo_url_with_token,
                       TEMP_REPO_DIR], check=True, capture_output=True)
        print(f"Cloned data repo to {TEMP_REPO_DIR}")
    except subprocess.CalledProcessError as e:
        print(f"Failed to clone repo: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to setup data repository")

# Setup repo on startup


@app.on_event("startup")
async def startup_event():
    if GITHUB_TOKEN:
        setup_data_repo()
    else:
        print("Warning: GITHUB_TOKEN not set, data will not be saved to repo")


@app.post("/submit-form")
async def submit_form(form_data: FormData):
    try:
        if not GITHUB_TOKEN or not TEMP_REPO_DIR:
            raise HTTPException(
                status_code=500, detail="Data repository not configured")

        # Prepare data for CSV
        timestamp = datetime.now().isoformat()
        endpoint = form_data.selectedEndpoint
        data_str = str(form_data.data)  # Convert dict to string for CSV

        # Pull latest changes
        subprocess.run(["git", "pull", "origin", "main"],
                       cwd=TEMP_REPO_DIR, check=True, capture_output=True)

        # Append to CSV in repo
        csv_file_path = os.path.join(TEMP_REPO_DIR, "data.csv")
        with open(csv_file_path, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([timestamp, endpoint, data_str])

        # Git add, commit, push
        subprocess.run(["git", "add", "data.csv"],
                       cwd=TEMP_REPO_DIR, check=True)
        subprocess.run(
            ["git", "commit", "-m", f"Add form data submission at {timestamp}"], cwd=TEMP_REPO_DIR, check=True)
        subprocess.run(["git", "push", "origin", "main"],
                       cwd=TEMP_REPO_DIR, check=True)

        return {"message": "Form data saved to repository successfully", "timestamp": timestamp}

    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=500, detail=f"Git operation failed: {e.stderr.decode()}")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error saving data: {str(e)}")


@app.get("/form-data")
async def get_form_data():
    try:
        if not TEMP_REPO_DIR:
            return {"data": []}

        # Pull latest changes
        subprocess.run(["git", "pull", "origin", "main"],
                       cwd=TEMP_REPO_DIR, check=True, capture_output=True)

        data = []
        csv_file_path = os.path.join(TEMP_REPO_DIR, "data.csv")
        if os.path.exists(csv_file_path):
            with open(csv_file_path, 'r', newline='', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    data.append(row)
        return {"data": data}
    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=500, detail=f"Git operation failed: {e.stderr.decode()}")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error reading data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
