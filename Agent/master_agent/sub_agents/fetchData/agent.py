"""Agent to fetch the required data using various tools."""

from google.adk.agents import Agent
import requests

# Tool definitions
def fetch_net_worth() -> dict:
    """Fetch the user's net worth data."""
    return _fetch_tool_data("fetch_net_worth")

def fetch_credit_report() -> dict:
    """Fetch the user's credit report."""
    return _fetch_tool_data("fetch_credit_report")

def fetch_epf_details() -> dict:
    """Fetch the user's EPF details."""
    return _fetch_tool_data("fetch_epf_details")

def fetch_mf_transactions() -> dict:
    """Fetch the user's mutual fund transactions."""
    return _fetch_tool_data("fetch_mf_transactions")

def fetch_bank_transactions() -> dict:
    """Fetch the user's bank transactions."""
    return _fetch_tool_data("fetch_bank_transactions")

def fetch_stock_transactions() -> dict:
    """Fetch the user's stock transactions."""
    return _fetch_tool_data("fetch_stock_transactions")

# Shared fetch function
def _fetch_tool_data(tool_name: str) -> dict:
    """Helper to call the localhost tool endpoint with a fixed session ID."""
    try:
        response = requests.get(
            # f"http://localhost:8080/tool?sessionId=temp1&tool={tool_name}",
            f"http://localhost:8080/tool?sessionId=temp1&tool={tool_name}",
            timeout=5
        )
        response.raise_for_status()
        return {"status": "success", "report": response.json()}
    except requests.RequestException as e:
        return {"status": "error", "error_message": str(e)}

# Instruction prompt (assume you have it in prompt.py)
from . import prompt

# Agent creation
fetchData_agent = Agent(
    model='gemini-2.5-flash',
    name='fetchData_agent',
    description="It is a data fetching agent. Its job is to fetch data using the tools provided based on the user's request.",
    instruction=prompt.PROMPT,
    tools=[
        fetch_net_worth,
        fetch_credit_report,
        fetch_epf_details,
        fetch_mf_transactions,
        fetch_bank_transactions,
        fetch_stock_transactions
    ]
)
