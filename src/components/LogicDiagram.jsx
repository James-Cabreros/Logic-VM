import React, { useEffect, useState } from 'react';
import { Box, Card, CardHeader, CardContent, Divider, CircularProgress, Alert, Typography } from '@mui/material';
import TruthTable from './TruthTable';
import InfoIcon from '@mui/icons-material/Info';
import { IconButton, Tooltip } from '@mui/material';


// SVG Components for Logic Gates (reusing the original gate components)
const AndGate = ({ x, y }) => (
  <g transform={`translate(${x},${y})`}>
    <path d="M 0 0 L 0 60 L 30 60 Q 60 60 60 30 Q 60 0 30 0 Z" 
          fill="white" stroke="black" strokeWidth="2"/>
    <line x1="-20" y1="15" x2="0" y2="15" stroke="black" strokeWidth="2"/>
    <line x1="-20" y1="45" x2="0" y2="45" stroke="black" strokeWidth="2"/>
    <line x1="60" y1="30" x2="80" y2="30" stroke="black" strokeWidth="2"/>
  </g>
);

const OrGate = ({ x, y }) => (
  <g transform={`translate(${x},${y})`}>
    <path d="M 0 0 Q 0 30 0 60 Q 30 60 50 30 Q 30 0 0 0" 
          fill="white" stroke="black" strokeWidth="2"/>
    <line x1="-20" y1="15" x2="5" y2="15" stroke="black" strokeWidth="2"/>
    <line x1="-20" y1="45" x2="5" y2="45" stroke="black" strokeWidth="2"/>
    <line x1="50" y1="30" x2="70" y2="30" stroke="black" strokeWidth="2"/>
  </g>
);

const NotGate = ({ x, y }) => (
  <g transform={`translate(${x},${y})`}>
    <path d="M 0 0 L 0 60 L 40 30 Z" 
          fill="white" stroke="black" strokeWidth="2"/>
    <circle cx="45" cy="30" r="5" fill="white" stroke="black" strokeWidth="2"/>
    <line x1="-20" y1="30" x2="0" y2="30" stroke="black" strokeWidth="2"/>
    <line x1="50" y1="30" x2="70" y2="30" stroke="black" strokeWidth="2"/>
  </g>
);

const NandGate = ({ x, y }) => (
  <g transform={`translate(${x},${y})`}>
    <path d="M 0 0 L 0 60 L 30 60 Q 60 60 60 30 Q 60 0 30 0 Z" 
          fill="white" stroke="black" strokeWidth="2"/>
    <circle cx="65" cy="30" r="5" fill="white" stroke="black" strokeWidth="2"/>
    <line x1="-20" y1="15" x2="0" y2="15" stroke="black" strokeWidth="2"/>
    <line x1="-20" y1="45" x2="0" y2="45" stroke="black" strokeWidth="2"/>
    <line x1="70" y1="30" x2="90" y2="30" stroke="black" strokeWidth="2"/>
  </g>
);

const NorGate = ({ x, y }) => (
  <g transform={`translate(${x},${y})`}>
    <path d="M 0 0 Q 0 30 0 60 Q 30 60 50 30 Q 30 0 0 0" 
          fill="white" stroke="black" strokeWidth="2"/>
    <circle cx="55" cy="30" r="5" fill="white" stroke="black" strokeWidth="2"/>
    <line x1="-20" y1="15" x2="5" y2="15" stroke="black" strokeWidth="2"/>
    <line x1="-20" y1="45" x2="5" y2="45" stroke="black" strokeWidth="2"/>
    <line x1="60" y1="30" x2="80" y2="30" stroke="black" strokeWidth="2"/>
  </g>
);

const XorGate = ({ x, y }) => (
  <g transform={`translate(${x},${y})`}>
    <path d="M -5 0 Q -5 30 -5 60" fill="none" stroke="black" strokeWidth="2"/>
    <path d="M 0 0 Q 0 30 0 60 Q 30 60 50 30 Q 30 0 0 0" 
          fill="white" stroke="black" strokeWidth="2"/>
    <line x1="-20" y1="15" x2="5" y2="15" stroke="black" strokeWidth="2"/>
    <line x1="-20" y1="45" x2="5" y2="45" stroke="black" strokeWidth="2"/>
    <line x1="50" y1="30" x2="70" y2="30" stroke="black" strokeWidth="2"/>
  </g>
);

const XnorGate = ({ x, y }) => (
  <g transform={`translate(${x},${y})`}>
    <path d="M -5 0 Q -5 30 -5 60" fill="none" stroke="black" strokeWidth="2"/>
    <path d="M 0 0 Q 0 30 0 60 Q 30 60 50 30 Q 30 0 0 0" 
          fill="white" stroke="black" strokeWidth="2"/>
    <circle cx="55" cy="30" r="5" fill="white" stroke="black" strokeWidth="2"/>
    <line x1="-20" y1="15" x2="5" y2="15" stroke="black" strokeWidth="2"/>
    <line x1="-20" y1="45" x2="5" y2="45" stroke="black" strokeWidth="2"/>
    <line x1="60" y1="30" x2="80" y2="30" stroke="black" strokeWidth="2"/>
  </g>
);

const Input = ({ x, y, label }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x="0" y="0" width="40" height="30" 
          fill="white" stroke="black" strokeWidth="2"/>
    <text x="20" y="20" textAnchor="middle" dominantBaseline="middle">
      {label}
    </text>
    <line x1="40" y1="15" x2="60" y2="15" stroke="black" strokeWidth="2"/>
  </g>
);

const Output = ({ x, y, label = "Output" }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x="0" y="0" width="60" height="30" 
          fill="white" stroke="black" strokeWidth="2"/>
    <text x="30" y="20" textAnchor="middle" dominantBaseline="middle">
      {label}
    </text>
    <line x1="-20" y1="15" x2="0" y2="15" stroke="black" strokeWidth="2"/>
  </g>
);

// ==================== IMPROVED PARSER AND AST BUILDER ====================

// Tokenize the expression
const tokenize = (expr) => {
  // Replace parentheses with spaces around them for easier splitting
  const preparedExpr = expr
    .replace(/\(/g, ' ( ')
    .replace(/\)/g, ' ) ')
    .toLowerCase();
  
  // Split by whitespace and filter out empty strings
  return preparedExpr.split(/\s+/).filter(token => token.trim() !== '');
};

// Define operator precedence
const precedence = {
  'not': 4,
  'and': 3,
  'nand': 3,
  'or': 2,
  'nor': 2,
  'xor': 2,
  'xnor': 2,
  '(': 0,
  ')': 0
};

// Convert infix notation to postfix (Shunting Yard algorithm)
const infixToPostfix = (tokens) => {
  const output = [];
  const operatorStack = [];
  
  for (const token of tokens) {
    if (!['and', 'or', 'not', 'nand', 'nor', 'xor', 'xnor', '(', ')'].includes(token)) {
      // If token is an operand (variable), add to output
      output.push(token);
    } else if (token === '(') {
      // If token is left parenthesis, push to stack
      operatorStack.push(token);
    } else if (token === ')') {
      // If token is right parenthesis, pop from stack until matching left parenthesis
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        output.push(operatorStack.pop());
      }
      // Remove the left parenthesis
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] === '(') {
        operatorStack.pop();
      }
    } else {
      // If token is an operator
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== '(' &&
        precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
      ) {
        output.push(operatorStack.pop());
      }
      operatorStack.push(token);
    }
  }
  
  // Pop any remaining operators from the stack to the output
  while (operatorStack.length > 0) {
    output.push(operatorStack.pop());
  }
  
  return output;
};

// Build AST from postfix notation
const buildAST = (postfix) => {
  const stack = [];
  
  for (const token of postfix) {
    if (!['and', 'or', 'not', 'nand', 'nor', 'xor', 'xnor'].includes(token)) {
      // If token is a variable, create a leaf node
      stack.push({
        type: 'variable',
        value: token
      });
    } else if (token === 'not') {
      // Unary operator (NOT) takes one operand
      const operand = stack.pop();
      stack.push({
        type: 'operation',
        operator: token,
        children: [operand]
      });
    } else {
      // Binary operators take two operands
      const right = stack.pop();
      const left = stack.pop();
      stack.push({
        type: 'operation',
        operator: token,
        children: [left, right]
      });
    }
  }
  
  // The final item on the stack is the root of the AST
  return stack[0];
};

// ==================== TREE LAYOUT ALGORITHM ====================

// Modify the calculateLayout function to better handle complex expressions
const calculateLayout = (ast) => {
  const H_SPACING = 150; // Increased spacing between gates
  const V_SPACING = 60;  // Spacing between inputs
  const GATE_WIDTH = 80;
  
  const layoutTree = (node, level = 0, parentIndex = 0) => {
    if (node.type === 'variable') {
      return {
        ...node,
        width: 60,
        height: 30,
        level,
        parentIndex
      };
    }

    const processedChildren = node.children.map((child, idx) => 
      layoutTree(child, level + 1, idx)
    );
    
    let width, height;
    
    if (node.operator === 'not') {
      width = processedChildren[0].width + GATE_WIDTH + H_SPACING;
      height = 60;
    } else {
      const childrenWidth = Math.max(...processedChildren.map(c => c.width));
      width = childrenWidth + GATE_WIDTH + H_SPACING;
      height = Math.max(60, processedChildren.reduce((sum, child) => sum + child.height, 0));
    }
    
    return {
      ...node,
      children: processedChildren,
      width,
      height,
      level,
      parentIndex
    };
  };

  const layoutedAST = layoutTree(ast);
  
  // Assign coordinates with improved positioning
  const assignCoordinates = (node, baseX = 50, baseY = 50, context = { maxY: 0 }) => {
    if (node.type === 'variable') {
      const y = baseY + (node.parentIndex * V_SPACING);
      context.maxY = Math.max(context.maxY, y + 30);
      
      return {
        ...node,
        x: baseX,
        y,
        outputX: baseX + 60,
        outputY: y + 15
      };
    }

    let processedNode = { ...node };
    const childContext = { maxY: context.maxY };
    
    if (node.operator === 'not') {
      const child = assignCoordinates(node.children[0], baseX, baseY, childContext);
      processedNode.children = [child];
      
      processedNode.x = child.outputX + H_SPACING/2;
      processedNode.y = child.y;
      processedNode.outputX = processedNode.x + 70;
      processedNode.outputY = processedNode.y + 30;
      processedNode.inputs = [{
        x: processedNode.x - 20,
        y: processedNode.y + 30,
        sourceNode: child
      }];
      
      context.maxY = childContext.maxY;
    } else {
      // For binary operators, calculate positions based on children
      const processedChildren = [];
      let maxChildX = baseX;
      let minY = Infinity;
      let maxY = -Infinity;
      
      // First pass: process all children and find boundaries
      for (let i = 0; i < node.children.length; i++) {
        const child = assignCoordinates(
          node.children[i],
          baseX,
          baseY + (i * (V_SPACING * 2)),
          childContext
        );
        processedChildren.push(child);
        maxChildX = Math.max(maxChildX, child.outputX);
        minY = Math.min(minY, child.y);
        maxY = Math.max(maxY, child.y + child.height);
      }
      
      // Position the gate
      processedNode.children = processedChildren;
      processedNode.x = maxChildX + H_SPACING/2;
      processedNode.y = (minY + maxY)/2 - 30;
      processedNode.outputX = processedNode.x + 80;
      processedNode.outputY = processedNode.y + 30;
      
      // Create input connections
      processedNode.inputs = processedChildren.map(child => ({
        x: processedNode.x - 20,
        y: processedNode.y + (child.parentIndex === 0 ? 15 : 45),
        sourceNode: child
      }));
      
      context.maxY = Math.max(childContext.maxY, processedNode.y + 60);
    }
    
    return processedNode;
  };

  const context = { maxY: 0 };
  const coordinatedAST = assignCoordinates(layoutedAST, 50, 50, context);
  
  return {
    ast: coordinatedAST,
    height: context.maxY + 50
  };
};

// Improve the connection generation
const generateConnections = (ast) => {
  const connections = [];
  
  const processNode = (node) => {
    if (node.type === 'operation') {
      node.children.forEach(child => processNode(child));
      
      node.inputs.forEach(input => {
        const child = input.sourceNode;
        const points = [];
        
        // Start point (from source)
        points.push({ x: child.outputX, y: child.outputY });
        
        // If there's significant vertical distance, add intermediate points
        if (Math.abs(child.outputY - input.y) > 20) {
          const midX = (child.outputX + input.x) / 2;
          points.push({ x: midX, y: child.outputY });
          points.push({ x: midX, y: input.y });
        }
        
        // End point (to gate input)
        points.push({ x: input.x, y: input.y });
        
        connections.push({
          from: child.id || `${child.type}-${child.value || child.operator}`,
          to: node.id || `${node.type}-${node.operator}`,
          points
        });
      });
    }
  };
  
  processNode(ast);
  return connections;
};

// ==================== DIAGRAM GENERATOR COMPONENT ====================

const LogicDiagram = ({ expression, variables }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diagramElements, setDiagramElements] = useState({ nodes: [], connections: [], outputConnection: null });
  const [ast, setAst] = useState(null);
  
  const generateDiagram = () => {
    if (!expression || !variables.length) {
      setError("Please provide a logical expression and variables");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const tokens = tokenize(expression);
      const postfix = infixToPostfix(tokens);
      const astRoot = buildAST(postfix);
      
      // Get layout with improved positioning
      const { ast: layoutedAST, height } = calculateLayout(astRoot);
      setAst(layoutedAST);
      
      // Generate connections with improved routing
      const connections = generateConnections(layoutedAST);
      
      // Convert AST to diagram nodes
      const nodes = [];
      let maxX = 0;
      
      const processNode = (node, nodeId) => {
        if (node.type === 'variable') {
          nodes.push({
            type: 'input',
            x: node.x,
            y: node.y,
            label: node.value,
            id: `var-${node.value}`
          });
          maxX = Math.max(maxX, node.x + 60);
        } else if (node.type === 'operation') {
          node.children.forEach((child, idx) => processNode(child, `${nodeId}-${idx}`));
          
          nodes.push({
            type: node.operator,
            x: node.x,
            y: node.y,
            id: `gate-${nodeId}`
          });
          maxX = Math.max(maxX, node.x + (node.operator === 'not' ? 70 : 80));
        }
      };
      
      processNode(layoutedAST, 'root');
      
      // Add output node
      const outputNode = {
        type: 'output',
        x: layoutedAST.outputX + 30,
        y: layoutedAST.outputY - 15,
        id: 'output'
      };
      nodes.push(outputNode);
      maxX = Math.max(maxX, outputNode.x + 60);
      
      // Add final output connection
      const outputConnection = {
        from: `gate-root`,
        to: 'output',
        points: [
          { x: layoutedAST.outputX, y: layoutedAST.outputY },
          { x: outputNode.x - 20, y: outputNode.y + 15 }
        ]
      };
      
      setDiagramElements({
        nodes,
        connections,
        outputConnection,
        viewBox: `0 0 ${maxX + 50} ${height}`
      });
    } catch (err) {
      console.error("Error generating logic diagram:", err);
      setError(`Failed to generate diagram: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expression && variables.length) {
      generateDiagram();
    }
  }, [expression, variables]);
  
  const renderGate = (node) => {
    switch (node.type) {
      case 'and':
        return <AndGate x={node.x} y={node.y} />;
      case 'or':
        return <OrGate x={node.x} y={node.y} />;
      case 'not':
        return <NotGate x={node.x} y={node.y} />;
      case 'nand':
        return <NandGate x={node.x} y={node.y} />;
      case 'nor':
        return <NorGate x={node.x} y={node.y} />;
      case 'xor':
        return <XorGate x={node.x} y={node.y} />;
      case 'xnor':
        return <XnorGate x={node.x} y={node.y} />;
      case 'input':
        return <Input x={node.x} y={node.y} label={node.label} />;
      case 'output':
        return <Output x={node.x} y={node.y} />;
      default:
        return null;
    }
  };
  
  // Function to generate SVG path for connection lines
  const generatePath = (points) => {
    if (!points || points.length < 2) return "";
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    // Add line segments to each intermediate point
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  };

  return (
    <>
      <Card elevation={2} sx={{ mb: 4 }}>
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="h2">
                Logic Gate Diagram
              </Typography>
              <Tooltip title="Visualizes the logical expression as a circuit using standard logic gate symbols">
                <IconButton size="small">
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box
            sx={{
              border: '1px solid rgba(0, 0, 0, 0.12)',
              borderRadius: 1,
              height: '400px',
              bgcolor: 'background.paper',
              overflow: 'auto'
            }}
          >
            {loading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%'
              }}>
              <CircularProgress size={40} />
              </Box>
            ) : diagramElements.nodes.length > 0 ? (
              <svg width="100%" height="100%" viewBox={diagramElements.viewBox}>
                <g>
                  {/* Render connection paths */}
                  {diagramElements.connections.map((conn, index) => (
                    <path
                      key={`conn-${index}`}
                      d={generatePath(conn.points)}
                      fill="none"
                      stroke="black"
                      strokeWidth="2"
                    />
                  ))}
                  {/* Render output connection */}
                  {diagramElements.outputConnection && (
                    <path
                      key="output-conn"
                      d={generatePath(diagramElements.outputConnection.points)}
                      fill="none"
                      stroke="black"
                      strokeWidth="2"
                    />
                  )}
                  {/* Render all nodes/gates */}
                  {diagramElements.nodes.map((node) => (
                    <g key={node.id}>{renderGate(node)}</g>
                  ))}
                </g>
              </svg>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%',
                color: 'text.secondary'
              }}>
                Enter a logical expression to generate diagram
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      <TruthTable expression={expression} variables={variables} />
    </>
  );
};

export default LogicDiagram;