import React, { useState } from 'react';
import { Button, TextField, Typography, Box, CircularProgress, List, ListItem, Paper } from '@mui/material';
import axios from 'axios';

const GenerateExpressions = () => {
  const [maxVars, setMaxVars] = useState(2);
  const [expressions, setExpressions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchExpressions = async () => {
    if (maxVars < 1 || maxVars > 4) {
      setError('Max variables must be between 1 and 4.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/generate-expressions', { maxVariables: maxVars });
      setExpressions(res.data.expressions || []);
    } catch (err) {
      setError('Failed to fetch expressions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Generate Logic Expressions
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <TextField
          type="number"
          label="Max Variables (1-4)"
          value={maxVars}
          onChange={(e) => setMaxVars(Number(e.target.value))}
          inputProps={{ min: 1, max: 4 }}
        />
        <Button variant="contained" onClick={fetchExpressions}>
          Generate
        </Button>
      </Box>

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && expressions.length > 0 && (
        <Paper elevation={3} sx={{ maxHeight: 400, overflow: 'auto', p: 2 }}>
          <Typography variant="subtitle1">Generated Expressions ({expressions.length}):</Typography>
          <List dense>
            {expressions.map((expr, idx) => (
              <ListItem key={idx}>{expr}</ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default GenerateExpressions;
