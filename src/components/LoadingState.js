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
                <p className="loading-message">
                    Fetching real-time crisis information and generating insights...
                </p>
            </div>
        </div>
    );
};

export default LoadingState;