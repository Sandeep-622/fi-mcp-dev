import os
from dotenv import load_dotenv
import logging
import google.cloud.logging
from google.cloud.logging.handlers import CloudLoggingHandler

import vertexai
from vertexai import agent_engines

# Load environment variables and initialize Vertex AI
load_dotenv()
project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]
app_name = os.environ.get("APP_NAME", "Master Agent FiMCP")
bucket_name = f"gs://{project_id}-bucket"

# Initialize Google Cloud Logging with the correct project ID
cloud_logging_client = google.cloud.logging.Client(project=project_id)
handler = CloudLoggingHandler(cloud_logging_client, name="master-agent-fimcp")
logging.getLogger().setLevel(logging.INFO)
logging.getLogger().addHandler(handler)

# Initialize Vertex AI with the correct project and location
vertexai.init(
    project=project_id,
    location=location,
    staging_bucket=bucket_name,
)

# Filter agent engines by the app name in .env
ae_apps = agent_engines.list(filter=f'display_name="{app_name}"')
remote_app = next(ae_apps)

logging.info(f"Using remote app: {remote_app.display_name}")

# Get a session for the remote app
remote_session = remote_app.create_session(user_id="u_456")

# Test queries for different master agent capabilities
test_queries = [
    {
        "name": "Financial Planning Query",
        "query": """
        Create a comprehensive plan for me to buy a house worth ₹75 lakhs in Mumbai in the next 8 years. 
        I am 30 years old, earning ₹15 lakhs per year, and willing to take moderate to high risk. 
        Please analyze my financial data and create a detailed strategy.
        """
    },
    {
        "name": "Predictive Analysis Query", 
        "query": """
        With my current investment portfolio growth, what will my total investments be worth in 2035? 
        I want to understand if I'll be able to retire comfortably by age 60.
        """
    },
    {
        "name": "Current Analysis Query",
        "query": """
        Please analyze my current financial health. How are my investments performing? 
        What's my net worth breakdown and where should I focus to improve my financial position?
        """
    }
]

# Test each query type
for i, test_case in enumerate(test_queries, 1):
    print(f"\n{'='*60}")
    print(f"TEST {i}: {test_case['name']}")
    print(f"{'='*60}")
    
    logging.info(f"Testing: {test_case['name']}")
    
    # Run the agent with the test query
    events = remote_app.stream_query(
        user_id="u_456",
        session_id=remote_session["id"],
        message=test_case["query"],
    )
    
    # Print responses
    for event in events:
        for part in event["content"]["parts"]:
            if "text" in part:
                response_text = part["text"]
                print(f"[remote response] {response_text}")
                logging.info(f"[remote response] {response_text}")
    
    print(f"\nCompleted: {test_case['name']}")
    print("-" * 60)

cloud_logging_client.flush_handlers()
print("\n🎉 All tests completed!")
