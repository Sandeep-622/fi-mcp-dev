import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  TextField,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material'
import {
  Send as SendIcon,
} from '@mui/icons-material'
import ChatMessage from '../components/ChatMessage'
import { sendMessageToAgent } from '../services/agentService'

function ChatPage({ user, darkMode }) {
  const [prompt, setPrompt] = useState('')
  const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('phoneNumber') || '2222222222')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const isMobile = useMediaQuery('(max-width:600px)')
  const theme = useTheme()
  const navigate = useNavigate()

  const availablePhoneNumbers = [
    "1111111111", "2222222222", "3333333333", "4444444444", 
    "5555555555", "6666666666", "7777777777", "8888888888",
    "9999999999", "1010101010", "1212121212", "1313131313",
    "1414141414", "2020202020", "2121212121", "2525252525",
  ]

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/')
    }
  }, [user, navigate])

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory')
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    } else {
      // Add welcome message if no history
      setMessages([{
        role: 'assistant',
        content: `Hi ${user?.displayName || 'there'}! I'm your Fi financial assistant. I can help you with information about your accounts, investments, and financial status. What would you like to know?`
      }])
    }
  }, [user])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages))
    }
  }, [messages])

  // Scroll to bottom of messages whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle phone number change
  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value)
    localStorage.setItem('phoneNumber', event.target.value)
  }

  // Handle prompt change
  const handlePromptChange = (event) => {
    setPrompt(event.target.value)
  }

  // Handle key press for Enter to send
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (prompt.trim() && !loading) {
        handleSendMessage(event)
      }
    }
  }

  // Send message
  const handleSendMessage = async (event) => {
    event.preventDefault()
    
    if (!prompt.trim()) return
    
    // Add user message to chat
    const userMessage = prompt
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    
    // Clear input
    setPrompt('')
    
    try {
      setLoading(true)
      
      // Call the agent API through our service
      const response = await sendMessageToAgent(userMessage, phoneNumber)
      
      // Add assistant message to chat - don't truncate the response
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error.message
      }])
      
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 64px)',
      backgroundColor: 'background.default'
    }}>
      {/* Mobile phone number select */}
      {isMobile && (
        <Box sx={{ 
          p: 2, 
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="phone-number-mobile-label">Test Profile</InputLabel>
            <Select
              labelId="phone-number-mobile-label"
              id="phone-number-mobile"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              label="Test Profile"
            >
              {availablePhoneNumbers.map((number) => (
                <MenuItem key={number} value={number}>{number}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Chat container */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        px: { xs: 1, sm: 2, md: 4 },
        py: { xs: 2, md: 3 }
      }}>
        <Box sx={{ 
          width: '100%',
          maxWidth: { xs: '100%', sm: '768px', lg: '1024px' },
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}>
          {messages.length === 0 && !loading && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              px: 2
            }}>
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  fontWeight: 300,
                  color: 'text.primary',
                  mb: 2
                }}
              >
                Hello, {user?.displayName?.split(' ')[0] || 'there'}
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ 
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                I'm your personal financial AI assistant. Ask me about your accounts, 
                investments, spending patterns, or any financial insights you'd like to explore.
              </Typography>
            </Box>
          )}
          
          {messages.map((message, index) => (
            <ChatMessage 
              key={index} 
              role={message.role} 
              content={message.content} 
              darkMode={darkMode}
              user={user}
            />
          ))}
          
          {loading && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 2,
              py: 2
            }}>
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                AI
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'text.secondary',
                  animation: 'pulse 1.4s ease-in-out infinite both',
                  '&:nth-of-type(1)': { animationDelay: '-0.32s' },
                  '&:nth-of-type(2)': { animationDelay: '-0.16s' },
                  '@keyframes pulse': {
                    '0%, 80%, 100%': { opacity: 0.3 },
                    '40%': { opacity: 1 }
                  }
                }} />
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'text.secondary',
                  animation: 'pulse 1.4s ease-in-out infinite both',
                  animationDelay: '-0.16s'
                }} />
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'text.secondary',
                  animation: 'pulse 1.4s ease-in-out infinite both'
                }} />
              </Box>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
      </Box>

      {/* Input area */}
      <Box sx={{
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        p: { xs: 2, md: 3 }
      }}>
        <Box sx={{
          maxWidth: { xs: '100%', sm: '768px', lg: '1024px' },
          mx: 'auto'
        }}>
          <Box 
            component="form" 
            onSubmit={handleSendMessage}
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 2,
              backgroundColor: 'background.default',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              p: 1.5,
              '&:focus-within': {
                borderColor: 'primary.main',
                boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`
              },
              transition: 'all 0.2s ease'
            }}
          >
            <TextField
              fullWidth
              variant="standard"
              placeholder="Message Fi MCP..."
              value={prompt}
              onChange={handlePromptChange}
              onKeyDown={handleKeyPress}
              multiline
              maxRows={6}
              disabled={loading}
              InputProps={{
                disableUnderline: true,
              }}
              sx={{ 
                '& .MuiInputBase-input': {
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  '&::placeholder': {
                    color: 'text.secondary',
                    opacity: 1
                  }
                }
              }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              disabled={!prompt.trim() || loading}
              type="submit"
              sx={{ 
                borderRadius: 2,
                minWidth: 44,
                height: 44,
                p: 1,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                },
                '&:disabled': {
                  backgroundColor: 'action.disabled',
                  color: 'action.disabled'
                }
              }}
            >
              <SendIcon fontSize="small" />
            </Button>
          </Box>
          
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              display: 'block',
              textAlign: 'center',
              mt: 2,
              fontSize: '0.75rem'
            }}
          >
            Fi MCP
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default ChatPage
