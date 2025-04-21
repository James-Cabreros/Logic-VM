import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import MemoryIcon from '@mui/icons-material/Memory';
import DataArrayIcon from '@mui/icons-material/DataArray';

// Helper function to convert decimal to binary
const decimalToBinary = (decimal, bits = 8) => {
  return decimal.toString(2).padStart(bits, '0');
};

// Component to display a single register
const Register = ({ name, value, bits, description, highlight }) => {
  return (
    <TableRow sx={{ 
      '&:last-child td, &:last-child th': { border: 0 },
      bgcolor: highlight ? 'rgba(63, 81, 181, 0.08)' : 'inherit' 
    }}>
      <TableCell component="th" scope="row">
        <Typography variant="body2" fontWeight="medium">{name}</Typography>
      </TableCell>
      <TableCell align="right">
        <Chip 
          label={value} 
          size="small" 
          sx={{ minWidth: 60 }}
          color={highlight ? "primary" : "default"}
        />
      </TableCell>
      <TableCell align="right">
        <Box 
          sx={{ 
            fontFamily: 'monospace', 
            letterSpacing: 0.5,
            color: highlight ? 'primary.main' : 'text.secondary' 
          }}
        >
          {decimalToBinary(value, bits)}
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

// Component to visualize memory cells with values
const MemoryCells = ({ memoryValues, currentAddress }) => {
  return (
    <Grid container spacing={0.5}>
      {memoryValues.map((cell, index) => (
        <Grid item key={index} xs={1.5}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 1, 
              textAlign: 'center',
              border: '1px solid',
              borderColor: index === currentAddress ? 'primary.main' : 'divider',
              bgcolor: index === currentAddress ? 'rgba(63, 81, 181, 0.08)' : 'inherit',
              minWidth: 40
            }}
          >
            <Typography variant="caption" display="block" color="text.secondary">
              {`0x${index.toString(16).padStart(2, '0')}`}
            </Typography>
            <Typography variant="body2" fontFamily="monospace" fontWeight={index === currentAddress ? 'bold' : 'normal'}>
              {cell}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

// Main component
const MemoryRegisterSimulation = ({ expression, variables }) => {
  const [registers, setRegisters] = useState([
    { name: 'PC', value: 0, bits: 16, description: 'Program Counter', highlight: false },
    { name: 'IR', value: 0, bits: 32, description: 'Instruction Register', highlight: false },
    { name: 'ACC', value: 0, bits: 8, description: 'Accumulator', highlight: true },
    { name: 'MAR', value: 16, bits: 16, description: 'Memory Address Register', highlight: false },
    { name: 'MDR', value: 0, bits: 8, description: 'Memory Data Register', highlight: false },
    { name: 'SR', value: 2, bits: 8, description: 'Status Register', highlight: false }
  ]);
  
  const [memory, setMemory] = useState(Array(16).fill(0));
  const [currentAddress, setCurrentAddress] = useState(4);
  
  // Generate logical memory layout based on expression
  useEffect(() => {
    if (expression && variables.length > 0) {
      const newMemory = [...memory];
      const varMap = {};
  
      // Assign values to variables and update memory
      variables.forEach((variable, index) => {
        const address = index + 4;
        const value = Math.round(Math.random()); // random 0 or 1
        newMemory[address] = value;
        varMap[variable] = value;
      });
  
      // Identify logic operation
      let opCode = 0;
      if (expression.toLowerCase().includes('and')) opCode = 1;
      if (expression.toLowerCase().includes('or')) opCode = 2;
      if (expression.toLowerCase().includes('not')) opCode = 3;
      newMemory[0] = opCode;
  
      // Replace variables in expression with actual values
      let safeExpression = expression;
      for (const [varName, val] of Object.entries(varMap)) {
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        safeExpression = safeExpression.replace(regex, val);
      }
  
      // Replace logic ops with JS equivalents
      safeExpression = safeExpression
        .replace(/\bAND\b/gi, '&&')
        .replace(/\bOR\b/gi, '||')
        .replace(/\bNOT\b/gi, '!')
        .replace(/\s+/g, ' ');
  
      let result = 0;
      try {
        result = Function(`"use strict"; return (${safeExpression});`)() ? 1 : 0;
      } catch (err) {
        console.error("Failed to evaluate expression:", err);
      }
  
      // Update registers
      const newRegisters = [...registers];
      newRegisters[0].value = 0; // PC
      newRegisters[1].value = (opCode << 24) | variables.length; // IR
      newRegisters[2].value = result; // ACC
      newRegisters[3].value = 4; // MAR
      newRegisters[4].value = newMemory[4]; // MDR
  
      setMemory(newMemory);
      setRegisters(newRegisters);
      setCurrentAddress(4);
    }
  }, [expression, variables]);
  
  
  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MemoryIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h2">
            Register & Memory Simulation
          </Typography>
        </Box>
        <Tooltip title="Visualizes how CPU registers and memory interact during logic operations">
          <IconButton size="small">
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <MemoryIcon fontSize="small" sx={{ mr: 1 }} />
            CPU Registers
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Register</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell align="right">Binary</TableCell>
                  <TableCell>Purpose</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registers.map((reg) => (
                  <Register key={reg.name} {...reg} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <DataArrayIcon fontSize="small" sx={{ mr: 1 }} />
            Memory Content
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <MemoryCells memoryValues={memory} currentAddress={currentAddress} />
          </Box>
          
          <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>Memory Map:</strong>
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                • Address 0x00: Operation Code ({memory[0]})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Address 0x01-0x03: Reserved
              </Typography>
              {variables.map((variable, index) => (
                <Typography 
                  key={index} 
                  variant="body2" 
                  color={index + 4 === currentAddress ? 'primary.main' : 'text.secondary'}
                >
                  • Address 0x{(index + 4).toString(16).padStart(2, '0')}: Variable {variable} = {memory[index + 4]}
                </Typography>
              ))}
            </Stack>
          </Box>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>How It Works:</strong> This simulation demonstrates how a CPU would process the logic expression "{expression}" at the register and memory level.
          The variables ({variables.join(', ')}) are stored in memory, then loaded into registers for processing.
          The operation is decoded from the Instruction Register (IR), executed through logic gates, and the result is stored in the Accumulator (ACC).
        </Typography>
      </Box>
    </Paper>
  );
};

export default MemoryRegisterSimulation;