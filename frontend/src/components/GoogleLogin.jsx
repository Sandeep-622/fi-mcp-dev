import { useState } from 'react'
import {
  Button,
  Modal,
  Paper,
  Box,
  Typography,
  Avatar,
  IconButton,
  Fade,
  Chip,
  CircularProgress,
  useTheme
} from '@mui/material'
import {
  Google as GoogleIcon,
  Logout as LogoutIcon,
  Close,
  Person as PersonIcon
} from '@mui/icons-material'
import { signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

function GoogleLogin({ user, setUser, onLogout, isModalOpen, onCloseModal, onLoginSuccess, onRequestLogin }) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const theme = useTheme()

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
      localStorage.setItem('user', JSON.stringify(userData))

      // Redirect to mockWebPage with sessionId 'temp1'
      window.location.href = `http://localhost:8080/mockWebPage?sessionId=temp1`
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
        onClick={() => {
          if (onRequestLogin) {
            // Use external login handler when available
            onRequestLogin()
          } else {
            // Use internal modal control
            setOpen(true)
          }
        }}
        startIcon={<GoogleIcon />}
      >
        Login
      </Button>

      <Modal
        open={isModalOpen !== undefined ? isModalOpen : open}
        onClose={() => {
          setOpen(false)
          if (onCloseModal) {
            onCloseModal()
          }
        }}
        aria-labelledby="google-login-modal"
        aria-describedby="google-login-description"
        closeAfterTransition
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <Fade in={isModalOpen !== undefined ? isModalOpen : open}>
          <Paper
            elevation={24}
            sx={{
              position: 'relative',
              width: { xs: '90%', sm: '450px' },
              maxWidth: '450px',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderRadius: '24px',
              border: theme.palette.mode === 'dark'
                ? '1px solid #333'
                : '1px solid #e8eaed',
              overflow: 'hidden',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                : '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                padding: '24px 24px 16px',
                position: 'relative',
              }}
            >
              <IconButton
                onClick={() => {
                  setOpen(false)
                  if (onCloseModal) {
                    onCloseModal()
                  }
                }}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  color: theme.palette.mode === 'dark' ? '#e8eaed' : '#3c4043',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  },
                  width: 32,
                  height: 32,
                }}
                size="small"
              >
                <Close fontSize="small" />
              </IconButton>

              <Typography
                variant="h5"
                sx={{
                  color: theme.palette.mode === 'dark' ? '#e8eaed' : '#3c4043',
                  fontWeight: 600,
                  fontFamily: '"Google Sans", "Helvetica Neue", sans-serif',
                  fontSize: '24px',
                  lineHeight: 1.2,
                  textAlign: 'center',
                  pr: 4,
                }}
              >
                Sign in to continue
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.mode === 'dark' ? '#9aa0a6' : '#5f6368',
                  fontFamily: '"Google Sans", "Helvetica Neue", sans-serif',
                  fontSize: '14px',
                  textAlign: 'center',
                  mt: 1,
                  pr: 4,
                }}
              >
                Access your personalized financial assistant
              </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ padding: '32px' }}>
              {/* Sign in button */}
              <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                fullWidth
                variant="outlined"
                size="large"
                sx={{
                  borderRadius: '12px',
                  padding: '14px 20px',
                  textTransform: 'none',
                  fontFamily: '"Google Sans", "Helvetica Neue", sans-serif',
                  fontSize: '16px',
                  fontWeight: 500,
                  border: theme.palette.mode === 'dark'
                    ? '2px solid #333'
                    : '2px solid #dadce0',
                  color: theme.palette.mode === 'dark' ? '#e8eaed' : '#3c4043',
                  backgroundColor: 'transparent',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: theme.palette.mode === 'dark' ? '#4285f4' : '#4285f4',
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(66, 133, 244, 0.08)'
                      : 'rgba(66, 133, 244, 0.04)',
                    transform: 'translateY(-1px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 4px 12px rgba(66, 133, 244, 0.2)'
                      : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  },
                  '&:disabled': {
                    opacity: 0.6,
                    transform: 'none',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={20}
                    sx={{
                      color: theme.palette.mode === 'dark' ? '#4285f4' : '#4285f4',
                      mr: 1
                    }}
                  />
                ) : (
                  <svg
                    width="50"
                    height="50"
                    viewBox="0 0 24 24"
                    style={{ marginRight: '28px' }}
                  >
                    <path
                      fill="#4285f4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34a853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#fbbc04"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#ea4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>

              {/* Footer text */}
              <Typography
                variant="body2"
                sx={{
                  textAlign: 'center',
                  mt: 3,
                  color: theme.palette.mode === 'dark' ? '#9aa0a6' : '#5f6368',
                  fontFamily: '"Google Sans", "Helvetica Neue", sans-serif',
                  fontSize: '12px',
                  lineHeight: 1.4,
                }}
              >
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Modal>
    </>
  )
}

export default GoogleLogin
