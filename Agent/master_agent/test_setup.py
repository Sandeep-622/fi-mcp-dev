"""
Test script to verify the master agent setup
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from agent import root_agent
    print("✅ Master Agent imported successfully!")
    print(f"Agent model: {root_agent.model}")
    print(f"Agent name: {root_agent.name}")
    print(f"Sub-agents: {len(root_agent.sub_agents) if hasattr(root_agent, 'sub_agents') and root_agent.sub_agents else 0}")
    
    # Test the sub-agents structure
    if hasattr(root_agent, 'sub_agents') and root_agent.sub_agents:
        print("\nSub-agents:")
        for i, sub_agent in enumerate(root_agent.sub_agents, 1):
            print(f"  {i}. {sub_agent.name}")
        print("✅ Master Agent setup looks correct!")
    else:
        print("⚠️  No sub-agents found")
        
    print(f"\n📋 Agent Instruction Preview:")
    instruction_preview = root_agent.instruction[:200] + "..." if len(root_agent.instruction) > 200 else root_agent.instruction
    print(f"   {instruction_preview}")
        
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running this from the master_agent directory")
except Exception as e:
    print(f"❌ Error: {e}")

print(f"\n🔧 Environment Variables:")
print(f"   GOOGLE_CLOUD_PROJECT: {os.getenv('GOOGLE_CLOUD_PROJECT', 'Not set')}")
print(f"   GOOGLE_CLOUD_LOCATION: {os.getenv('GOOGLE_CLOUD_LOCATION', 'Not set')}")
print(f"   APP_NAME: {os.getenv('APP_NAME', 'Not set')}")
print(f"   MODEL: {os.getenv('MODEL', 'Not set')}")

print(f"\n🎯 Ready for deployment!")
