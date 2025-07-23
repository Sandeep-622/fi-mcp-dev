import { useState } from 'react'
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

  const handleGetStarted = () => {
    if (user) {
      navigate('/chat')
    } else {
      // Trigger login modal, stay on landing page after login
      if (onRequestLogin) {
        onRequestLogin()
      }
    }
  }

  const handleStartChatting = () => {
    if (user) {
      navigate('/chat')
    } else {
      // Trigger login modal, redirect to chat after login
      if (onRequestLoginWithRedirect) {
        onRequestLoginWithRedirect()
      }
    }
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 3
            }}
          >
            Your Personal Financial AI Assistant
          </Typography>
          
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
          >
            Get instant insights about your finances, track investments, and make informed decisions 
            with the power of AI
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.2rem',
              borderRadius: 3,
              boxShadow: 3,
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {user ? 'Go to Chat Assistant' : 'Get Started'}
          </Button>

          {!user && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Sign in with Google to access your personalized financial data
            </Typography>
          )}
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Why Choose Fi MCP?
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Demo Section */}
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
            borderRadius: 3
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to Transform Your Financial Management?
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            Join thousands of users who are already using Fi MCP to better understand and manage their finances. 
            Our AI-powered assistant provides personalized insights tailored to your financial profile.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleStartChatting}
              sx={{ minWidth: 200 }}
            >
              Start Chatting Now
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}
              sx={{ minWidth: 200 }}
            >
              Learn More
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default LandingPage
