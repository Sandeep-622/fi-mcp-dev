"""Predictive Model Agent - Financial forecasting and trend analysis"""

from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool

from . import prompt
from .external_research_agent import external_research_agent
import requests


# HTTP function tools for fetching financial data
def fetch_net_worth():
    """Fetch current net worth of the user"""
    return _fetch_tool_data("fetch_net_worth")

def fetch_credit_report():
    """Fetch credit report and score of the user"""
    return _fetch_tool_data("fetch_credit_report")

def fetch_epf_details():
    """Fetch Employee Provident Fund (EPF) details of the user"""
    return _fetch_tool_data("fetch_epf_details")

def fetch_mf_transactions():
    """Fetch mutual fund transactions of the user"""
    return _fetch_tool_data("fetch_mf_transactions")

def fetch_bank_transactions():
    """Fetch bank transactions of the user"""
    return _fetch_tool_data("fetch_bank_transactions")

def fetch_stock_transactions():
    """Fetch stock transactions of the user"""
    return _fetch_tool_data("fetch_stock_transactions")

# Shared fetch function
def _fetch_tool_data(tool_name: str) -> dict:
    """Helper to call the localhost tool endpoint with a fixed session ID."""
    try:
        response = requests.get(
            f"http://localhost:8080/tool?sessionId=temp1&tool={tool_name}",
            timeout=5
        )
        response.raise_for_status()
        return {"status": "success", "report": response.json()}
    except requests.RequestException as e:
        return {"status": "error", "error_message": str(e)}

MODEL = "gemini-2.5-flash"

predictive_model_agent = LlmAgent(
    model=MODEL,
    name='predictive_model_agent',
    description="Predictive Model Agent for financial forecasting and trend analysis. Analyzes historical financial data to identify patterns and make predictions about future financial scenarios with external research support.",
    instruction=prompt.PROMPT,
    tools=[
        fetch_net_worth,
        fetch_credit_report,
        fetch_epf_details,
        fetch_mf_transactions,
        fetch_bank_transactions,
        fetch_stock_transactions,
        AgentTool(agent=external_research_agent),
    ]
)
