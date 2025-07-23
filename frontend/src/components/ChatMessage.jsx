import { Paper, Box, Typography } from '@mui/material'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow, prism } from 'react-syntax-highlighter/dist/esm/styles/prism'

function ChatMessage({ role, content, darkMode }) {
  const isUser = role === 'user'
  
  // Determine message styling based on role and dark mode
  const messageClass = isUser 
    ? 'chat-message user-message' 
    : `chat-message assistant-message ${darkMode ? 'dark-assistant-message' : ''}`
  
  // Custom renderer for code blocks
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <Box className="code-block">
          <Box className="code-header">
            <Typography variant="caption">{match[1]}</Typography>
          </Box>
          <SyntaxHighlighter
            style={darkMode ? tomorrow : prism}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </Box>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
  }

  return (
    <Paper 
      elevation={1} 
      className={messageClass}
      sx={{
        p: 0,
        maxWidth: '85%',
        mb: 2,
        ml: isUser ? 'auto' : 0,
        mr: isUser ? 0 : 'auto',
        bgcolor: isUser 
          ? 'primary.main' 
          : (darkMode ? 'grey.800' : 'grey.100'),
        color: isUser 
          ? 'white' 
          : 'text.primary',
        borderRadius: isUser 
          ? '18px 18px 4px 18px' 
          : '18px 18px 18px 4px',
      }}
    >
      <Box className="message-content" sx={{ p: 2 }}>
        {isUser ? (
          <Typography>{content}</Typography>
        ) : (
          <ReactMarkdown components={components}>
            {content}
          </ReactMarkdown>
        )}
      </Box>
    </Paper>
  )
}

export default ChatMessage
