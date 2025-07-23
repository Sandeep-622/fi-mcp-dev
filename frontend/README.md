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
   Then edit `.env` file and add your actual Firebase configuration values:
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

This will start the Vite development server (typically on port 5173) and proxy API requests to the Go backend on port 8080.

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

## Integration with Go Backend

The React app communicates with the Go backend through the `/api/query` endpoint. The API expects a JSON payload with the following structure:

```json
{
  "phoneNumber": "2222222222",
  "prompt": "What is my net worth?"
}
```

The API responds with:

```json
{
  "response": "Your net worth is ₹1,250,000."
}
```

## Customization

You can customize the appearance by modifying the theme in `App.jsx` and styles in `App.css`.
