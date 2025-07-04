import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
import os
import time
from typing import Dict, List, Optional, Tuple, Any, Union
import json

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS", "")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET", "")

RETRY_WAIT_TIME = 15


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

    def invoke_reasoning(
            self,
            prompt: str,
            system_prompt: str = "",
            reasoning_budget: int = 2000,
            model_id: Optional[str] = None,
            temperature: float = 1,
    ) -> tuple[Any | None, Any | None, Any, Any]:
        """
        Invoke Model with reasoning capability enabled.

        Args:
            system_prompt: Prompt to be used as system prompt.
            prompt: User prompt to send to Model
            reasoning_budget: Token budget for the reasoning step
            model_id: Bedrock model ID to override default
            temperature: Sampling temperature (0.0 to 1.0)

        Returns:
            Tuple containing (reasoning_text, response_text)

        Raises:
            ClientError: If the Bedrock API returns an error
            KeyError: If the response has an unexpected structure
            Exception: For any other unexpected errors
        """
        model_id = model_id

        conversation = [
            {
                "role": "user",
                "content": [{"text": prompt}],
            }
        ]

        reasoning_config = {
            "thinking": {
                "type": "enabled",
                "budget_tokens": reasoning_budget
            }
        }

        # Additional model parameters
        inference_config = {
            "temperature": temperature,
        }

        system_messages = [
            {
                "text": system_prompt
            }
        ]

        try:
            print(f"Invoking model {model_id} with reasoning enabled")
            converse_parameter = {"modelId": model_id,
                                  "messages": conversation,
                                  "inferenceConfig": inference_config,
                                  }
            if model_id=="us.anthropic.claude-3-7-sonnet-20250219-v1:0":
                converse_parameter["additionalModelRequestFields"] = reasoning_config
            if system_prompt:
                converse_parameter["system"] = system_messages

            response = self.client.converse(**converse_parameter)

            print(json.dumps(response, indent=4))
            content_blocks = response["output"]["message"]["content"]
            reasoning_text = None
            response_text = None

            for block in content_blocks:
                if "reasoningContent" in block:
                    reasoning_text = block["reasoningContent"]["reasoningText"]["text"]
                if "text" in block:
                    response_text = block["text"]
            input_tokens, output_tokens = response["usage"]["inputTokens"], response["usage"]["outputTokens"]
            return reasoning_text, response_text, input_tokens, output_tokens

        except ClientError as e:
            print(f"Bedrock API error: {e}")
            raise
        except KeyError as e:
            print(f"Unexpected response structure: {e}")
            raise
        except Exception as e:
            print(f"Unknown error during model invocation: {e}")
            raise


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


