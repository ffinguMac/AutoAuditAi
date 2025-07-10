import os
from typing import List, Any
from fastapi import FastAPI, Request, HTTPException, status, Depends, Body
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import aiohttp
import asyncio
from .bedrock import Bedrock, prompt, system_prompt

import db
import jwt
import datetime

load_dotenv()

GITHUB_CLIENT_ID: str = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET: str = os.getenv("GITHUB_CLIENT_SECRET", "")
SECRET_KEY: str = os.getenv("BACKEND_SECRET_KEY", "your_secret_key")
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

    # Create backend token for frontend
    if not access_token:
        raise HTTPException(status_code=400, detail="토큰 발급 실패")

    # 예시: GitHub API로 사용자 정보 조회
    async with aiohttp.ClientSession() as session:
        user_resp = await session.get(
            "https://api.github.com/user",
            headers={"Authorization": f"token {access_token}"}
        )
        user_info = await user_resp.json()
        user_id = str(user_info.get("id"))
        username = user_info.get("login", "unknown")

    backend_token = create_backend_token(access_token, user_id, username)

    return RedirectResponse(f"{FRONTEND_URL}/oauth?token={backend_token}&username={username}", status_code=303)


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


@app.post("/analyze-diff")
async def analyze_diff_api(data: dict = Body(...)):
    diff = data.get("diff", "")
    if not diff:
        return {"error": "diff 값이 필요합니다."}
    REGION = "us-west-2"
    MODEL_ID = "anthropic.claude-3-sonnet-20240229-v1:0"
    MAX_TOKENS = 512
    TEMPERATURE = 0.3
    TOP_P = 0.9
    full_prompt = prompt.replace("{diff}", diff)
    br = Bedrock(REGION)
    response, input_tokens, output_tokens = br.send_prompt(
        full_prompt, system_prompt, MODEL_ID, MAX_TOKENS, TEMPERATURE, TOP_P
    )
    return {"result": response, "input_tokens": input_tokens, "output_tokens": output_tokens}


######################3
# 계정 / 인증 관련
def create_backend_token(github_access_token: str, user_id: str, username: str) -> str:
    # JWT payload 구성
    payload = {
        "sub": user_id,
        "github_token": github_access_token,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=12),
        "username": username,
    }
    backend_token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    # DB에 저장
    db.insert_document("backend_tokens", {
        "user_id": user_id,
        "username":username,
        "github_access_token": github_access_token,
        "backend_token": backend_token,
        "created_at": datetime.datetime.utcnow()
    })
    return backend_token

def verify_jwt_token(request: Request) -> dict:
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="토큰이 없습니다.")
    token = token.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="토큰이 만료되었습니다.")
    except jwt.InvalidTokenError:
        print(jwt.InvalidTokenError)
        raise HTTPException(status_code=401, detail="토큰이 유효하지 않습니다.")


@app.get("/me")
async def get_me(request: Request):
    payload = verify_jwt_token(request)
    user_id = payload.get("sub")
    username = payload.get("username")
    # DB에서 사용자 정보 조회
    token_doc = db.find_one("backend_tokens", {"user_id": user_id})
    if not token_doc:
        raise HTTPException(status_code=404, detail="사용자 정보를 찾을 수 없습니다.")

    print({
        "id": user_id,
        "github_token": token_doc.get("github_access_token"),
        "githubUsername": username,
        "avatar": "https://github.com/" + user_id + ".png",
        "email": None,
        "name": username,
    })
    return {
        "id": user_id,
        "github_token": token_doc.get("github_access_token"),
        "githubUsername": username,
        "avatar": f"https://avatars.githubusercontent.com/u/{user_id}?v=4&size=64",
        "email": None,
        "name": username,
    }
