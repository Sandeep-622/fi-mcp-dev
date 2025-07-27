"""Data Analyst Agent - Comprehensive financial data analysis with market research support"""

from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool

from . import prompt
from .market_research_agent import market_research_agent

MODEL = "gemini-2.5-pro"

data_analyst_agent = LlmAgent(
    model=MODEL,
    name='data_analyst_agent',
    description="Comprehensive financial data analyst that provides expert analysis across all financial domains with market research support when needed.",
    instruction=prompt.PROMPT,
    tools=[
        AgentTool(agent=market_research_agent),
    ]
)
