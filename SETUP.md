# Setup and Run FLEXCUBE Automation

Follow these steps to clone the repository and run the FLEXCUBE Automation system on your local machine.

## Prerequisites

- **Node.js** 18+ installed
- **Python** 3.8+ installed
- **uv** package manager installed (`pip install uv`)
- **Git** installed
- **GitHub account** with access to the repositories

## Step 1: Clone the Repository

```bash
git clone https://github.com/haricode-hub/flexcube-frontend.git
cd flexcube-frontend
```

## Step 2: Install Frontend Dependencies

```bash
npm install
```

## Step 3: Setup Backend Environment

```bash
cd backend
# Create .env file with your GitHub token
echo "GITHUB_TOKEN=your_github_personal_access_token_here" > .env
```

**Note**: Get your GitHub token from https://github.com/settings/tokens with `repo` permissions.

## Step 4: Install Backend Dependencies

```bash
uv sync
```

## Step 5: Prepare Data Repository

1. Ensure https://github.com/jmrdevops/FCUBS_CASA.git exists
2. It should have a `data.csv` file with headers: `timestamp,endpoint,form_data`
3. If not, create it manually on GitHub

## Step 6: Run the System

### Terminal 1: Start Backend
```bash
cd backend
uv run uvicorn main:app --reload
```
Backend will run on http://localhost:8000

### Terminal 2: Start Frontend
```bash
# From project root
npm run dev
```
Frontend will run on http://localhost:3000

## Step 7: Access the Application

1. Open http://localhost:3000 in your browser
2. The system will automatically load 266+ FLEXCUBE services
3. Select a service from the navbar dropdown
4. Fill the dynamic form and submit
5. Data will be stored in the FCUBS_CASA git repository

## Troubleshooting

- **Backend fails to start**: Check GITHUB_TOKEN in backend/.env
- **No services load**: Ensure Rest Documentation folder exists at `../Rest Documentation/Rest Documentation/`
- **Form submission fails**: Check backend logs for git operation errors
- **CORS errors**: Ensure backend is running on port 8000

## File Structure

```
flexcube-frontend/
├── app/                    # Next.js app directory
├── backend/                # FastAPI backend
│   ├── main.py            # Main FastAPI app
│   ├── .env               # Environment variables
│   └── pyproject.toml     # Python dependencies
├── components/            # React components
├── utils/                 # Schema parser utilities
└── PROCESS_FLOW.md        # Complete documentation
```

## Data Flow

1. User selects service → Dynamic form generated from Swagger
2. Form submitted → Sent to FastAPI backend
3. Backend clones FCUBS_CASA repo → Appends data to CSV → Commits & pushes
4. Data permanently stored in git repository

## Support

If issues occur, check:
- Backend logs for git operation errors
- Browser console for frontend errors
- Ensure all prerequisites are installed
- Verify GitHub tokens have correct permissions

**Last Updated**: 2025-10-28
**Version**: 2.0