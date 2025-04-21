import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
} from '@mui/material';
import { FaMicrochip, FaCode, FaCogs, FaChartLine } from 'react-icons/fa';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/simulator');
  };

  return (
    <>
      {/* Top Navigation Bar - Full width, no elevation/shadow, no borders */}
      <AppBar 
        position="static" 
        elevation={0} 
        className="navbar"
        sx={{ 
          width: '100%',
          boxShadow: 'none',
          borderBottom: 'none',
          zIndex: 10 // Ensure navbar is above other elements
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            LogicGateVM
          </Typography>
        </Toolbar>
      </AppBar>

      <div className="landing-page">
        <header className="header">
          <h1>LogicGateVM</h1>
          <p className="subtitle">A Visual Generator for Logic Circuits</p>
          <button className="start-button" onClick={handleStart}>
            Start Generating
          </button>
        </header>

        <section className="description-section">
          <p className="main-description">
            Enter logic expressions and instantly generate visual diagrams, truth tables,
            CPU execution visuals, and memory/register views.
            Ideal for learning, teaching, and designing digital logic systems.
          </p>
        </section>

        <section className="features-section">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FaMicrochip className="feature-icon" />
              <h3>Logic Diagram Generator</h3>
              <p>Visualize logic gates and connections from your expression</p>
            </div>

            <div className="feature-card">
              <FaCode className="feature-icon" />
              <h3>Truth Table Builder</h3>
              <p>Automatically calculate truth tables for your logic inputs</p>
            </div>

            <div className="feature-card">
              <FaCogs className="feature-icon" />
              <h3>CPU Execution Visualizer</h3>
              <p>Simulate how the expression would be evaluated in hardware</p>
            </div>

            <div className="feature-card">
              <FaChartLine className="feature-icon" />
              <h3>Memory & Registers View</h3>
              <p>Explore how values flow through virtual memory and registers</p>
            </div>
          </div>
        </section>

        <footer className="footer">
          <p>© {new Date().getFullYear()} LogicGateVM - Empowering Digital Logic Education</p>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;