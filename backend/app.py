from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
from contextlib import asynccontextmanager
import subprocess
import tempfile
import shutil
import csv
import os
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()

# Git repo configuration
DATA_REPO_URL = "https://github.com/jmrdevops/FCUBS_CASA.git"
# Set this env var with jmrdevops token
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
TEMP_REPO_DIR = os.path.join(os.getcwd(), "temp_repo")


def setup_data_repo():
    global TEMP_REPO_DIR
    if os.path.exists(TEMP_REPO_DIR):
        # Check if it's already a git repo
        if os.path.exists(os.path.join(TEMP_REPO_DIR, ".git")):
            print(f"Data repo already exists at {TEMP_REPO_DIR}")
            return  # Already set up
        else:
            # Remove if exists but not git repo
            shutil.rmtree(TEMP_REPO_DIR)

    # Create directory
    os.makedirs(TEMP_REPO_DIR, exist_ok=True)

    repo_url_with_token = DATA_REPO_URL.replace(
        "https://", f"https://jmrdevops:{GITHUB_TOKEN}@") if GITHUB_TOKEN else DATA_REPO_URL

    try:
        # Clone the repo
        subprocess.run(["git", "clone", repo_url_with_token,
                       TEMP_REPO_DIR], check=True, capture_output=True)
        print(f"Cloned data repo to {TEMP_REPO_DIR}")

        # Configure a local git identity in the cloned repo so commits succeed.
        # Prefer env vars GIT_USER_NAME / GIT_USER_EMAIL if provided, else use safe defaults.
        git_user_name = os.getenv("GIT_USER_NAME", "jmrdevops")
        git_user_email = os.getenv(
            "GIT_USER_EMAIL", "jmrdevops@jmrinfotech.com")
        try:
            subprocess.run(["git", "config", "user.email", git_user_email],
                           cwd=TEMP_REPO_DIR, check=True, capture_output=True)
            subprocess.run(["git", "config", "user.name", git_user_name],
                           cwd=TEMP_REPO_DIR, check=True, capture_output=True)
            print(
                f"Configured git user.name={git_user_name} and user.email={git_user_email} in repo")
        except subprocess.CalledProcessError as e:
            # Non-fatal: print a warning but don't raise here so the app can still start.
            stderr = e.stderr.decode() if getattr(e, 'stderr', None) else str(e)
            print(f"Warning: failed to set git config in repo: {stderr}")

        # Create data folder if it doesn't exist
        data_dir = os.path.join(TEMP_REPO_DIR, "data")
        os.makedirs(data_dir, exist_ok=True)

        # Ensure casa_inbox.csv exists in data/
        csv_file = os.path.join(data_dir, "casa_inbox.csv")
        if not os.path.exists(csv_file):
            with open(csv_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(["timestamp", "endpoint", "form_data"])


    except subprocess.CalledProcessError as e:
        # Provide useful debug info when cloning fails
        stderr = e.stderr.decode() if getattr(e, 'stderr', None) else str(e)
        print(f"Failed to clone repo: {stderr}")
        raise HTTPException(
            status_code=500, detail="Failed to setup data repository")

# Setup repo on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    if GITHUB_TOKEN:
        setup_data_repo()
    else:
        print("Warning: GITHUB_TOKEN not set, data will not be saved to repo")
    yield
    # Shutdown (if needed)
    pass


app = FastAPI(title="FlexCube Form Data API", version="1.0.0", lifespan=lifespan)

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


@app.post("/submit-form")
async def submit_form(form_data: FormData):
    try:
        if not GITHUB_TOKEN or not TEMP_REPO_DIR:
            raise HTTPException(
                status_code=500, detail="Data repository not configured")

        # Ensure data directory and CSV file exist
        data_dir = os.path.join(TEMP_REPO_DIR, "data")
        os.makedirs(data_dir, exist_ok=True)
        csv_file_path = os.path.join(data_dir, "casa_inbox.csv")
        if not os.path.exists(csv_file_path):
            with open(csv_file_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(["timestamp", "endpoint", "form_data"])

        # Prepare data for CSV
        timestamp = datetime.now().isoformat()
        endpoint = form_data.selectedEndpoint
        data_str = str(form_data.data)  # Convert dict to string for CSV

        # Pull latest changes
        subprocess.run(["git", "pull", "origin", "main"],
                        cwd=TEMP_REPO_DIR, check=True, capture_output=True)

        # Append to CSV
        with open(csv_file_path, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([timestamp, endpoint, data_str])

        # Git add, commit, push only the CSV file (force add even if ignored)
        subprocess.run(["git", "add", "-f", "data/casa_inbox.csv"],
                        cwd=TEMP_REPO_DIR, check=True)
        subprocess.run(
            ["git", "commit", "-m", f"Add form data submission at {timestamp}"], cwd=TEMP_REPO_DIR, check=True)
        subprocess.run(["git", "push", "origin", "main"],
                        cwd=TEMP_REPO_DIR, check=True)

        return {"message": "Form data saved to repository successfully", "timestamp": timestamp}

    except subprocess.CalledProcessError as e:
        stderr = e.stderr.decode() if getattr(e, 'stderr', None) else str(e)
        raise HTTPException(
            status_code=500, detail=f"Git operation failed: {stderr}")
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
        csv_file_path = os.path.join(TEMP_REPO_DIR, "data", "casa_inbox.csv")
        if os.path.exists(csv_file_path):
            with open(csv_file_path, 'r', newline='', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    data.append(row)
        return {"data": data}
    except subprocess.CalledProcessError as e:
        stderr = e.stderr.decode() if getattr(e, 'stderr', None) else str(e)
        raise HTTPException(
            status_code=500, detail=f"Git operation failed: {stderr}")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error reading data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
