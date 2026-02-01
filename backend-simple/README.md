# AutoDevOps Git Service - Simplified Backend

Minimal FastAPI microservice for git clone operations.  
**Frontend handles all AI analysis logic.**

---

## 🎯 Purpose

This backend only does:
1. ✅ Clone git repositories
2. ✅ Serve files to frontend
3. ✅ Cleanup on request

**Frontend does**:
- All AI analysis
- Test execution
- Fix generation
- Decision-making

---

## 📡 API Endpoints

### 1. Clone Repository
```bash
POST /clone
{
  "repo_url": "https://github.com/user/repo.git",
  "branch": "main"
}

Response:
{
  "session_id": "sess_abc123",
  "status": "cloned",
  "repo_path": "/files/sess_abc123"
}
```

### 2. List Files
```bash
GET /files/{session_id}

Response:
{
  "session_id": "sess_abc123",
  "files": [
    {"path": "src/auth.py", "size": 1234, "is_dir": false},
    {"path": "tests/", "size": 0, "is_dir": true}
  ]
}
```

### 3. Get File Content
```bash
GET /files/{session_id}/src/auth.py

Response: (file content as text)
```

### 4. Cleanup
```bash
DELETE /cleanup/{session_id}

Response:
{
  "session_id": "sess_abc123",
  "status": "deleted"
}
```

---

## 🚀 Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python main.py

# Or with uvicorn
uvicorn main:app --reload --port 8000
```

Server runs on: http://localhost:8000  
API docs: http://localhost:8000/docs

---

## ☁️ Deploy to Google Cloud Run

### 1. Build and Push Container

```bash
# Set your project ID
export PROJECT_ID=your-gcp-project-id

# Build container
gcloud builds submit --tag gcr.io/$PROJECT_ID/autodevops-git-service

# Or with Docker
docker build -t gcr.io/$PROJECT_ID/autodevops-git-service .
docker push gcr.io/$PROJECT_ID/autodevops-git-service
```

### 2. Deploy to Cloud Run

```bash
gcloud run deploy autodevops-git-service \
  --image gcr.io/$PROJECT_ID/autodevops-git-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --timeout 300
```

### 3. Get Service URL

```bash
gcloud run services describe autodevops-git-service \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'
```

---

## 🧪 Testing

```bash
# Health check
curl https://your-service-url.run.app/health

# Clone a repo
curl -X POST https://your-service-url.run.app/clone \
  -H "Content-Type: application/json" \
  -d '{
    "repo_url": "https://github.com/octocat/Hello-World.git",
    "branch": "master"
  }'

# List files
curl https://your-service-url.run.app/files/sess_abc123

# Get file
curl https://your-service-url.run.app/files/sess_abc123/README

# Cleanup
curl -X DELETE https://your-service-url.run.app/cleanup/sess_abc123
```

---

## 🔒 Security Notes

- ✅ Path traversal protection
- ✅ Session isolation
- ⚠️ CORS set to allow all origins (configure for production)
- ⚠️ No authentication (add if needed)
- ⚠️ Public repos only

---

## 💰 Cloud Run Pricing

**Free tier**: 2 million requests/month  
**After free tier**: ~$0.40 per million requests

**Example costs**:
- 10,000 clones/month: **FREE**
- 100,000 clones/month: **~$4**

---

## 🎯 Frontend Integration

```javascript
// 1. Clone repository
const cloneResponse = await fetch('https://your-service.run.app/clone', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    repo_url: 'https://github.com/user/repo.git',
    branch: 'main'
  })
});

const { session_id } = await cloneResponse.json();

// 2. Get file list
const filesResponse = await fetch(`https://your-service.run.app/files/${session_id}`);
const { files } = await filesResponse.json();

// 3. Read specific file
const fileContent = await fetch(
  `https://your-service.run.app/files/${session_id}/src/auth.py`
);
const code = await fileContent.text();

// 4. Frontend does AI analysis here...

// 5. Cleanup when done
await fetch(`https://your-service.run.app/cleanup/${session_id}`, {
  method: 'DELETE'
});
```

---

## 📊 Monitoring

View logs in Google Cloud Console:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=autodevops-git-service" --limit 50
```

---

## 🔧 Environment Variables

- `PORT`: Server port (Cloud Run sets this automatically)

---

## 📝 File Structure

```
backend-simple/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── Dockerfile          # Container definition
├── .dockerignore       # Docker ignore rules
└── README.md           # This file
```

---

## ✨ Benefits

- **Serverless**: No server management
- **Auto-scaling**: Handles traffic spikes
- **Pay-per-use**: Only pay when cloning
- **Fast**: Cold start < 1 second
- **Simple**: Only 200 lines of code
