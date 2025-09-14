// src/components/LoadingState.js
import React from 'react';
import '../styles/LoadingState.css';

const LoadingState = () => {
    return (
        <div className="loading-state">
            <div className="loading-container">
                <div className="loading-spinner-wrapper">
                    <div className="loading-spinner"></div>
                </div>
                <h2 className="loading-title">Loading Crisis Data</h2>
                <div className="loading-messages">
                    <p className="loading-message">Fetching real-time crisis information...</p>
                    <p className="loading-message">Processing emergency data...</p>
                    <p className="loading-message">Generating crisis insights...</p>
                </div>
            </div>
        </div>
    );
};

export default LoadingState;