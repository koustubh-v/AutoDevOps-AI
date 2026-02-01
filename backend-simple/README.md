# AutoDevOps Git Microservice

> A lightweight, stateless FastAPI service designed to handle file system and Git operations for the AutoDevOps AI agent.

## 📌 Overview

This microservice acts as the "hands" of the AutoDevOps AI system. While the React frontend handles the "brain" (AI reasoning, state management), this service performs the actual physical operations on the codebase: cloning repositories, reading file contents for analysis, and cleaning up workspaces.

It is designed to be **ephemeral** and **stateless**, making it perfect for serverless deployment platforms like **Google Cloud Run**.

## 🔌 API Reference

### Health Check
`GET /health`
Returns the operational status of the service and active session count.

### 1. Clone Repository
**Endpoint**: `POST /clone`
**Description**: Clones a public Git repository into a temporary isolated session.

**Request Body:**
```json
{
  "repo_url": "https://github.com/username/repo.git",
  "branch": "main"
}
```

**Response:**
```json
{
  "session_id": "sess_a1b2c3d4e5f6",
  "status": "cloned",
  "repo_path": "/files/sess_a1b2c3d4e5f6"
}
```

### 2. List Files
**Endpoint**: `GET /files/{session_id}`
**Description**: returns a flat list of all files in the cloned repository (excluding `.git`), allowing the frontend to build a file tree.

### 3. Read File Content
**Endpoint**: `GET /files/{session_id}/{file_path}`
**Description**: Stream the raw text content of a specific file. Securely sanitizes paths to prevent directory traversal attacks.

### 4. Cleanup Session
**Endpoint**: `DELETE /cleanup/{session_id}`
**Description**: Instantly removes the cloned repository and session data from the server.

---

## 🛠 Local Development

### Prerequisites
- Python 3.9+
- Git installed and available in regular system PATH

### Setup

```bash
# 1. Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the server
# Runs on http://0.0.0.0:8000 by default
python main.py
```

---

## ☁️ Deployment (Google Cloud Run)

This service is optimized for containerized deployment. A `Dockerfile` is included in the root of this directory.

### Build & Deploy

```bash
# 1. Build the container
gcloud builds submit --tag gcr.io/PROJECT_ID/git-service

# 2. Deploy to Cloud Run
gcloud run deploy git-service \
  --image gcr.io/PROJECT_ID/git-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi
```

## 🔒 Security Notes
- **Path Traversal Protection**: The `get_file` endpoint strictly validates that requested file paths resolve within the generated session directory.
- **Session Isolation**: Each `POST /clone` request generates a unique cryptographically random UUID for the session.
- **Auto Cleanup**: It is recommended to configure a lifecycle policy or Cloud Scheduler job to purge the `./repos` folder periodically to ensure no stale data remains if a client fails to call cleanup.
