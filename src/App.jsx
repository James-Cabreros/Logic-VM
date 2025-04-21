import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LogicSimulator from './components/LogicSimulator';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/simulator" element={<LogicSimulator />} />
      </Routes>
    </Router>
  );
};

export default App;
