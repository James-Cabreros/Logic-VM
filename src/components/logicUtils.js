// Helper functions for logic gate operations

export const validateExpression = (expr, validOperators) => {
    // Remove all whitespace from beginning and end
    const cleanExpr = expr.toLowerCase().trim();
    
    // Check for empty expression
    if (!cleanExpr) {
      return { valid: false, message: "Expression cannot be empty", vars: [] };
    }
    
    // Extract all variables (single letters)
    const vars = Array.from(new Set(cleanExpr.match(/\b[A-Za-z]\b/g) || []));
    
    // Check if there are any variables
    if (vars.length === 0) {
      return { valid: false, message: "No variables found in expression", vars: [] };
    }
    
    // Check for valid operators
    const tokens = cleanExpr.match(/\b\w+\b/g) || [];
    const operators = tokens.filter(token => validOperators.includes(token.toLowerCase()));
    
    if (operators.length === 0 && vars.length > 1) {
      return { valid: false, message: "No valid operators found", vars: [] };
    }
    
    // Check for balanced parentheses
    if ((cleanExpr.match(/\(/g) || []).length !== (cleanExpr.match(/\)/g) || []).length) {
      return { valid: false, message: "Unbalanced parentheses", vars: [] };
    }
    
    // Check for invalid tokens
    for (const token of tokens) {
      if (!validOperators.includes(token.toLowerCase()) && !vars.includes(token)) {
        return { valid: false, message: `Invalid token: ${token}`, vars: [] };
      }
    }
    
    return { valid: true, message: "Expression is valid", vars: vars.sort() };
  };
  
  export const evaluate = (expr, variableValues) => {
    let expression = expr.toLowerCase();
    
    // Replace variables with their values
    Object.entries(variableValues).forEach(([variable, value]) => {
      const regex = new RegExp('\\b' + variable + '\\b', 'g');
      expression = expression.replace(regex, value.toString());
    });
    
    // Handle NOT operator (must be before other operators)
    // Fix for the NOT operator parsing
    while (expression.includes('not 0') || expression.includes('not 1')) {
      expression = expression.replace(/not\s+0/g, '1');
      expression = expression.replace(/not\s+1/g, '0');
    }
    
    // Replace operators with JavaScript operators
    expression = expression.replace(/\band\b/g, '&&');
    expression = expression.replace(/\bor\b/g, '||');
    expression = expression.replace(/\bxor\b/g, '!=='); // XOR
    
    // Handle NAND - improved logic
    expression = expression.replace(/(\w+)\s+nand\s+(\w+)/g, '!($1 && $2)');
    
    // Handle NOR - improved logic
    expression = expression.replace(/(\w+)\s+nor\s+(\w+)/g, '!($1 || $2)');
    
    // Handle XNOR - improved logic
    expression = expression.replace(/(\w+)\s+xnor\s+(\w+)/g, '($1 === $2)');
    
    // Convert 1/0 to true/false for evaluation
    expression = expression.replace(/\b1\b/g, 'true');
    expression = expression.replace(/\b0\b/g, 'false');
    
    try {
      // eslint-disable-next-line no-eval
      const result = eval(expression);
      return result ? 1 : 0;
    } catch (e) {
      console.error(`Error evaluating expression: ${e}`);
      return null;
    }
  };
  
  export const generateTruthTable = (expression, variables) => {
    if (!expression || variables.length === 0) return [];
    
    // Generate all possible combinations of variable values
    const combinations = [];
    const totalCombinations = Math.pow(2, variables.length);
    
    for (let i = 0; i < totalCombinations; i++) {
      const binary = i.toString(2).padStart(variables.length, '0');
      const combo = {};
      
      variables.forEach((variable, index) => {
        combo[variable] = parseInt(binary[index]);
      });
      
      // Evaluate the expression for this combination
      const result = evaluate(expression, combo);
      if (result !== null) {
        combo.result = result;
        combinations.push(combo);
      }
    }
    
    return combinations;
  };