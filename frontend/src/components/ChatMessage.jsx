import { Box, Typography, Avatar } from '@mui/material'
import { Person as PersonIcon, SmartToy as AIIcon } from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

function ChatMessage({ role, content, darkMode, user }) {
  const isUser = role === 'user'
  
  // Custom renderer for code blocks
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <Box sx={{ 
          mt: 2, 
          borderRadius: 2, 
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: darkMode ? '#0d1117' : '#f8f9fa'
        }}>
          <Box sx={{ 
            px: 2, 
            py: 1, 
            backgroundColor: darkMode ? '#21262d' : '#f1f3f4',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="caption" color="text.secondary">
              {match[1]}
            </Typography>
          </Box>
          <SyntaxHighlighter
            style={darkMode ? tomorrow : oneLight}
            language={match[1]}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '16px',
              backgroundColor: 'transparent',
              fontSize: '0.875rem'
            }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </Box>
      ) : (
        <Box 
          component="code" 
          sx={{
            backgroundColor: darkMode ? '#21262d' : '#f1f3f4',
            color: darkMode ? '#f85149' : '#d73a49',
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
            fontSize: '0.875em',
            border: '1px solid',
            borderColor: darkMode ? '#30363d' : '#e1e4e8'
          }}
          {...props}
        >
          {children}
        </Box>
      )
    },
    p: ({ children }) => (
      <Typography 
        component="p" 
        sx={{ 
          mb: 1.5,
          lineHeight: 1.6,
          '&:last-child': { mb: 0 }
        }}
      >
        {children}
      </Typography>
    ),
    ul: ({ children }) => (
      <Box component="ul" sx={{ ml: 2, mb: 1.5 }}>
        {children}
      </Box>
    ),
    ol: ({ children }) => (
      <Box component="ol" sx={{ ml: 2, mb: 1.5 }}>
        {children}
      </Box>
    ),
    li: ({ children }) => (
      <Typography component="li" sx={{ mb: 0.5, lineHeight: 1.6 }}>
        {children}
      </Typography>
    ),
    h1: ({ children }) => (
      <Typography variant="h5" component="h1" sx={{ mb: 2, fontWeight: 600 }}>
        {children}
      </Typography>
    ),
    h2: ({ children }) => (
      <Typography variant="h6" component="h2" sx={{ mb: 1.5, fontWeight: 600 }}>
        {children}
      </Typography>
    ),
    h3: ({ children }) => (
      <Typography variant="subtitle1" component="h3" sx={{ mb: 1.5, fontWeight: 600 }}>
        {children}
      </Typography>
    ),
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2,
      alignItems: 'flex-start',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      mb: 3
    }}>
      {!isUser && (
        <Avatar sx={{
          width: 32,
          height: 32,
          backgroundColor: darkMode ? '#1a73e8' : '#1976d2',
          color: 'white',
          fontSize: '0.875rem',
          fontWeight: 600,
          flexShrink: 0,
          border: '1px solid',
          borderColor: darkMode ? '#30363d' : '#e8eaed',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
        }}>
          AI
        </Avatar>
      )}
      
      <Box sx={{ 
        maxWidth: { xs: '85%', sm: '80%', md: '75%' },
        minWidth: 0,
        flex: 1
      }}>
        <Box sx={{
          backgroundColor: isUser 
            ? (darkMode ? '#1a73e8' : '#1976d2')
            : 'background.paper',
          color: isUser 
            ? '#ffffff'
            : 'text.primary',
          borderRadius: 3,
          px: 3,
          py: 2,
          wordBreak: 'break-word',
          border: isUser ? 'none' : '1px solid',
          borderColor: isUser ? 'transparent' : 'divider',
          boxShadow: isUser 
            ? (darkMode ? '0 2px 8px rgba(26, 115, 232, 0.3)' : '0 2px 8px rgba(25, 118, 210, 0.3)')
            : '0 1px 3px rgba(0,0,0,0.1)',
          ml: isUser ? 'auto' : 0,
          mr: isUser ? 0 : 'auto',
          maxWidth: '100%'
        }}>
          {isUser ? (
            <Typography sx={{ 
              lineHeight: 1.6,
              fontWeight: 400,
              color: '#ffffff',
              fontSize: '1rem'
            }}>
              {content}
            </Typography>
          ) : (
            <Box sx={{
              '& > *:first-of-type': { mt: 0 },
              '& > *:last-child': { mb: 0 }
            }}>
              <ReactMarkdown components={components}>
                {content}
              </ReactMarkdown>
            </Box>
          )}
        </Box>
      </Box>
      
      {isUser && (
        <Avatar 
          src={user?.photoURL}
          alt={user?.displayName || 'User'}
          sx={{
            width: 32,
            height: 32,
            backgroundColor: darkMode ? '#ea4335' : '#f44336',
            color: 'white',
            flexShrink: 0,
            border: '1px solid',
            borderColor: darkMode ? '#30363d' : '#e8eaed',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}
        >
          {!user?.photoURL && <PersonIcon fontSize="small" />}
        </Avatar>
      )}
    </Box>
  )
}

export default ChatMessage
