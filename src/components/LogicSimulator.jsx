import React, { useState, useEffect } from 'react';
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Paper,
  TextField,
  Alert,
  IconButton,
  Tooltip,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

import CPUExplanation from './CPUExplanation';
import LogicDiagram from './LogicDiagram';
import ExecutionVisualizer from './ExecutionVisualizer';
import MemoryRegisterSimulation from './MemoryRegisterSimulation';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e',
    },
    secondary: {
      main: '#4caf50',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const LogicSimulator = () => {
  const navigate = useNavigate();
  const [expression, setExpression] = useState('');
  const [variables, setVariables] = useState([]);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const validOperators = ['and', 'or', 'not', 'nand', 'nor', 'xor', 'xnor'];

  const extractVariables = (expr) => {
    // First split by spaces and operators to get potential variable tokens
    const tokens = expr.toLowerCase()
      .replace(/\(/g, ' ( ')
      .replace(/\)/g, ' ) ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  
    const vars = new Set();
    
    for (const token of tokens) {
      // Skip operators and parentheses
      if (validOperators.includes(token) || token === '(' || token === ')') {
        continue;
      }
      
      // Check if token is a single letter variable
      if (/^[a-z]$/.test(token)) {
        vars.add(token.toUpperCase());
      } else {
        // If we find any multi-character token that's not an operator, it's invalid
        return { variables: [], invalidVariable: token };
      }
    }
  
    return { variables: Array.from(vars).sort(), invalidVariable: null };
  };
  
  const validateExpression = (expr) => {
    if (!expr.trim()) {
      setError('');
      setIsValid(false);
      return;
    }

    const tokens = expr.toLowerCase()
      .replace(/\(/g, ' ( ')
      .replace(/\)/g, ' ) ')
      .split(/\s+/)
      .filter(token => token.length > 0);

    if (tokens.length === 0) {
      setError('Expression cannot be empty');
      setIsValid(false);
      return;
    }

    // Check for valid variables (must be single letters)
    for (const token of tokens) {
      if (!validOperators.includes(token) && token !== '(' && token !== ')') {
        if (!/^[a-z]$/.test(token)) {
          setError(`Invalid variable "${token}". Variables must be single letters.`);
          setIsValid(false);
          return;
        }
      }
    }

    let parenCount = 0;
    for (const token of tokens) {
      if (token === '(') parenCount++;
      if (token === ')') parenCount--;
      if (parenCount < 0) {
        setError('Mismatched parentheses');
        setIsValid(false);
        return;
      }
    }
    if (parenCount !== 0) {
      setError('Mismatched parentheses');
      setIsValid(false);
      return;
    }

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (validOperators.includes(token)) {
        if (token === 'not') {
          if (i === tokens.length - 1 || validOperators.includes(tokens[i + 1])) {
            setError("'NOT' must be followed by a variable or '('");
            setIsValid(false);
            return;
          }
        } else {
          if (i === 0 || i === tokens.length - 1) {
            setError(`Binary operator '${token.toUpperCase()}' requires two operands`);
            setIsValid(false);
            return;
          }
          if (validOperators.includes(tokens[i - 1]) || validOperators.includes(tokens[i + 1])) {
            setError(`Invalid operator placement near '${token.toUpperCase()}'`);
            setIsValid(false);
            return;
          }
        }
      }
    }

    setError('');
    setIsValid(true);
  };

  const handleExpressionChange = (event) => {
    const newExpression = event.target.value;
    setExpression(newExpression);
    validateExpression(newExpression);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    if (isValid && expression) {
      const result = extractVariables(expression);
      if (result.invalidVariable) {
        setError(`Invalid variable "${result.invalidVariable}". Variables must be single letters.`);
        setIsValid(false);
        setVariables([]);
      } else {
        setVariables(result.variables);
      }
    } else {
      setVariables([]);
    }
  }, [expression, isValid]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" color="primary" elevation={4}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate('/')}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Logic Gate VM - Simulator
            </Typography>
          </Toolbar>
        </AppBar>

        <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Enter Logic Expression"
                variant="outlined"
                value={expression}
                onChange={handleExpressionChange}
                error={!!error}
                helperText={error || "Use single letter variables only (A, B, C...)"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Examples: 'A AND B', 'NOT A OR B', '(A AND B) OR (C AND D)'">
                        <IconButton size="small">
                          <HelpOutlineIcon />
                        </IconButton>
                      </Tooltip>
                      {expression && (
                        isValid ? (
                          <Tooltip title="Valid Expression">
                            <CheckCircleOutlineIcon color="success" />
                          </Tooltip>
                        ) : (
                          <Tooltip title={error || "Invalid Expression"}>
                            <ErrorOutlineIcon color="error" />
                          </Tooltip>
                        )
                      )}
                    </InputAdornment>
                  ),
                }}
              />
              {isValid && variables.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Variables detected: {variables.join(', ')}
                </Typography>
              )}
            </Box>

            {!isValid ? (
              <Alert severity="info">
                Enter a valid logic expression to access the simulator.
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Valid operators: AND, OR, NOT, NAND, NOR, XOR, XNOR
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Variables must be single letters (A, B, C, etc.)
                </Typography>
              </Alert>
            ) : (
              <>
                <Tabs value={tabIndex} onChange={handleTabChange} textColor="primary" indicatorColor="primary" variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
                  <Tab label="Logic Diagram" disabled={!isValid} />
                  <Tab label="CPU Explanation" disabled={!isValid} />
                  <Tab label="Execution Visualizer" disabled={!isValid} />
                  <Tab label="Memory & Registers" disabled={!isValid} />
                </Tabs>

                {tabIndex === 0 && <LogicDiagram expression={expression} variables={variables} />}
                {tabIndex === 1 && <CPUExplanation expression={expression} variables={variables} />}
                {tabIndex === 2 && <ExecutionVisualizer expression={expression} variables={variables} />}
                {tabIndex === 3 && <MemoryRegisterSimulation expression={expression} variables={variables} />}
              </>
            )}
          </Paper>
        </Container>

        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[200]
                : theme.palette.grey[800],
          }}
        >
          <Container maxWidth="sm">
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Logic Gate VM - A Visual Logic Circuit Generator
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default LogicSimulator;