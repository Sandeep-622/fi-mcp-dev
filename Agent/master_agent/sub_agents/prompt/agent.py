"""LLM Auditor for verifying & refining LLM-generated answers using the web."""

from google.adk.agents import Agent
from google.adk.tools import google_search
from . import prompt


prompt_enhancer = Agent(
    model='gemini-2.5-flash',
    name='prompt_enhancer',
    description="You are a prompt enhancer agent. Your job is to enhance the user's prompt for better clarity and effectiveness.",
    instruction=prompt.PROMPT,
    # tools=[google_search],
)

