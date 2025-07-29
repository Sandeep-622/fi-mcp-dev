#!/usr/bin/env python3
"""
Test script for the Master Agent REST API
"""

import requests
import json
import time

# API configuration
API_BASE_URL = "http://127.0.0.1:5001"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/")
        if response.status_code == 200:
            print("✅ Health check passed!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"❌ Health check failed with status {response.status_code}")
        return response.status_code == 200
    except requests.ConnectionError:
        print("❌ Connection failed. Make sure the server is running!")
        return False

def test_chat_endpoint():
    """Test the chat endpoint with sample financial queries"""
    print("\n💬 Testing chat endpoint...")
    
    test_cases = [
        {
            "name": "House Purchase Goal",
            "message": "My goal is to buy a house worth ₹50 lakhs in 5 years. I am 28 years old and currently earning ₹8 lakhs per year. Am I on track to achieve this goal?",
            "user_id": "test_user_1"
        },
        {
            "name": "Investment Analysis",
            "message": "Can you analyze my current investment portfolio and suggest improvements?",
            "user_id": "test_user_2"
        },
        {
            "name": "Retirement Planning",
            "message": "Create a plan for me to retire comfortably at 55 with ₹2 crores. I'm currently 30 years old.",
            "user_id": "test_user_3"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test Case {i}: {test_case['name']}")
        print(f"Message: {test_case['message'][:80]}...")
        
        try:
            start_time = time.time()
            response = requests.post(
                f"{API_BASE_URL}/chat",
                json={
                    "message": test_case["message"],
                    "user_id": test_case["user_id"]
                },
                headers={"Content-Type": "application/json"},
                timeout=120  # 2 minute timeout for complex queries
            )
            
            end_time = time.time()
            response_time = end_time - start_time
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Response received in {response_time:.2f}s")
                print(f"Response length: {len(result.get('response', ''))} characters")
                print(f"First 200 chars: {result.get('response', '')[:200]}...")
                if len(result.get('response', '')) > 200:
                    print("...")
            else:
                print(f"❌ Request failed with status {response.status_code}")
                print(f"Response: {response.text}")
                
        except requests.Timeout:
            print("⏰ Request timed out (>2 minutes)")
        except requests.ConnectionError:
            print("❌ Connection failed")
        except Exception as e:
            print(f"❌ Error: {e}")

def test_invalid_requests():
    """Test error handling with invalid requests"""
    print("\n🚫 Testing error handling...")
    
    # Test missing message
    try:
        response = requests.post(
            f"{API_BASE_URL}/chat",
            json={"user_id": "test"},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 400:
            print("✅ Correctly handled missing message")
        else:
            print(f"❌ Expected 400, got {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing missing message: {e}")
    
    # Test non-JSON request
    try:
        response = requests.post(
            f"{API_BASE_URL}/chat",
            data="not json",
            headers={"Content-Type": "text/plain"}
        )
        if response.status_code == 400:
            print("✅ Correctly handled non-JSON request")
        else:
            print(f"❌ Expected 400, got {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing non-JSON: {e}")

def main():
    """Run all tests"""
    print("🧪 Master Agent API Test Suite")
    print("=" * 50)
    
    # Test health check first
    if not test_health_check():
        print("\n❌ Server is not running. Please start it with: python app.py")
        return
    
    # Test chat functionality
    test_chat_endpoint()
    
    # Test error handling
    test_invalid_requests()
    
    print("\n" + "=" * 50)
    print("🏁 Test suite completed!")

if __name__ == "__main__":
    main()
