"""Planning Agent - Comprehensive financial planning and strategy development"""

from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool

from . import prompt
from .planning_research_agent import planning_research_agent

MODEL = "gemini-2.5-flash"

planning_agent = LlmAgent(
    model=MODEL,
    name='planning_agent',
    description="Financial Planning Agent that creates comprehensive, actionable financial plans by synthesizing data analysis and predictions with current market research to achieve specific financial goals.",
    instruction=prompt.PROMPT,
    tools=[
        AgentTool(agent=planning_research_agent),
    ]
)
