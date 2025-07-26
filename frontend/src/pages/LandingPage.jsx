import { useState } from 'react'
import SessionRequiredCard from '../components/SessionRequiredCard'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  useTheme
} from '@mui/material'
import {
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Chat as ChatIcon,
} from '@mui/icons-material'

function LandingPage({ user, onRequestLogin, onRequestLoginWithRedirect }) {
  const navigate = useNavigate()
  const theme = useTheme()
  const [showSessionCard, setShowSessionCard] = useState(false);

  const features = [
    {
      icon: <AccountBalanceIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Account Overview',
      description: 'Get a comprehensive view of all your financial accounts in one place'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Investment Insights',
      description: 'Track your investments, mutual funds, and stock portfolio performance'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and secure with industry-standard protection'
    },
    {
      icon: <ChatIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'AI Assistant',
      description: 'Ask questions about your finances and get instant, intelligent responses'
    }
  ]

  // Helper: check if sessionId is present and valid in localStorage
  const isSessionValid = () => {
    const sessionId = localStorage.getItem('sessionId');
    // Optionally, add more validation logic here (e.g., expiry)
    return !!sessionId;
  };

  const handleGetStarted = () => {
    if (user) {
      if (isSessionValid()) {
        navigate('/chat');
      } else {
        setShowSessionCard(true);
      }
    } else {
      if (onRequestLogin) {
        onRequestLogin();
      }
    }
  };

  const handleStartChatting = () => {
    if (user) {
      if (isSessionValid()) {
        navigate('/chat');
      } else {
        setShowSessionCard(true);
      }
    } else {
      if (onRequestLoginWithRedirect) {
        onRequestLoginWithRedirect();
      }
    }
  };

  return (
    <Box sx={{ py: 0, minHeight: '100%' }}>
      {showSessionCard && (
        <SessionRequiredCard onAuthenticate={() => {
          setShowSessionCard(false);
          if (onRequestLoginWithRedirect) onRequestLoginWithRedirect();
        }} />
      )}
      <Container maxWidth="lg" sx={{ py: 0 }}>
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: 'center', 
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(220, 0, 78, 0.05) 100%)',
          borderRadius: { xs: 0, md: 3 },
          mb: { xs: 4, md: 8 }
        }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              fontWeight: 300,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              mb: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Your Financial
            <br />
            AI Assistant
          </Typography>
          
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ 
              mb: 6, 
              maxWidth: 600, 
              mx: 'auto',
              fontWeight: 400,
              lineHeight: 1.4,
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}
          >
            Get instant insights about your finances with AI-powered analysis. 
            Track investments, understand spending patterns, and make informed decisions.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {user ? 'Go to Chat Assistant' : 'Get Started'}
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={handleStartChatting}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: 2,
                textTransform: 'none',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Start Chatting Now
            </Button>
          </Box>

          {!user && (
            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
              Sign in with Google to access your personalized financial data
            </Typography>
          )}
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: { xs: 6, md: 10 }, px: { xs: 2, md: 0 } }} data-section="features">
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            sx={{ 
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 400,
              letterSpacing: '-0.01em'
            }}
          >
            Why Choose Fi MCP?
          </Typography>
          
          <Typography
            variant="body1"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}
          >
            Powerful features designed to give you complete control over your financial data
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box sx={{ mb: 2, color: 'primary.main' }}>
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    gutterBottom
                    sx={{ fontWeight: 500, mb: 1.5 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            p: { xs: 4, md: 8 },
            textAlign: 'center',
            backgroundColor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            mx: { xs: 2, md: 0 }
          }}
        >
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '1.75rem', md: '2rem' },
              fontWeight: 400,
              mb: 3
            }}
          >
            Ready to get started?
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              mb: 4, 
              maxWidth: 600, 
              mx: 'auto',
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}
          >
            Join thousands of users who trust Fi MCP for their financial insights. 
            Get personalized analysis and make smarter financial decisions.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleStartChatting}
              sx={{ 
                minWidth: 200,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Start Chatting Now
            </Button>
            
            <Button
              variant="text"
              size="large"
              onClick={() => {
                document.querySelector('[data-section="features"]')?.scrollIntoView({ behavior: 'smooth' })
              }}
              sx={{ 
                minWidth: 200,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              Learn More
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default LandingPage
