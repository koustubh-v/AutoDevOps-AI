"""
Simplified AutoDevOps Backend - Git Clone Microservice
Minimal backend for Cloud Run deployment
Frontend handles all AI logic
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import subprocess
import shutil
import uuid
from pathlib import Path
from typing import Optional, List
import os

# Configuration
REPOS_DIR = Path("./repos")
REPOS_DIR.mkdir(exist_ok=True)

# FastAPI app
app = FastAPI(
    title="AutoDevOps Git Service",
    version="1.0.0",
    description="Minimal git clone microservice for frontend-based AI analysis"
)

# CORS - Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Models
class CloneRequest(BaseModel):
    repo_url: str
    branch: str = "main"


class CloneResponse(BaseModel):
    session_id: str
    status: str
    repo_path: str
    message: str


class FileInfo(BaseModel):
    path: str
    size: int
    is_dir: bool


class FilesResponse(BaseModel):
    session_id: str
    files: List[FileInfo]


# Endpoints

@app.get("/")
async def root():
    """Service info"""
    return {
        "service": "AutoDevOps Git Service",
        "version": "1.0.0",
        "status": "online"
    }


@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "repos_dir": str(REPOS_DIR),
        "active_sessions": len(list(REPOS_DIR.glob("sess_*")))
    }


@app.post("/clone", response_model=CloneResponse)
async def clone_repository(request: CloneRequest):
    """
    Clone a git repository
    
    Returns session_id for accessing files
    """
    # Generate session ID
    session_id = f"sess_{uuid.uuid4().hex[:12]}"
    repo_path = REPOS_DIR / session_id
    
    try:
        # Validate URL
        if not request.repo_url.startswith(("http://", "https://")):
            raise HTTPException(status_code=400, detail="Invalid repository URL")
        
        # Clone repository
        cmd = [
            "git", "clone",
            "--depth", "1",
            "--branch", request.branch,
            request.repo_url,
            str(repo_path)
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=180  # 3 minutes
        )
        
        if result.returncode != 0:
            error = result.stderr.strip()
            
            # Parse common errors
            if "not found" in error.lower():
                raise HTTPException(status_code=404, detail="Repository not found")
            elif "permission denied" in error.lower() or "authentication failed" in error.lower():
                raise HTTPException(status_code=403, detail="Access denied - repository may be private")
            elif f"branch {request.branch} not found" in error.lower():
                raise HTTPException(status_code=404, detail=f"Branch '{request.branch}' not found")
            else:
                raise HTTPException(status_code=500, detail=f"Clone failed: {error}")
        
        return CloneResponse(
            session_id=session_id,
            status="cloned",
            repo_path=f"/files/{session_id}",
            message="Repository cloned successfully"
        )
        
    except subprocess.TimeoutExpired:
        # Cleanup on timeout
        if repo_path.exists():
            shutil.rmtree(repo_path)
        raise HTTPException(status_code=408, detail="Clone operation timed out")
        
    except Exception as e:
        # Cleanup on error
        if repo_path.exists():
            shutil.rmtree(repo_path)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/files/{session_id}", response_model=FilesResponse)
async def list_files(session_id: str):
    """
    List all files in cloned repository
    
    Frontend uses this to discover files for analysis
    """
    repo_path = REPOS_DIR / session_id
    
    if not repo_path.exists():
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    
    files = []
    
    # Walk directory tree
    for item in repo_path.rglob("*"):
        # Skip .git directory
        if ".git" in item.parts:
            continue
        
        relative_path = item.relative_to(repo_path)
        
        files.append(FileInfo(
            path=str(relative_path),
            size=item.stat().st_size if item.is_file() else 0,
            is_dir=item.is_dir()
        ))
    
    return FilesResponse(
        session_id=session_id,
        files=files
    )


@app.get("/files/{session_id}/{file_path:path}")
async def get_file(session_id: str, file_path: str):
    """
    Get specific file content
    
    Frontend reads files for AI analysis
    """
    repo_path = REPOS_DIR / session_id
    
    if not repo_path.exists():
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    
    full_path = repo_path / file_path
    
    # Security: Prevent path traversal
    try:
        full_path = full_path.resolve()
        repo_path = repo_path.resolve()
        
        if not str(full_path).startswith(str(repo_path)):
            raise HTTPException(status_code=403, detail="Access denied")
    except:
        raise HTTPException(status_code=403, detail="Invalid file path")
    
    if not full_path.exists():
        raise HTTPException(status_code=404, detail=f"File {file_path} not found")
    
    if full_path.is_dir():
        raise HTTPException(status_code=400, detail="Path is a directory, not a file")
    
    # Return file content
    return FileResponse(
        path=full_path,
        media_type="text/plain",
        filename=full_path.name
    )


@app.delete("/cleanup/{session_id}")
async def cleanup_session(session_id: str):
    """
    Delete cloned repository
    
    Frontend calls this after analysis is complete
    """
    repo_path = REPOS_DIR / session_id
    
    if not repo_path.exists():
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    
    try:
        shutil.rmtree(repo_path)
        
        return {
            "session_id": session_id,
            "status": "deleted",
            "message": "Repository cleaned up successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")


@app.get("/sessions")
async def list_sessions():
    """
    List all active sessions (for debugging)
    """
    sessions = []
    
    for session_dir in REPOS_DIR.glob("sess_*"):
        sessions.append({
            "session_id": session_dir.name,
            "created": session_dir.stat().st_ctime,
            "size_mb": sum(f.stat().st_size for f in session_dir.rglob("*") if f.is_file()) / (1024 * 1024)
        })
    
    return {
        "active_sessions": len(sessions),
        "sessions": sessions
    }


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("PORT", 8000))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
