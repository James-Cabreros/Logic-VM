import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Slider, 
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

// This is a placeholder for circuit visualization - in a real implementation
// you would use an actual visualization library or component
const CircuitWithHighlight = ({ expression, variables, highlightedComponents }) => {
  return (
    <Box 
      sx={{ 
        border: '1px dashed #ccc', 
        p: 2, 
        mb: 2, 
        height: 200, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Circuit visualization would be rendered here with {highlightedComponents.join(', ')} highlighted
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          position: 'absolute', 
          bottom: 8, 
          right: 8,
          bgcolor: 'background.paper',
          p: 0.5,
          borderRadius: 1
        }}
      >
        Expression: {expression}
      </Typography>
    </Box>
  );
};

// Generate execution steps for the given expression
const generateSteps = (expression, variables) => {
  // Basic implementation - replace with actual logic for your specific needs
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
  
  // Step 2: Parse expression and identify operations
  steps.push({
    title: 'Expression Decoding',
    activeComponents: ['decoder'],
    explanation: `The logic expression "${expression}" is decoded into individual operations.`,
    substeps: [
      'Instruction decoder identifies operators and operands',
      'Operation sequence is determined based on precedence rules'
    ]
  });
  
  // Add appropriate steps based on the expression
  // For demonstration, we'll add simple steps for basic operations
  if (expression.toLowerCase().includes('and')) {
    steps.push({
      title: 'AND Operation',
      activeComponents: ['gate_and'],
      explanation: 'The AND gate processes input signals, producing output only when all inputs are 1.',
      substeps: [
        'Input signals reach AND gate inputs',
        'Gate evaluates all inputs (required: all 1s)',
        'Output signal is generated based on inputs'
      ]
    });
  }
  
  if (expression.toLowerCase().includes('or')) {
    steps.push({
      title: 'OR Operation',
      activeComponents: ['gate_or'],
      explanation: 'The OR gate processes input signals, producing output when any input is 1.',
      substeps: [
        'Input signals reach OR gate inputs',
        'Gate evaluates all inputs (required: any 1)',
        'Output signal is generated based on inputs'
      ]
    });
  }
  
  if (expression.toLowerCase().includes('not')) {
    steps.push({
      title: 'NOT Operation',
      activeComponents: ['gate_not'],
      explanation: 'The NOT gate inverts the input signal (0→1, 1→0).',
      substeps: [
        'Input signal reaches NOT gate',
        'Gate inverts signal value',
        'Inverted output signal is generated'
      ]
    });
  }
  
  // Final step: Result storage
  steps.push({
    title: 'Result Output',
    activeComponents: ['output'],
    explanation: 'The final result is stored in the output register.',
    substeps: [
      'Result signal reaches output register',
      'Value is stored for further processing or display',
      'CPU flags may be updated based on result (e.g., zero flag)'
    ]
  });
  
  return steps;
};

const ExecutionVisualizer = ({ expression, variables }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [subStepIndex, setSubStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1500); // ms per step
  
  // Generate execution steps based on the expression
  const executionSteps = useMemo(() => {
    return generateSteps(expression, variables);
  }, [expression, variables]);
  
  // Total number of substeps across all steps
  const totalSubSteps = useMemo(() => {
    return executionSteps.reduce((acc, step) => acc + step.substeps.length, 0);
  }, [executionSteps]);
  
  // Handle playback
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setTimeout(() => {
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
      }, playbackSpeed);
    }
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, subStepIndex, executionSteps, playbackSpeed]);
  
  // Handle step control
  const handlePreviousStep = () => {
    if (subStepIndex > 0) {
      setSubStepIndex(prev => prev - 1);
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setSubStepIndex(executionSteps[currentStep - 1].substeps.length - 1);
    }
  };
  
  const handleNextStep = () => {
    if (subStepIndex < executionSteps[currentStep].substeps.length - 1) {
      setSubStepIndex(prev => prev + 1);
    } else if (currentStep < executionSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSubStepIndex(0);
    }
  };
  
  const handleReset = () => {
    setCurrentStep(0);
    setSubStepIndex(0);
    setIsPlaying(false);
  };
  
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
      
      <CircuitWithHighlight 
        expression={expression}
        variables={variables}
        highlightedComponents={executionSteps[currentStep].activeComponents} 
      />
      
      <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {executionSteps[currentStep].title}
        </Typography>
        <Typography variant="body2" paragraph>
          {executionSteps[currentStep].explanation}
        </Typography>
        <Box sx={{ pl: 2, borderLeft: '2px solid #3f51b5' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: subStepIndex === 0 ? 'bold' : 'normal',
              color: subStepIndex === 0 ? 'primary.main' : 'text.primary'
            }}
          >
            1. {executionSteps[currentStep].substeps[0]}
          </Typography>
          {executionSteps[currentStep].substeps.slice(1).map((substep, idx) => (
            <Typography 
              key={idx}
              variant="body2"
              sx={{ 
                mt: 1,
                fontWeight: subStepIndex === idx + 1 ? 'bold' : 'normal',
                color: subStepIndex === idx + 1 ? 'primary.main' : 'text.primary'
              }}
            >
              {idx + 2}. {substep}
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
        
        <Box sx={{ mx: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Playback Speed
          </Typography>
          <Slider
            min={500}
            max={3000}
            step={500}
            value={playbackSpeed}
            onChange={(_, value) => setPlaybackSpeed(value)}
            valueLabelDisplay="auto"
            valueLabelFormat={value => `${value/1000}s`}
            marks={[
              { value: 500, label: 'Fast' },
              { value: 1500, label: 'Medium' },
              { value: 3000, label: 'Slow' }
            ]}
            sx={{ color: 'secondary.main' }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Step {currentStep + 1}/{executionSteps.length} • Substep {subStepIndex + 1}/{executionSteps[currentStep].substeps.length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.round(((currentStep * 100) / executionSteps.length) + 
              ((subStepIndex * 100) / (executionSteps.length * executionSteps[currentStep].substeps.length)))}% complete
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ExecutionVisualizer;