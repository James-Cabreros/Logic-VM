// routes/expressions.js or similar
const express = require('express');
const router = express.Router();
const generateExpressions = require('../utils/generateExpressions');

router.get('/generate-expressions', (req, res) => {
  const { variables } = req.query;
  if (!variables || variables.length < 2 || variables.length > 4) {
    return res.status(400).json({ error: 'Provide 2 to 4 variables' });
  }

  try {
    const exprList = generateExpressions(variables.split(''));
    res.json({ expressions: exprList });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate expressions' });
  }
});

module.exports = router;
