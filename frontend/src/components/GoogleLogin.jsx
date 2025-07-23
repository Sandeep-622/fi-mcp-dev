import { useState } from 'react'
import { 
  Button, 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  Box, 
  Typography,
  Avatar,
  Chip
} from '@mui/material'
import { Google as GoogleIcon, Logout as LogoutIcon } from '@mui/icons-material'
import { signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

function GoogleLogin({ user, setUser, onLogout }) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }
      
      setUser(userData)
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData))
      
      setOpen(false)
    } catch (error) {
      console.error('Error signing in with Google:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      localStorage.removeItem('user')
      
      if (onLogout) {
        onLogout()
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleGoogleLoginWithGSI = () => {
    // Alternative approach using Google Identity Services directly
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id.googleusercontent.com',
        callback: handleCredentialResponse
      })
      
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { 
          theme: 'outline', 
          size: 'large',
          width: 250
        }
      )
      
      window.google.accounts.id.prompt()
    }
  }

  const handleCredentialResponse = (response) => {
    // Decode the JWT token to get user information
    const decoded = JSON.parse(atob(response.credential.split('.')[1]))
    
    const userData = {
      uid: decoded.sub,
      email: decoded.email,
      displayName: decoded.name,
      photoURL: decoded.picture
    }
    
    setUser(userData)
    
    localStorage.setItem('user', JSON.stringify(userData))
    
    setOpen(false)
  }

  if (user) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          avatar={<Avatar src={user.photoURL} alt={user.displayName} />}
          label={user.displayName || user.email}
          variant="outlined"
          sx={{ color: 'inherit' }}
        />
        <Button
          color="inherit"
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          size="small"
        >
          Logout
        </Button>
      </Box>
    )
  }

  return (
    <>
      <Button
        color="inherit"
        onClick={() => setOpen(true)}
        startIcon={<GoogleIcon />}
      >
        Login
      </Button>
      
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" textAlign="center">
            Sign in to Fi MCP Chat
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 3,
            py: 2
          }}>
            <Typography variant="body1" textAlign="center" color="text.secondary">
              Sign in with your Google account to access your personalized financial data
            </Typography>
            
            {/* Firebase Auth Button */}
            <Button
              variant="outlined"
              onClick={handleGoogleLogin}
              disabled={loading}
              startIcon={<GoogleIcon />}
              sx={{ 
                minWidth: 250,
                py: 1.5,
                borderColor: '#4285f4',
                color: '#4285f4',
                '&:hover': {
                  borderColor: '#3367d6',
                  backgroundColor: 'rgba(66, 133, 244, 0.04)'
                }
              }}
            >
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>
            
            {/* Alternative: Google Identity Services Button */}
            <Box>
              <Typography variant="caption" display="block" textAlign="center" mb={1}>
                Or use Google One Tap:
              </Typography>
              <div id="google-signin-button"></div>
              <Button
                variant="text"
                onClick={handleGoogleLoginWithGSI}
                size="small"
              >
                Enable One Tap Sign-in
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default GoogleLogin
