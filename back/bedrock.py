import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
import os
import time
from typing import Dict, List, Optional, Tuple, Any, Union
import json

load_dotenv()

AWS_ACCESS_KEY_ID : str = os.getenv("AWS_ACCESS", "")
AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET", "")

RETRY_WAIT_TIME = 15
prompt = """Perform a comprehensive review of the provided diff(code changes), evaluating them with the questions.
Think step-by-step and then answer. Do not try to make up an answer. 

Pay special attention to the following questions:
1. Identify new HTTP API endpoints or new user-input parameters to existing endpoints.  
2. Detect security vulnerabilities in the new code. Provide a detailed explanation of the vulnerability and the specific code causing it. If the likelihood of exploitation is low, consider the vulnerability is not a vulnerability. 
3. Identify changes or additions to authentication and authorization. Focus on code or session-related functions that validate user authentication and authorization.
4. Detect the presence of sensitive information or hard-coded secrets in the new code. Print the hard-coded secrets and mask the last four digits.
5. Identify any collection of personal information in the new code.
6. Detect the addition of new external packages in the package manager. It must be a new package in the package manager not a new module in the file. 
7. Identify changes that patch security vulnerabilities.

Below is the changed code, ignoring the headers in the diff, + is new code, and - is deleted code. Please focus on the newly added code:
<diff>
{diff}
</diff>

Important: The output must be **only** raw JSON. 
Do not use any markdown formatting, such as triple backticks (```) or language hints like ```json. 
Print only the JSON object itself — no explanations, no headers, no wrapping.

Answer example:
<example>
{{
  "new_endpoint": {{"explanation": "detailed explanation", "result": Boolean}},
  "vulnerability": {{"explanation": "detailed explanation", "result": Boolean}},
  "auths": {{"explanation": "detailed explanation", "result": Boolean}},
  "secrets": {{"explanation": "detailed explanation", "result": Boolean}},
  "pii": {{"explanation": "detailed explanation", "result": Boolean}},
  "new_package": {{"explanation": "detailed explanation", "result": Boolean}},
  "patch": {{"explanation": "detailed explanation", "result": Boolean}}
}}
</example>
"""
system_prompt = "You are a senior security engineer working for an IT company using GitHub. You have to answer the given question without making it up. Please answer questions, focusing mainly on the diff in the code."


class Bedrock:
    def __init__(self, region: str):
        # Create a Bedrock Runtime client in the AWS Region you want to use.
        self.region = region
        self.client = boto3.client("bedrock-runtime", region_name=self.region,
                                   aws_access_key_id=AWS_ACCESS_KEY_ID,
                                   aws_secret_access_key=AWS_SECRET_ACCESS_KEY)

    def send_prompt(self, prompt: str, system_prompt: str, model_id: str,
                    max_tokens: int, temperature: float, top_p: float) -> tuple:
        # Start a conversation with the user message.
        conversation = [{
            "role": "user",
            "content": [{"text": prompt}],
        }]
        converse_params = {
            "modelId": model_id,
            "messages": conversation,
            "inferenceConfig": {"maxTokens": max_tokens,
                                "temperature": temperature,
                                "topP": top_p}}
        if system_prompt:
            converse_params["system"] = [{"text": system_prompt}]
        while True:
            try:
                # Send the message to the model, using a basic inference configuration.
                response = self.client.converse(**converse_params)

                # Extract and print the response text.
                response_text = response["output"]["message"]["content"][0]["text"]
                # fetch token
                input_tokens = response["usage"]["inputTokens"]
                output_tokens = response["usage"]["outputTokens"]

                return response_text, input_tokens, output_tokens
            except (ClientError, Exception) as e:
                print(f"ERROR: Can't invoke '{model_id}'. Reason: {e}. \nRetrying in {RETRY_WAIT_TIME} second...")
                time.sleep(RETRY_WAIT_TIME)

if __name__ == '__main__':
    REGION = "us-west-2"  # us-west-2
    MODEL_ID = "anthropic.claude-3-sonnet-20240229-v1:0"
    # MODEL_ID = "us.anthropic.claude-3-7-sonnet-20250219-v1:0"
    # MODEL_ID = "us.deepseek.r1-v1:0"
    prompt = "안녕?"
    system_prompt = ""
    MAX_TOKENS = 512
    TEMPERATURE = 0.5
    TOP_P = 0.9
    br = Bedrock(REGION)
    # 비추론 모델 (단일 요청)
    res = br.send_prompt(prompt, system_prompt, MODEL_ID, MAX_TOKENS, TEMPERATURE, TOP_P)
    print(res)


