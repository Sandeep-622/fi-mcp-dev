import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  Box
} from '@mui/material'
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material'
import GoogleLogin from './GoogleLogin'
import LandingPage from '../pages/LandingPage'
import ChatPage from '../pages/ChatPage'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

function Layout({ darkMode, toggleDarkMode }) {
  const [user, setUser] = useState(null)
  const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('phoneNumber') || '2222222222')
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [shouldRedirectAfterLogin, setShouldRedirectAfterLogin] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMediaQuery('(max-width:600px)')

  const availablePhoneNumbers = [
    "1111111111", "2222222222", "3333333333", "4444444444", 
    "5555555555", "6666666666", "7777777777", "8888888888",
    "9999999999", "1010101010", "1212121212", "1313131313",
    "1414141414", "2020202020", "2121212121", "2525252525",
  ]

  // Handle phone number change
  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value)
    localStorage.setItem('phoneNumber', event.target.value)
  }

  // Handle opening login modal
  const handleOpenLoginModal = () => {
    setShouldRedirectAfterLogin(false)
    setLoginModalOpen(true)
  }

  // Handle opening login modal with redirect to chat after login
  const handleOpenLoginModalWithRedirect = () => {
    setShouldRedirectAfterLogin(true)
    setLoginModalOpen(true)
  }

  // Handle closing login modal
  const handleCloseLoginModal = () => {
    setLoginModalOpen(false)
  }

  // Handle successful login
  const handleLoginSuccess = () => {
    setLoginModalOpen(false)
    if (shouldRedirectAfterLogin) {
      navigate('/chat')
    }
    setShouldRedirectAfterLogin(false) // Reset the flag
  }

  // Load user from localStorage and set up auth state listener
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        setUser(null)
        localStorage.removeItem('user')
        // Redirect to landing page on logout
        if (location.pathname === '/chat') {
          navigate('/')
        }
      }
    })

    return () => unsubscribe()
  }, [navigate, location.pathname])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ py: 1 }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '1.25rem',
              '&:hover': {
                opacity: 0.8
              },
              transition: 'opacity 0.2s ease'
            }}
            onClick={() => navigate('/')}
          >
            Fi MCP
          </Typography>
          
          {!isMobile && location.pathname === '/chat' && (
            <FormControl variant="outlined" size="small" sx={{ 
              minWidth: 180, 
              mr: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}>
              <InputLabel id="phone-number-label" sx={{ fontSize: '0.875rem' }}>
                Test Profile
              </InputLabel>
              <Select
                labelId="phone-number-label"
                id="phone-number"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                label="Test Profile"
                sx={{ fontSize: '0.875rem' }}
              >
                {availablePhoneNumbers.map((number) => (
                  <MenuItem key={number} value={number}>{number}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          <GoogleLogin 
            user={user} 
            setUser={setUser} 
            isModalOpen={loginModalOpen}
            onCloseModal={handleCloseLoginModal}
            onLoginSuccess={handleLoginSuccess}
            onRequestLogin={handleOpenLoginModal}
          />
          
          <IconButton 
            color="inherit" 
            onClick={toggleDarkMode} 
            sx={{ 
              ml: 1,
              borderRadius: 2,
              p: 1,
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Routes>
          <Route 
            path="/" 
            element={
              <LandingPage 
                user={user} 
                onRequestLogin={handleOpenLoginModal}
                onRequestLoginWithRedirect={handleOpenLoginModalWithRedirect}
              />
            } 
          />
          <Route 
            path="/chat" 
            element={
              user ? (
                <ChatPage user={user} darkMode={darkMode} phoneNumber={phoneNumber} />
              ) : (
                <LandingPage 
                  user={user} 
                  onRequestLogin={handleOpenLoginModal}
                  onRequestLoginWithRedirect={handleOpenLoginModalWithRedirect}
                />
              )
            } 
          />
        </Routes>
      </Box>
    </Box>
  )
}

export default Layout