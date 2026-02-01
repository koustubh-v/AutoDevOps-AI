#!/usr/bin/env python3
"""
Test script for simplified git service backend
"""

import requests
import time

BASE_URL = "http://localhost:8000"

def test_service():
    print("🧪 Testing AutoDevOps Git Service\n")
    
    # 1. Health check
    print("1. Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}\n")
    
    # 2. Clone repository
    print("2. Cloning repository...")
    response = requests.post(
        f"{BASE_URL}/clone",
        json={
            "repo_url": "https://github.com/octocat/Hello-World.git",
            "branch": "master"
        }
    )
    
    if response.status_code != 200:
        print(f"   ❌ Clone failed: {response.json()}")
        return
    
    data = response.json()
    session_id = data["session_id"]
    print(f"   ✅ Cloned successfully")
    print(f"   Session ID: {session_id}\n")
    
    # 3. List files
    print("3. Listing files...")
    response = requests.get(f"{BASE_URL}/files/{session_id}")
    files_data = response.json()
    print(f"   Total files: {len(files_data['files'])}")
    print(f"   Sample files:")
    for file in files_data['files'][:5]:
        print(f"     - {file['path']} ({file['size']} bytes)")
    print()
    
    # 4. Get specific file
    print("4. Reading README file...")
    response = requests.get(f"{BASE_URL}/files/{session_id}/README")
    if response.status_code == 200:
        content = response.text
        print(f"   ✅ File content (first 100 chars):")
        print(f"   {content[:100]}...\n")
    else:
        print(f"   ⚠️  README not found, trying other files...\n")
    
    # 5. List active sessions
    print("5. Listing active sessions...")
    response = requests.get(f"{BASE_URL}/sessions")
    sessions = response.json()
    print(f"   Active sessions: {sessions['active_sessions']}\n")
    
    # 6. Cleanup
    print("6. Cleaning up...")
    response = requests.delete(f"{BASE_URL}/cleanup/{session_id}")
    if response.status_code == 200:
        print(f"   ✅ Cleanup successful\n")
    else:
        print(f"   ❌ Cleanup failed: {response.json()}\n")
    
    # 7. Verify cleanup
    print("7. Verifying cleanup...")
    response = requests.get(f"{BASE_URL}/files/{session_id}")
    if response.status_code == 404:
        print(f"   ✅ Session properly deleted\n")
    else:
        print(f"   ⚠️  Session still exists\n")
    
    print("✅ All tests completed!")


if __name__ == "__main__":
    try:
        test_service()
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server!")
        print("\nStart the server with:")
        print("  python main.py")
    except Exception as e:
        print(f"❌ Error: {e}")
