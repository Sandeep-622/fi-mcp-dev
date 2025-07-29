# Google Authentication Setup Guide

This guide will help you set up Google authentication for your Fi MCP Chat application.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "fi-mcp-chat")
4. Follow the setup wizard to create your project

## Step 2: Enable Authentication

1. In your Firebase project console, click on "Authentication" in the left sidebar
2. Click on the "Sign-in method" tab
3. Click on "Google" from the list of providers
4. Toggle the "Enable" switch
5. Select a support email for your project
6. Click "Save"

## Step 3: Get Firebase Configuration

1. In your Firebase project console, click on the gear icon (Project settings)
2. Scroll down to "Your apps" section
3. Click on the web icon (</>) to add a web app
4. Register your app with a nickname (e.g., "fi-mcp-web")
5. Copy the Firebase configuration object

## Step 4: Configure Your Application

1. Create a `.env` file in your frontend directory by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Replace the values in `.env` with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your-actual-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

## Step 5: Configure Google OAuth (Optional)

For Google Identity Services (One Tap sign-in):

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project or create a new one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen if prompted
6. Select "Web application" as the application type
7. Add your domain to authorized origins (e.g., `http://localhost:5173` for development)
8. Copy the Client ID and add it to your `.env` file:
   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id.googleusercontent.com
   ```

## Step 6: Install Dependencies and Run

1. Install the required packages:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Features

Once configured, your application will have:

- **Firebase Authentication**: Full authentication with Google accounts
- **Google One Tap**: Quick sign-in with Google Identity Services
- **User Session Persistence**: User stays logged in across browser sessions
- **User Profile Display**: Shows user avatar and name in the header
- **Secure Logout**: Properly signs out users and clears session data

## Security Notes

- Never commit your `.env` file to version control
- Use different Firebase projects for development and production
- Configure proper authorized domains in production
- Consider implementing additional security rules based on authenticated users

## Troubleshooting

- Make sure your domain is added to Firebase authorized domains
- Check browser console for any authentication errors
- Verify all environment variables are properly set
- Ensure Firebase project has Authentication enabled
