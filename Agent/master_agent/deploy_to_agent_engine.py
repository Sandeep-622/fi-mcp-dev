import os
import sys
import vertexai
from vertexai import agent_engines
from dotenv import load_dotenv

from agent import root_agent

# Load environment variables from the local .env file
env_path = os.path.join(os.path.dirname(__file__), '.env')
print(f"Loading .env from: {env_path}")
print(f".env file exists: {os.path.exists(env_path)}")
load_dotenv(dotenv_path=env_path)

# Debug: Print environment variables
print(f"GOOGLE_CLOUD_PROJECT: {os.getenv('GOOGLE_CLOUD_PROJECT')}")
print(f"GOOGLE_CLOUD_LOCATION: {os.getenv('GOOGLE_CLOUD_LOCATION')}")

# Check if required environment variables are set
required_env_vars = ["GOOGLE_CLOUD_PROJECT", "GOOGLE_CLOUD_LOCATION"]
missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    raise ValueError(f"Missing required environment variables: {missing_vars}. Please check your .env file.")

project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
location = os.getenv("GOOGLE_CLOUD_LOCATION")

vertexai.init(
    project=project_id,
    location=location,
    staging_bucket=f"gs://{project_id}-bucket",
)

remote_app = agent_engines.create(
    display_name=os.getenv("APP_NAME", "Master Agent FiMCP"),
    agent_engine=root_agent,
    requirements=[
        "google-cloud-aiplatform[adk,agent_engines]",
        "requests",
        "python-dotenv"
    ]
)
