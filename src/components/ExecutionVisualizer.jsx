import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  ButtonGroup,
  IconButton,
  Tooltip,
  Divider,
  Stack
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import InfoIcon from '@mui/icons-material/Info';

// Helper function to parse a logic expression
const parseExpression = (expression) => {
  // Normalize the expression
  let normalizedExpression = expression.replace(/\s+/g, '').toLowerCase()
    .replace(/&&/g, 'and')
    .replace(/\|\|/g, 'or')
    .replace(/!/g, 'not');
  
  // Track all variables and operations
  const variables = new Set();
  const operations = [];
  let tempVarCounter = 0;
  
  // Helper to generate temporary variable names for intermediate results
  const getTempVar = () => `_t${tempVarCounter++}`;
  
  // Helper to add an operation and return its output variable name
  const addOperation = (type, inputs) => {
    const output = getTempVar();
    operations.push({ type, inputs, output });
    return output;
  };
  
  // Tokenize the expression
  const tokenize = (expr) => {
    const tokens = [];
    let pos = 0;
    
    while (pos < expr.length) {
      if (expr.startsWith('not', pos)) {
        tokens.push({ type: 'NOT', value: 'not' });
        pos += 3;
      } else if (expr.startsWith('and', pos)) {
        tokens.push({ type: 'AND', value: 'and' });
        pos += 3;
      } else if (expr.startsWith('or', pos)) {
        tokens.push({ type: 'OR', value: 'or' });
        pos += 2;
      } else if (expr[pos] === '(') {
        tokens.push({ type: 'LPAREN', value: '(' });
        pos++;
      } else if (expr[pos] === ')') {
        tokens.push({ type: 'RPAREN', value: ')' });
        pos++;
      } else if (/[a-z]/.test(expr[pos])) {
        const variable = expr[pos];
        tokens.push({ type: 'VAR', value: variable });
        variables.add(variable);
        pos++;
      } else {
        pos++;
      }
    }
    return tokens;
  };
  
  // Parse tokens into an operation tree
  const parse = (tokens) => {
    let pos = 0;
    
    const parseAtom = () => {
      if (pos >= tokens.length) return null;
      
      const token = tokens[pos];
      
      if (token.type === 'VAR') {
        pos++;
        return token.value;
      }
      
      if (token.type === 'NOT') {
        pos++;
        const operand = parseAtom();
        return addOperation('NOT', [operand]);
      }
      
      if (token.type === 'LPAREN') {
        pos++;
        const result = parseExpression();
        if (pos < tokens.length && tokens[pos].type === 'RPAREN') {
          pos++;
          return result;
        }
      }
      
      return null;
    };
    
    const parseAnd = () => {
      let left = parseAtom();
      
      while (pos < tokens.length && tokens[pos].type === 'AND') {
        pos++;
        const right = parseAtom();
        left = addOperation('AND', [left, right]);
      }
      
      return left;
    };
    
    const parseExpression = () => {
      let left = parseAnd();
      
      while (pos < tokens.length && tokens[pos].type === 'OR') {
        pos++;
        const right = parseAnd();
        left = addOperation('OR', [left, right]);
      }
      
      return left;
    };
    
    return parseExpression();
  };
  
  // Tokenize and parse the expression
  const tokens = tokenize(normalizedExpression);
  parse(tokens);
  
  // Sort operations to ensure proper evaluation order (NOT before AND before OR)
  operations.sort((a, b) => {
    const precedence = { 'NOT': 0, 'AND': 1, 'OR': 2 };
    return precedence[a.type] - precedence[b.type];
  });
  
  return {
    variables: [...variables],
    operations: operations
  };
};

// Dynamic circuit component that renders based on the parsed expression
const DynamicCircuit = ({ expression, variables, operations, highlightedComponents, animationProgress }) => {
  // Calculate positions for the circuit elements
  const inputX = 50;
  const gateStartX = 200;
  const gateWidth = 60;
  const gateSpacing = 100;
  const outputX = gateStartX + ((operations.length || 1) * gateSpacing);
  
  // Calculate vertical positions
  const baseY = 100;
  const verticalGap = 60;
  
  // Create mapping for connections
  const connectionMap = useMemo(() => {
    const map = {};
    
    // Map each variable to its initial position
    variables.forEach((v, i) => {
      map[v] = { x: inputX, y: baseY + i * verticalGap };
    });
    
    // Map each operation output to its position
    operations.forEach((op, i) => {
      // Position gates centered between their inputs
      const inputPositions = op.inputs.map(input => {
        if (map[input]) return map[input].y;
        // If input is from another operation, use its stored position
        return baseY + Math.floor(variables.length / 2) * verticalGap;
      });
      
      const avgY = inputPositions.length > 0 
        ? inputPositions.reduce((a, b) => a + b, 0) / inputPositions.length 
        : baseY + Math.floor(variables.length / 2) * verticalGap;
      
      const x = gateStartX + i * gateSpacing + gateWidth / 2;
      const y = avgY;
      map[op.output] = { x, y };
    });
    
    return map;
  }, [variables, operations, baseY, verticalGap]);
  
  // Function to determine if a component should be highlighted
  const isHighlighted = (id) => highlightedComponents.includes(id);
  
  // Function to calculate animation state for elements
  const getAnimationStyle = (id) => {
    if (!isHighlighted(id)) return {};
    
    return {
      opacity: animationProgress,
      transform: `scale(${0.8 + 0.2 * animationProgress})`,
      transition: 'all 0.5s ease-in-out'
    };
  };

  return (
    <Box sx={{ border: '1px solid #ccc', p: 2, mb: 2, borderRadius: 2, bgcolor: '#fafafa' }}>
      <svg width="100%" height={baseY + (variables.length + 1) * verticalGap} 
           viewBox={`0 0 ${outputX + 100} ${baseY + (variables.length + 1) * verticalGap}`}>
        
        {/* Background grid for better visualization */}
        <defs>
          <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f0f0f0" strokeWidth="0.5"/>
          </pattern>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#smallGrid)"/>
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#e0e0e0" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Input variables */}
        {variables.map((v, i) => (
          <g key={`input_${v}`} style={getAnimationStyle(`input_${v}`)}>
            <circle 
              cx={inputX} 
              cy={baseY + i * verticalGap} 
              r="20" 
              fill={isHighlighted(`input_${v}`) ? "#4caf50" : "#bbb"} 
              opacity={isHighlighted(`input_${v}`) ? 1 : 0.7}
              stroke="#666"
              strokeWidth="1"
            />
            <text 
              x={inputX} 
              y={baseY + i * verticalGap + 5} 
              textAnchor="middle" 
              fill="#fff" 
              fontSize="14"
              fontWeight="bold"
            >
              {v.toUpperCase()}
            </text>
            <text
              x={inputX}
              y={baseY + i * verticalGap + 30}
              textAnchor="middle"
              fill="#333"
              fontSize="12"
            >
              Input {v.toUpperCase()}
            </text>
          </g>
        ))}
        
        {/* Logic gates */}
        {operations.map((op, i) => {
          const x = gateStartX + i * gateSpacing;
          
          // Calculate position based on inputs
          const inputPositions = op.inputs.map(input => {
            if (connectionMap[input]) return connectionMap[input].y;
            return baseY + Math.floor(variables.length / 2) * verticalGap;
          });
          
          const y = inputPositions.length > 0 
            ? inputPositions.reduce((a, b) => a + b, 0) / inputPositions.length 
            : baseY + Math.floor(variables.length / 2) * verticalGap;
          
          return (
            <g key={`gate_${op.type}_${i}`} style={getAnimationStyle(`gate_${op.type}_${i}`)}>
              <rect 
                x={x} 
                y={y - 20} 
                width={gateWidth} 
                height="40" 
                rx="5" 
                fill={isHighlighted(`gate_${op.type}_${i}`) ? "#4caf50" : "#999"}
                opacity={isHighlighted(`gate_${op.type}_${i}`) ? 1 : 0.7}
                stroke="#666"
                strokeWidth="1"
              />
              <text 
                x={x + gateWidth/2} 
                y={y + 5} 
                textAnchor="middle" 
                fill="#fff" 
                fontSize="14"
                fontWeight="bold"
              >
                {op.type}
              </text>
            </g>
          );
        })}
        
        {/* Output */}
        <g key="output" style={getAnimationStyle("output")}>
          <circle 
            cx={outputX} 
            cy={baseY + Math.floor(variables.length / 2) * verticalGap} 
            r="20" 
            fill={isHighlighted("output") ? "#4caf50" : "#bbb"}
            opacity={isHighlighted("output") ? 1 : 0.7}
            stroke="#666"
            strokeWidth="1"
          />
          <text 
            x={outputX} 
            y={baseY + Math.floor(variables.length / 2) * verticalGap + 5} 
            textAnchor="middle" 
            fill="#fff" 
            fontSize="14"
            fontWeight="bold"
          >
            OUT
          </text>
        </g>
        
        {/* Wires/connections from inputs to gates */}
        {operations.map((op, i) => {
          const gateX = gateStartX + i * gateSpacing;
          const gateInputs = op.inputs;
          
          // Calculate gate position based on inputs
          const inputPositions = op.inputs.map(input => {
            if (connectionMap[input]) return connectionMap[input].y;
            return baseY + Math.floor(variables.length / 2) * verticalGap;
          });
          
          const gateY = inputPositions.length > 0 
            ? inputPositions.reduce((a, b) => a + b, 0) / inputPositions.length 
            : baseY + Math.floor(variables.length / 2) * verticalGap;
          
          return gateInputs.map((input, j) => {
            const source = connectionMap[input] || { x: 0, y: 0 };
            const isActive = isHighlighted(`wire_${input}_to_${op.type}_${i}`);
            
            // Calculate curve control points for bezier curve
            const controlPoint1X = source.x + (gateX - source.x) * 0.6;
            const controlPoint1Y = source.y;
            const controlPoint2X = gateX - 40;
            const controlPoint2Y = gateY;
            
            return (
              <g key={`wire_${input}_to_${op.type}_${i}`}>
                {/* Path with bezier curve for smoother connections */}
                <path 
                  d={`M ${source.x + 20} ${source.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${gateX} ${gateY}`}
                  stroke={isActive ? "#4caf50" : "#666"}
                  strokeWidth={isActive ? 3 : 2}
                  opacity={isActive ? animationProgress : 0.6}
                  fill="none"
                  strokeDasharray={isActive ? "5,5" : "none"}
                  strokeLinecap="round"
                />
              </g>
            );
          });
        })}
        
        {/* Output connection */}
        {operations.length > 0 && (
          <path 
            d={`M ${gateStartX + (operations.length - 1) * gateSpacing + gateWidth} 
                ${connectionMap[operations[operations.length - 1].output]?.y || baseY + Math.floor(variables.length / 2) * verticalGap} 
                C ${gateStartX + (operations.length - 1) * gateSpacing + gateWidth + 30} 
                ${connectionMap[operations[operations.length - 1].output]?.y || baseY + Math.floor(variables.length / 2) * verticalGap},
                ${outputX - 50} 
                ${baseY + Math.floor(variables.length / 2) * verticalGap},
                ${outputX - 20} 
                ${baseY + Math.floor(variables.length / 2) * verticalGap}`}
            stroke={isHighlighted("output_wire") ? "#4caf50" : "#666"}
            strokeWidth={isHighlighted("output_wire") ? 3 : 2}
            opacity={isHighlighted("output_wire") ? animationProgress : 0.6}
            fill="none"
            strokeDasharray={isHighlighted("output_wire") ? "5,5" : "none"}
            strokeLinecap="round"
          />
        )}
        
        {/* If no operations, connect inputs directly to output */}
        {operations.length === 0 && variables.map((v, i) => (
          <path 
            key={`direct_${v}`}
            d={`M ${inputX + 20} ${baseY + i * verticalGap} 
                C ${inputX + 100} ${baseY + i * verticalGap},
                ${outputX - 100} ${baseY + Math.floor(variables.length / 2) * verticalGap},
                ${outputX - 20} ${baseY + Math.floor(variables.length / 2) * verticalGap}`}
            stroke={isHighlighted(`wire_${v}_to_output`) ? "#4caf50" : "#666"}
            strokeWidth={isHighlighted(`wire_${v}_to_output`) ? 3 : 2}
            opacity={isHighlighted(`wire_${v}_to_output`) ? animationProgress : 0.6}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </svg>
      <Typography variant="caption" display="block" align="right" mt={1}>
        Expression: {expression}
      </Typography>
    </Box>
  );
};

// Generate detailed execution steps based on the parsed expression
const generateDetailedSteps = (expression, variables, operations) => {
  const steps = [];
  
  // Step 1: Initialize inputs
  steps.push({
    title: 'Input Initialization',
    activeComponents: variables.map(v => `input_${v}`),
    explanation: `Input signals for variables (${variables.join(', ')}) are prepared for processing.`,
    substeps: [
      'CPU loads variable values from registers',
      'Values are converted to electrical signals (0V for 0, 5V for 1)'
    ]
  });
  
  // Step 2: Parse expression structure
  steps.push({
    title: 'Expression Decoding',
    activeComponents: ['decoder'],
    explanation: `The logic expression "${expression}" is decoded into individual operations.`,
    substeps: [
      'Instruction decoder identifies operators and operands',
      'Operation sequence is determined based on precedence rules'
    ]
  });
  
  // Add steps for each operation in order
  operations.forEach((op, index) => {
    const inputComponents = op.inputs.map(input => {
      // If the input is a variable, use its input component ID
      if (variables.includes(input)) {
        return `input_${input}`;
      }
      // Otherwise, it's an output from another operation
      return input;
    });
    
    // Add wire highlighting
    const wireComponents = op.inputs.map(input => `wire_${input}_to_${op.type}_${index}`);
    
    steps.push({
      title: `${op.type} Operation`,
      activeComponents: [...inputComponents, `gate_${op.type}_${index}`, ...wireComponents],
      explanation: getOperationExplanation(op.type, op.inputs),
      substeps: getOperationSubsteps(op.type, op.inputs)
    });
  });
  
  // Final step: Result storage
  steps.push({
    title: 'Result Output',
    activeComponents: ['output', 'output_wire'],
    explanation: 'The final result is stored in the output register.',
    substeps: [
      'Result signal reaches output register',
      'Value is stored for further processing or display',
      'CPU flags may be updated based on result '
    ]
  });
  
  return steps;
};

// Helper function to get operation explanation
const getOperationExplanation = (type, inputs) => {
  switch (type) {
    case 'AND':
      return `The AND gate processes input signals (${inputs.join(', ')}), producing output only when all inputs are 1.`;
    case 'OR':
      return `The OR gate processes input signals (${inputs.join(', ')}), producing output when any input is 1.`;
    case 'NOT':
      return `The NOT gate inverts the input signal "${inputs[0]}" (0→1, 1→0).`;
    default:
      return `The ${type} operation processes input signals.`;
  }
};

// Helper function to get operation substeps
const getOperationSubsteps = (type, inputs) => {
  switch (type) {
    case 'AND':
      return [
        `Input signals (${inputs.join(', ')}) reach AND gate inputs`,
        'Gate evaluates all inputs (required: all 1s)',
        'Output signal is generated based on inputs'
      ];
    case 'OR':
      return [
        `Input signals (${inputs.join(', ')}) reach OR gate inputs`,
        'Gate evaluates all inputs (required: any 1)',
        'Output signal is generated based on inputs'
      ];
    case 'NOT':
      return [
        `Input signal "${inputs[0]}" reaches NOT gate`,
        'Gate inverts signal value',
        'Inverted output signal is generated'
      ];
    default:
      return [
        'Input signals reach gate inputs',
        'Gate evaluates inputs according to its logic',
        'Output signal is generated'
      ];
  }
};

const ExecutionVisualizer = ({ expression, variables: initialVariables }) => {
  // Parse the expression to get variables and operations
  const { variables, operations } = useMemo(() => {
    // If variables are provided, use them; otherwise parse from expression
    const parsed = parseExpression(expression);
    return {
      variables: initialVariables?.length ? initialVariables : parsed.variables,
      operations: parsed.operations
    };
  }, [expression, initialVariables]);

  const [currentStep, setCurrentStep] = useState(0);
  const [subStepIndex, setSubStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(1); // 0 to 1
  
  // Generate execution steps based on the parsed expression
  const executionSteps = useMemo(() => {
    return generateDetailedSteps(expression, variables, operations);
  }, [expression, variables, operations]);
  
  // Handle playback - constant speed of 1500ms per step
  const CONSTANT_SPEED = 1500; // 1.5 seconds per step - 1x speed
  
  useEffect(() => {
    let timer;
    let animationTimer;
    
    if (isPlaying) {
      // Start with animation reset
      setAnimationProgress(0);
      
      // Animate progress over time
      animationTimer = setInterval(() => {
        setAnimationProgress(prev => Math.min(prev + 0.1, 1));
      }, CONSTANT_SPEED / 10);
      
      // Move to next step after animation completes
      timer = setTimeout(() => {
        clearInterval(animationTimer);
        setAnimationProgress(1);
        
        // Advance to next substep
        if (subStepIndex < executionSteps[currentStep].substeps.length - 1) {
          setSubStepIndex(prev => prev + 1);
        } else if (currentStep < executionSteps.length - 1) {
          // Move to next step
          setCurrentStep(prev => prev + 1);
          setSubStepIndex(0);
        } else {
          // End of execution
          setIsPlaying(false);
        }
      }, CONSTANT_SPEED);
    }
    
    return () => {
      clearTimeout(timer);
      clearInterval(animationTimer);
    };
  }, [isPlaying, currentStep, subStepIndex, executionSteps]);
  
  // Handle step control
  const handlePreviousStep = () => {
    // Reset animation
    setAnimationProgress(0);
    setTimeout(() => {
      setAnimationProgress(1);
      
      if (subStepIndex > 0) {
        setSubStepIndex(prev => prev - 1);
      } else if (currentStep > 0) {
        setCurrentStep(prev => prev - 1);
        setSubStepIndex(executionSteps[currentStep - 1].substeps.length - 1);
      }
    }, 200);
  };
  
  const handleNextStep = () => {
    // Reset animation
    setAnimationProgress(0);
    setTimeout(() => {
      setAnimationProgress(1);
      
      if (subStepIndex < executionSteps[currentStep].substeps.length - 1) {
        setSubStepIndex(prev => prev + 1);
      } else if (currentStep < executionSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
        setSubStepIndex(0);
      }
    }, 200);
  };
  
  const handleReset = () => {
    setCurrentStep(0);
    setSubStepIndex(0);
    setIsPlaying(false);
    setAnimationProgress(1);
  };
  
  // Calculate overall progress
  const totalSubSteps = executionSteps.reduce((acc, step) => acc + step.substeps.length, 0);
  const completedSubSteps = executionSteps
    .slice(0, currentStep)
    .reduce((acc, step) => acc + step.substeps.length, 0) + subStepIndex;
  const progressPercentage = Math.round((completedSubSteps / totalSubSteps) * 100);
  
  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Execution Visualization
        </Typography>
        <Tooltip title="See how CPU processes logic operations step by step">
          <IconButton size="small">
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <DynamicCircuit 
        expression={expression}
        variables={variables}
        operations={operations}
        highlightedComponents={executionSteps[currentStep].activeComponents}
        animationProgress={animationProgress}
      />
      
      <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {executionSteps[currentStep].title}
        </Typography>
        <Typography variant="body2" paragraph>
          {executionSteps[currentStep].explanation}
        </Typography>
        <Box sx={{ pl: 2, borderLeft: '2px solid #3f51b5' }}>
          {executionSteps[currentStep].substeps.map((substep, idx) => (
            <Typography 
              key={idx}
              variant="body2"
              sx={{ 
                mt: idx > 0 ? 1 : 0,
                fontWeight: subStepIndex === idx ? 'bold' : 'normal',
                color: subStepIndex === idx ? 'primary.main' : 'text.primary',
                opacity: subStepIndex === idx ? 1 : 0.7,
                transition: 'all 0.3s ease-in-out'
              }}
            >
              {idx + 1}. {substep}
            </Typography>
          ))}
        </Box>
      </Box>
      
      <Stack spacing={2} direction="column">
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          <ButtonGroup variant="outlined">
            <Button 
              onClick={handleReset} 
              startIcon={<RestartAltIcon />}
            >
              Reset
            </Button>
            <Button 
              onClick={handlePreviousStep}
              disabled={currentStep === 0 && subStepIndex === 0}
              startIcon={<SkipPreviousIcon />}
            >
              Prev
            </Button>
            <Button 
              onClick={() => setIsPlaying(!isPlaying)}
              color="primary"
              variant={isPlaying ? "contained" : "outlined"}
              startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            >
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button 
              onClick={handleNextStep}
              disabled={currentStep === executionSteps.length - 1 && 
                        subStepIndex === executionSteps[executionSteps.length - 1].substeps.length - 1}
              endIcon={<SkipNextIcon />}
            >
              Next
            </Button>
          </ButtonGroup>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Step {currentStep + 1}/{executionSteps.length} • Substep {subStepIndex + 1}/{executionSteps[currentStep].substeps.length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {progressPercentage}% complete
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ExecutionVisualizer;