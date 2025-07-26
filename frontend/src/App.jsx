import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'

function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true')

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    localStorage.setItem('darkMode', !darkMode)
  }

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#a8c7fa' : '#1a73e8',
        light: darkMode ? '#c3d9ff' : '#4285f4',
        dark: darkMode ? '#8ab4f8' : '#1557b0',
      },
      secondary: {
        main: darkMode ? '#f8bbd9' : '#ea4335',
        light: darkMode ? '#ffcdd2' : '#fb7c6b',
        dark: darkMode ? '#f48fb1' : '#c23321',
      },
      background: {
        default: darkMode ? '#0d1117' : '#fafafa',
        paper: darkMode ? '#161b22' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#f0f6fc' : '#202124',
        secondary: darkMode ? '#9ca3af' : '#5f6368',
      },
      divider: darkMode ? '#30363d' : '#e8eaed',
      action: {
        hover: darkMode ? 'rgba(177, 186, 196, 0.08)' : 'rgba(60, 64, 67, 0.08)',
      }
    },
    typography: {
      fontFamily: '"Google Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 300,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 400,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontWeight: 400,
        letterSpacing: '-0.01em',
      },
      h4: {
        fontWeight: 400,
      },
      h5: {
        fontWeight: 400,
      },
      h6: {
        fontWeight: 500,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#161b22' : '#ffffff',
            color: darkMode ? '#f0f6fc' : '#202124',
            boxShadow: darkMode 
              ? '0 1px 3px rgba(0,0,0,0.3)' 
              : '0 1px 3px rgba(60,64,67,0.15)',
            borderBottom: `1px solid ${darkMode ? '#30363d' : '#e8eaed'}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
          },
          contained: {
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: darkMode 
              ? '0 1px 3px rgba(0,0,0,0.3)' 
              : '0 1px 3px rgba(60,64,67,0.15)',
            border: `1px solid ${darkMode ? '#30363d' : '#e8eaed'}`,
          },
        },
      },
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
