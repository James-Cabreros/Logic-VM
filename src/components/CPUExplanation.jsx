import React from 'react';
import { Box, Typography, Paper, Grid, Divider, IconButton, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const CPUExplanation = ({ expression }) => {
  const getGateExplanations = (expr) => {
    const gates = new Set();
    const terms = expr.toLowerCase().split(/\s+/);
    
    terms.forEach(term => {
      if (['and', 'or', 'not', 'nand', 'nor', 'xor', 'xnor'].includes(term)) {
        gates.add(term);
      }
    });

    return Array.from(gates);
  };

  const gateExplanations = {
    and: {
      description: "The AND gate produces a HIGH output only when all inputs are HIGH. In CPU design, AND gates are fundamental for:",
      cpuApplications: [
        "Data masking and selection in registers",
        "Address decoding in memory units",
        "Control signal generation",
        "Implementing complex boolean functions"
      ]
    },
    or: {
      description: "The OR gate produces a HIGH output when at least one input is HIGH. In CPUs, OR gates are essential for:",
      cpuApplications: [
        "Interrupt handling and priority encoding",
        "Bus arbitration logic",
        "Error detection circuits",
        "Combining multiple control signals"
      ]
    },
    not: {
      description: "The NOT gate (inverter) produces the opposite of its input. In CPU architecture, NOT gates are crucial for:",
      cpuApplications: [
        "Complement operations in ALU",
        "Signal inversion in control logic",
        "Memory address decoding",
        "Clock signal generation"
      ]
    },
    nand: {
      description: "The NAND gate is a universal gate that produces a LOW output only when all inputs are HIGH. In CPU design, NAND gates are used for:",
      cpuApplications: [
        "Building complex logic circuits efficiently",
        "Memory cell design",
        "Arithmetic logic unit (ALU) implementation",
        "Control unit logic"
      ]
    },
    nor: {
      description: "The NOR gate is another universal gate that produces a HIGH output only when all inputs are LOW. In CPUs, NOR gates are important for:",
      cpuApplications: [
        "Building flip-flops and latches",
        "State machine implementation",
        "Control signal generation",
        "Memory address decoding"
      ]
    },
    xor: {
      description: "The XOR gate produces a HIGH output when inputs are different. In CPU architecture, XOR gates are vital for:",
      cpuApplications: [
        "Binary addition in ALU",
        "Parity checking",
        "Error detection and correction",
        "Data encryption/decryption"
      ]
    },
    xnor: {
      description: "The XNOR gate produces a HIGH output when inputs are the same. In CPU design, XNOR gates are used for:",
      cpuApplications: [
        "Equality comparison in ALU",
        "Parity generation",
        "Error detection circuits",
        "Data comparison operations"
      ]
    }
  };

  const gates = getGateExplanations(expression);

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          CPU Logic Gate Analysis
        </Typography>
        <Tooltip title="Explains how different logic gates are used in CPU architecture and their practical applications">
          <IconButton size="small">
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider sx={{ mb: 3 }} />
      
      {gates.length > 0 ? (
        <Grid container spacing={3}>
          {gates.map((gate) => (
            <Grid item xs={12} key={gate}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  {gate.toUpperCase()} Gate
                </Typography>
                <Typography variant="body1" paragraph>
                  {gateExplanations[gate].description}
                </Typography>
                <Typography variant="subtitle1" color="secondary" gutterBottom>
                  CPU Applications:
                </Typography>
                <ul>
                  {gateExplanations[gate].cpuApplications.map((app, index) => (
                    <li key={index}>
                      <Typography variant="body2">
                        {app}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary">
          Enter a logical expression to see CPU gate analysis
        </Typography>
      )}
    </Paper>
  );
};

export default CPUExplanation;