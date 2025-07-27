# Fi MCP React Frontend (Vite)

This is a React-based frontend for the Fi MCP AI Chat application, built with Vite. It provides a modern chat interface for interacting with financial data through the MCP API.

## Features

- Modern chat interface similar to popular AI assistants
- Light and dark mode support
- Mobile-friendly responsive design
- Markdown support for rich text formatting
- Syntax highlighting for code blocks
- Chat history persistence
- Phone number selection for testing different financial profiles

## Development Setup

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

### Installation

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Then edit `.env` file and add your configuration values:
   - `VITE_AGENT_API_URL` - Agent API endpoint (default: http://127.0.0.1:5001)
   - `VITE_FIREBASE_API_KEY` - Your Firebase API key
   - `VITE_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
   - `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID
   - `VITE_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
   - `VITE_FIREBASE_APP_ID` - Your Firebase app ID
   - `VITE_FIREBASE_MEASUREMENT_ID` - Your Firebase measurement ID

4. Start the development server:
   ```
   npm run dev
   ```

**Important**: Make sure the Master Agent API is running on port 5001 before using the chat functionality. The frontend now connects directly to the agent endpoint at `http://127.0.0.1:5001/chat`.

This will start the Vite development server (typically on port 5173).

## Building for Production

To create a production build:

```
npm run build
```

This will create optimized production files in the `dist` directory, which the Go server will serve.

## Project Structure

- `src/App.jsx` - Main application component
- `src/components/` - Reusable React components
  - `ChatMessage.jsx` - Component for rendering chat messages
- `index.html` - HTML entry point for Vite

## Integration with Agent API

The React app communicates directly with the Master Agent REST API running on port 5001. The API expects a JSON payload with the following structure:

```json
{
  "message": "What is my net worth?",
  "user_id": "2222222222"
}
```

The API responds with:

```json
{
  "response": "Your net worth is ₹1,250,000."
}
```

### Agent API Configuration

The agent endpoint URL can be configured via the `VITE_AGENT_API_URL` environment variable. If not set, it defaults to `http://127.0.0.1:5001`.

### Error Handling

The frontend includes comprehensive error handling for:
- Connection failures (agent not running)
- Request timeouts (2-minute timeout for complex queries)
- API errors with detailed status information

## Customization

You can customize the appearance by modifying the theme in `App.jsx` and styles in `App.css`.
