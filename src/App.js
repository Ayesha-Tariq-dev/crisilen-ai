import { useState, useEffect } from 'react';
import { dataAggregator } from './services/dataAggregator';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingState from './components/LoadingState';
import './App.css';

function App() {
  const [crisisData, setCrisisData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const shouldUseMockData = process.env.REACT_APP_USE_MOCK_DATA === 'true';

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        if (!mounted) return;
        setLoading(true);
        setError(null);

        // Check if required API keys are configured
        const missingKeys = [];
        if (!process.env.REACT_APP_OPENAI_API_KEY) missingKeys.push('OpenAI API Key');
        if (!process.env.REACT_APP_NEWS_API_KEY) missingKeys.push('News API Key');

        // Use mock data if requested or if missing keys
        const useMockData = shouldUseMockData || missingKeys.length > 0;

        if (missingKeys.length > 0) {
          console.warn(`Missing API keys: ${missingKeys.join(', ')}. Using mock data instead.`);
        }

        const { data, metadata } = await dataAggregator.aggregateAllCrisisData(useMockData);

        // Get AI analysis for the crisis data
        const analyzedData = await dataAggregator.analyzeWithAI(data);

        setCrisisData({
          events: analyzedData,
          insights: await dataAggregator.generateInsights(analyzedData),
          metadata: {
            ...metadata,
            usingMockData: useMockData,
            aiAnalysisEnabled: !!process.env.REACT_APP_OPENAI_API_KEY && !useMockData
          }
        });
        setRetryCount(0); // Reset retry count on success
      } catch (err) {
        console.error('Error fetching crisis data:', err);
        const isNetworkError = err.message.includes('network') || err.message.includes('timeout');

        if (isNetworkError && retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          setTimeout(fetchData, 1000 * Math.pow(2, retryCount)); // Exponential backoff
        } else {
          setError(err.message || 'Failed to fetch crisis data. Please try again later.');
          // Fallback to mock data on error
          if (!process.env.REACT_APP_USE_MOCK_DATA) {
            console.warn('Falling back to mock data due to error');
            process.env.REACT_APP_USE_MOCK_DATA = 'true';
            fetchData();
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up polling every 5 minutes
    const pollInterval = setInterval(fetchData, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(pollInterval);
    };
  }, [retryCount, shouldUseMockData]); // dataAggregator is a singleton, no need to include it in deps

  if (error) {
    return (
      <div className="app-error-screen">
        <div className="app-error-box">
          <h2 className="app-error-title">Error</h2>
          <p className="app-error-message">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="app-retry-btn"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app-main">
        {loading ? (
          <LoadingState message="Loading crisis data..." />
        ) : (
          <Dashboard
            crisisData={crisisData}
            loading={loading}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
