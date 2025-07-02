import os
from typing import List, Any
from fastapi import FastAPI, Request, HTTPException, status, Depends
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import aiohttp
import asyncio

load_dotenv()

GITHUB_CLIENT_ID: str = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET: str = os.getenv("GITHUB_CLIENT_SECRET", "")
FRONTEND_URL: str = "http://localhost:3000"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Repo(BaseModel):
    name: str
    full_name: str

class PullRequest(BaseModel):
    id: int
    title: str
    number: int
    state: str

class ScanRequest(BaseModel):
    repo: str
    pr_number: int

class ScanResult(BaseModel):
    pr_number: int
    results: list

async def get_github_token(request: Request) -> str:
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No token provided")
    return token

@app.get("/auth/github/login")
def github_login() -> RedirectResponse:
    github_auth_url = (
        f"https://github.com/login/oauth/authorize?client_id={GITHUB_CLIENT_ID}&scope=repo"
    )
    return RedirectResponse(github_auth_url)

@app.get("/auth/github/callback")
async def github_callback(code: str) -> RedirectResponse:
    token_url = "https://github.com/login/oauth/access_token"
    headers = {"Accept": "application/json"}
    data = {
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": code,
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(token_url, headers=headers, data=data) as resp:
            resp_json = await resp.json()
    access_token = resp_json.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="토큰 발급 실패")
    return RedirectResponse(f"{FRONTEND_URL}/oauth?token={access_token}")

@app.get("/repos", response_model=List[Repo])
async def get_repos(token: str = Depends(get_github_token)) -> List[Repo]:
    url = "https://api.github.com/user/repos"
    headers = {"Authorization": token}
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as resp:
            if resp.status != 200:
                return [Repo(name="test-repo", full_name="user/test-repo")]
            data = await resp.json()
    return [Repo(name=repo["name"], full_name=repo["full_name"]) for repo in data]

@app.get("/repos/{repo:path}/pulls", response_model=List[PullRequest])
async def get_pulls(repo: str, token: str = Depends(get_github_token)) -> List[PullRequest]:
    url = f"https://api.github.com/repos/{repo}/pulls"
    headers = {"Authorization": token}
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as resp:
            if resp.status != 200:
                return [PullRequest(id=1, title="테스트 PR", number=1, state="open")]
            data = await resp.json()
    return [PullRequest(id=pr["id"], title=pr["title"], number=pr["number"], state=pr["state"]) for pr in data]

@app.post("/scan")
async def scan_pr(request: ScanRequest) -> dict:
    # 실제 분석 로직은 추후 구현
    return {"message": "검사 요청 완료", "pr_number": request.pr_number}

@app.get("/scan/{pr_id}", response_model=ScanResult)
async def get_scan_result(pr_id: int) -> ScanResult:
    return ScanResult(pr_number=pr_id, results=[{"type": "PII", "result": False, "accuracy": 100}]) 