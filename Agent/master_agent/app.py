# app.py - Local REST API for Master Agent

import asyncio
from flask import Flask, request, jsonify
import os
import sys

# Add the current directory to Python path for imports
sys.path.append(os.path.dirname(__file__))

from vertexai.preview import reasoning_engines
from agent import root_agent  # Import the master agent

# Initialize Flask app
app = Flask(__name__)

# Initialize the ADK App with the master agent
# This is done once when the server starts for efficiency
print("Initializing Master Agent...")
try:
    # Set Google Cloud project explicitly
    import os
    os.environ['GOOGLE_CLOUD_PROJECT'] = 'extreme-braid-467107-h6'
    
    agent_app = reasoning_engines.AdkApp(
        agent=root_agent,
        enable_tracing=True  # Enable tracing for debugging
    )
    print("Master Agent initialized successfully!")
except Exception as e:
    print(f"Error initializing master agent: {e}")
    print("Please check the Google Cloud setup instructions in fix_google_cloud.md")
    agent_app = None

@app.route("/", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "Master Agent API is running",
        "agent": root_agent.name,
        "endpoints": {
            "chat": "/chat - POST request with JSON body containing 'message'",
            "health": "/ - GET request for health check"
        }
    })

@app.route("/chat", methods=["POST"])
def handle_chat():
    """
    Handles chat requests sent to the master agent.
    Expects a JSON payload with a "message" key.
    
    Example request:
    {
        "message": "My goal is to buy a house worth ₹50 lakhs in 5 years. Am I on track?",
        "user_id": "user123"  // optional
    }
    """
    # Ensure the request has a JSON body
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    user_message = data.get("message")
    user_id = data.get("user_id", "local-user")  # Optional user_id

    if not user_message:
        return jsonify({"error": "Missing 'message' in request body"}), 400

    try:
        # Check if agent_app is initialized
        if agent_app is None:
            return jsonify({
                "error": "Master Agent not initialized",
                "details": "Google Cloud authentication failed. Please check fix_google_cloud.md for setup instructions."
            }), 503
            
        print(f"Processing message from user {user_id}: {user_message[:100]}...")
        
        # Create a session for the user
        session = agent_app.create_session(user_id=user_id)
        
        # Collect all response parts
        response_parts = []
        
        # Use stream_query to get the agent's response
        for event in agent_app.stream_query(
            user_id=user_id,
            session_id=session.id,
            message=user_message,
        ):
            if "content" in event and "parts" in event["content"]:
                for part in event["content"]["parts"]:
                    if "text" in part:
                        response_parts.append(part["text"])
        
        # Combine all response parts
        full_response = "".join(response_parts)
        
        print(f"Response generated successfully (length: {len(full_response)} chars)")
        
        # Return the agent's response as JSON
        return jsonify({
            "response": full_response,
            "user_id": user_id,
            "session_id": session.id,
            "status": "success"
        })

    except Exception as e:
        # Error handling with detailed logging
        error_message = str(e)
        print(f"Error occurred: {error_message}")
        return jsonify({
            "error": "Failed to get response from agent", 
            "details": error_message,
            "status": "error"
        }), 500

@app.route("/chat/stream", methods=["POST"])
def handle_chat_stream():
    """
    Handles streaming chat requests - returns response as it's generated.
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    user_message = data.get("message")
    user_id = data.get("user_id", "local-user")

    if not user_message:
        return jsonify({"error": "Missing 'message' in request body"}), 400

    def generate_response():
        try:
            session = agent_app.create_session(user_id=user_id)
            
            for event in agent_app.stream_query(
                user_id=user_id,
                session_id=session.id,
                message=user_message,
            ):
                if "content" in event and "parts" in event["content"]:
                    for part in event["content"]["parts"]:
                        if "text" in part:
                            yield f"data: {part['text']}\n\n"
            
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            yield f"data: Error: {str(e)}\n\n"

    return app.response_class(
        generate_response(),
        mimetype='text/plain'
    )

if __name__ == "__main__":
    print("=" * 50)
    print("🚀 Master Agent REST API Server")
    print("=" * 50)
    print("Available endpoints:")
    print("  GET  / - Health check")
    print("  POST /chat - Send message to agent")
    print("  POST /chat/stream - Stream response from agent")
    print("=" * 50)
    print("Starting server on http://127.0.0.1:5001")
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    
    # Run the Flask development server
    app.run(debug=True, port=5001, host='127.0.0.1')
