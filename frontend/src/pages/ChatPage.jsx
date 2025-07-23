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

  // Send message
  const handleSendMessage = async (event) => {
    event.preventDefault()
    
    if (!prompt.trim()) return
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: prompt }])
    
    // Clear input
    setPrompt('')
    
    try {
      setLoading(true)
      
      // Call the API
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          prompt: prompt
        })
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Add assistant message to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I encountered an error: ${error.message}. Please try again later.`
      }])
      
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Mobile phone number select */}
      {isMobile && (
        <Box sx={{ p: 1, backgroundColor: theme.palette.background.paper }}>
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="phone-number-mobile-label">Phone Number</InputLabel>
            <Select
              labelId="phone-number-mobile-label"
              id="phone-number-mobile"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              label="Phone Number"
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
        p: 2,
        backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
      }}>
        <Container maxWidth="md" sx={{ mb: 2 }}>
          {messages.map((message, index) => (
            <ChatMessage 
              key={index} 
              role={message.role} 
              content={message.content} 
              darkMode={darkMode}
            />
          ))}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Container>
      </Box>

      {/* Input area */}
      <Paper 
        elevation={3} 
        component="form" 
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask something about your finances..."
          value={prompt}
          onChange={handlePromptChange}
          multiline
          maxRows={4}
          disabled={loading}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            }
          }}
        />
        <Button 
          variant="contained" 
          color="primary" 
          endIcon={<SendIcon />}
          disabled={!prompt.trim() || loading}
          type="submit"
          sx={{ 
            borderRadius: '12px',
            height: '56px',
            px: 3,
            minWidth: { xs: '56px', sm: '120px' },
            '& .MuiButton-endIcon': {
              display: { xs: 'none', sm: 'flex' }
            }
          }}
        >
          {isMobile ? <SendIcon /> : 'Send'}
        </Button>
      </Paper>
    </Box>
  )
}

export default ChatPage
