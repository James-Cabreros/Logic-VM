import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Divider
} from '@mui/material';

const TruthTable = ({ expression, variables }) => {
  // Generate all possible combinations of inputs
  const generateInputCombinations = (numVars) => {
    const combinations = [];
    const totalCombinations = Math.pow(2, numVars);

    for (let i = 0; i < totalCombinations; i++) {
      const combination = [];
      for (let j = numVars - 1; j >= 0; j--) {
        combination.push((i >> j) & 1);
      }
      combinations.push(combination);
    }

    return combinations;
  };

  // Evaluate a single logical operation
  const evaluateOperation = (op, values) => {
    switch (op.toLowerCase()) {
      case 'and':
        return values.every(v => v === 1) ? 1 : 0;
      case 'or':
        return values.some(v => v === 1) ? 1 : 0;
      case 'not':
        return values[0] === 1 ? 0 : 1;
      case 'nand':
        return values.every(v => v === 1) ? 0 : 1;
      case 'nor':
        return values.some(v => v === 1) ? 0 : 1;
      case 'xor':
        return values.reduce((a, b) => a ^ b) === 1 ? 1 : 0;
      case 'xnor':
        return values.reduce((a, b) => a ^ b) === 0 ? 1 : 0;
      default:
        return 0;
    }
  };

  // Evaluate the entire expression for given input values
  const evaluateExpression = (expr, inputValues, vars) => {
    // Create a map of variable values
    const valueMap = {};
    vars.forEach((v, i) => {
      valueMap[v.toLowerCase()] = inputValues[i];
    });

    // Tokenize the expression
    const tokens = expr.toLowerCase()
      .replace(/\(/g, ' ( ')
      .replace(/\)/g, ' ) ')
      .split(/\s+/)
      .filter(token => token.length > 0);

    // Convert to postfix notation using Shunting Yard algorithm
    const precedence = {
      'not': 4,
      'and': 3,
      'nand': 3,
      'or': 2,
      'nor': 2,
      'xor': 2,
      'xnor': 2
    };

    const output = [];
    const operators = [];

    tokens.forEach(token => {
      if (token === '(') {
        operators.push(token);
      } else if (token === ')') {
        while (operators.length > 0 && operators[operators.length - 1] !== '(') {
          output.push(operators.pop());
        }
        operators.pop(); // Remove '('
      } else if (Object.keys(precedence).includes(token)) {
        while (
          operators.length > 0 &&
          operators[operators.length - 1] !== '(' &&
          precedence[operators[operators.length - 1]] >= precedence[token]
        ) {
          output.push(operators.pop());
        }
        operators.push(token);
      } else {
        output.push(token);
      }
    });

    while (operators.length > 0) {
      output.push(operators.pop());
    }

    // Evaluate postfix expression
    const stack = [];

    output.forEach(token => {
      if (Object.keys(precedence).includes(token)) {
        if (token === 'not') {
          const operand = stack.pop();
          stack.push(evaluateOperation(token, [operand]));
        } else {
          const b = stack.pop();
          const a = stack.pop();
          stack.push(evaluateOperation(token, [a, b]));
        }
      } else {
        stack.push(valueMap[token] || 0);
      }
    });

    return stack[0];
  };

  // Generate the truth table data
  const generateTruthTable = () => {
    if (!expression || !variables.length) return [];
    
    const inputCombinations = generateInputCombinations(variables.length);
    return inputCombinations.map(combination => {
      const result = evaluateExpression(expression, combination, variables);
      return [...combination, result];
    });
  };

  const truthTable = generateTruthTable();

  return (
    <Card elevation={2}>
      <CardHeader title="Truth Table" />
      <Divider />
      <CardContent>
        {truthTable.length > 0 ? (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {variables.map((variable, index) => (
                    <TableCell key={index} align="center">
                      <Typography variant="subtitle2">{variable}</Typography>
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    <Typography variant="subtitle2">Output</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {truthTable.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((value, colIndex) => (
                      <TableCell key={colIndex} align="center">
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" color="text.secondary" align="center">
            Enter a logical expression to generate truth table
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default TruthTable; 