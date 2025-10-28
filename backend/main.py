from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import csv
import os
from datetime import datetime

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

CSV_FILE = "form_data.csv"

# Ensure CSV file exists with headers
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["timestamp", "endpoint", "form_data"])

@app.post("/submit-form")
async def submit_form(form_data: FormData):
    try:
        # Prepare data for CSV
        timestamp = datetime.now().isoformat()
        endpoint = form_data.selectedEndpoint
        data_str = str(form_data.data)  # Convert dict to string for CSV

        # Append to CSV
        with open(CSV_FILE, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([timestamp, endpoint, data_str])

        return {"message": "Form data saved successfully", "timestamp": timestamp}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving data: {str(e)}")

@app.get("/form-data")
async def get_form_data():
    try:
        data = []
        if os.path.exists(CSV_FILE):
            with open(CSV_FILE, 'r', newline='', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    data.append(row)
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)