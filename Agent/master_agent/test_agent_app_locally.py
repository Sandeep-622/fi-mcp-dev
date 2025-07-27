import logging
import google.cloud.logging
import asyncio
import textwrap

from vertexai.preview import reasoning_engines
from agent import root_agent

# Set up both local and Google Cloud logging.
logging.basicConfig(level=logging.INFO)
cloud_logging_client = google.cloud.logging.Client()
cloud_logging_client.setup_logging()


async def main() -> None:
    """Initializes the master agent and sends a financial goal query to it."""
    agent_app = reasoning_engines.AdkApp(
        agent=root_agent,
        enable_tracing=True,
    )

    # Create a session first
    session = agent_app.create_session(user_id="u_123")

    # Test query for comprehensive financial planning
    prompt = textwrap.dedent("""
        Create a suitable plan for me to buy a 3 BHK house in Bangalore in next 10 years. I am ready to take moderate risk. 
        I am 28 years old and currently earning ₹12 lakhs per year. Please analyze my current financial situation and create a detailed roadmap.
    """)

    print(f"Testing Master Agent with query: {prompt.strip()}")

    # Use the stream_query method with session
    for event in agent_app.stream_query(
        user_id="u_123",
        session_id=session.id,
        message=prompt,
    ):
        if "content" in event and "parts" in event["content"]:
            for part in event["content"]["parts"]:
                if "text" in part:
                    logging.info(f"[local test] {part['text']}")
                    print(f"[local test] {part['text']}")
        
    cloud_logging_client.flush_handlers()


if __name__ == "__main__":
    asyncio.run(main())
