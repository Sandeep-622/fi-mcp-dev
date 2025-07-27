/**
 * Agent API Service
 * Handles communication with the Master Agent REST API
 */

// Use proxy endpoint in development, direct URL in production
const AGENT_API_URL = import.meta.env.DEV 
  ? '/agent'  // Proxied through Vite dev server
  : (import.meta.env.VITE_AGENT_API_URL || 'http://127.0.0.1:5001')

/**
 * Send a message to the agent and get a response
 * @param {string} message - The user's message/prompt
 * @param {string} userId - The user identifier (phone number)
 * @returns {Promise<string>} - The agent's response
 */
export async function sendMessageToAgent(message, userId) {
  try {
    const response = await fetch(`${AGENT_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        user_id: userId
      })
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.response
    
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
      throw new Error('Could not connect to the agent server. Please make sure the agent is running on port 5001.')
    } else {
      throw error
    }
  }
}

/**
 * Check if the agent API is healthy
 * @returns {Promise<boolean>} - True if the API is responding
 */
export async function checkAgentHealth() {
  try {
    const response = await fetch(`${AGENT_API_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    return response.ok
  } catch (error) {
    console.error('Agent health check failed:', error)
    return false
  }
}
