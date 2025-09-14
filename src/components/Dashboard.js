// src/components/Dashboard.js
import React, { useState, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import '../styles/Dashboard.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';
import { format } from 'date-fns';
import classNames from 'classnames';
import {
  ChartBarIcon,
  MapIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StatsCard = React.memo(({ Icon, label, value, iconColor }) =>
  React.createElement('div', { className: 'stats-card' },
    React.createElement('div', { className: 'stats-content' },
      React.createElement(Icon, { className: `stats-icon ${iconColor}` }),
      React.createElement('div', { className: 'stats-text' },
        React.createElement('p', { className: 'stats-label' }, label),
        React.createElement('p', { className: 'stats-value' }, value)
      )
    )
  )
);

const TabButton = React.memo(({ label, isActive, onClick }) =>
  React.createElement('button', {
    onClick,
    className: classNames(
      'tab-button',
      isActive ? 'tab-active' : 'tab-inactive'
    )
  }, label)
);

const Dashboard = React.memo(({ crisisData, loading }) => {
  const [activeTab, setActiveTab] = useState('map');

  const events = useMemo(() => {
    // Handle both direct events array and nested events structure
    return Array.isArray(crisisData) ? crisisData : (crisisData?.events || []);
  }, [crisisData]);

  // If crisisData is an array, it's the fallback data
  const insights = useMemo(() => {
    if (Array.isArray(crisisData)) {
      return crisisData.reduce((acc, event) => {
        if (event.id) {
          acc[event.id] = event.analysis;
        }
        return acc;
      }, {});
    }
    return crisisData?.insights || {};
  }, [crisisData]);

  const metadata = useMemo(() => crisisData?.metadata || {}, [crisisData]);

  const priorityEvents = useMemo(() =>
    events
      .filter(event => event.analysis?.urgency >= 8)
      .sort((a, b) => b.analysis.urgency - a.analysis.urgency)
      .slice(0, 5),
    [events]
  );

  const crisisTypeStats = useMemo(() => {
    const stats = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(stats),
      datasets: [{
        data: Object.values(stats),
        backgroundColor: [
          '#dc2626', '#2563eb', '#ea580c', '#7c3aed', '#d97706'
        ]
      }]
    };
  }, [events]);

  const urgencyTrends = useMemo(() => ({
    labels: events
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(event => format(new Date(event.timestamp), 'HH:mm')),
    datasets: [{
      label: 'Urgency Level',
      data: events.map(event => event.analysis?.urgency || 0),
      borderColor: '#2563eb',
      tension: 0.4
    }]
  }), [events]);

  const renderMap = () => {
    if (!events.length) return null;

    return React.createElement('div', { className: 'map-container' },
      React.createElement(MapContainer, {
        center: [20, 0],
        zoom: 2,
        className: 'map'
      },
        React.createElement(TileLayer, {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; OpenStreetMap contributors'
        }),
        events.filter(event => event && event.coordinates).map(event => {
          // Default to a fallback location if coordinates are partially missing
          const lat = event.coordinates.lat || 0;
          const lng = event.coordinates.lng || 0;

          return React.createElement(Marker, {
            key: event.id || Math.random().toString(),
            position: [lat, lng]
          },
            React.createElement(Popup, null,
              React.createElement('div', { className: 'map-popup' },
                React.createElement('h3', { className: 'map-popup-title' }, (event.type || 'Unknown').toUpperCase()),
                React.createElement('p', { className: 'map-popup-text' }, event.text || 'No description available'),
                React.createElement('p', { className: 'map-popup-urgency' },
                  `Urgency: ${event.analysis?.urgency}/10`
                )
              )
            )
          );
        })
      )
    );
  };

  const renderPriorityEvent = (event) =>
    React.createElement('li', { key: event.id, className: 'priority-event' },
      React.createElement(ExclamationCircleIcon, { className: 'priority-event-icon' }),
      React.createElement('div', { className: 'priority-event-content' },
        React.createElement('p', { className: 'priority-event-title' },
          `${event.type} in ${event.location}`
        ),
        React.createElement('p', { className: 'priority-event-meta' },
          `Urgency: ${event.analysis?.urgency}/10`
        )
      )
    );

  const renderInsights = () => {
    if (!insights.executiveSummary) return null;

    return React.createElement('div', { className: 'insights-container' },
      React.createElement('div', { className: 'summary-card' },
        React.createElement('h3', { className: 'summary-title' }, 'Executive Summary'),
        React.createElement('p', { className: 'summary-text' }, insights.executiveSummary)
      ),
      React.createElement('div', { className: 'charts-grid' },
        React.createElement('div', { className: 'chart-card' },
          React.createElement('h4', { className: 'chart-title' }, 'Crisis Types'),
          React.createElement(Doughnut, {
            data: crisisTypeStats,
            options: { maintainAspectRatio: false }
          })
        ),
        React.createElement('div', { className: 'chart-card' },
          React.createElement('h4', { className: 'chart-title' }, 'Urgency Trends'),
          React.createElement(Line, {
            data: urgencyTrends,
            options: { maintainAspectRatio: false }
          })
        ),
        React.createElement('div', { className: 'chart-card' },
          React.createElement('h4', { className: 'chart-title' }, 'Priority Events'),
          React.createElement('ul', { className: 'priority-list' },
            priorityEvents.map(renderPriorityEvent)
          )
        )
      )
    );
  };

  const renderContent = () => {
    if (loading) {
      return React.createElement('div', { className: 'loading-container' },
        React.createElement('div', { className: 'loading-content' },
          React.createElement('div', { className: 'loading-spinner' }),
          React.createElement('p', { className: 'loading-text' }, 'Loading crisis data...')
        )
      );
    }

    switch (activeTab) {
      case 'map': return renderMap();
      case 'insights': return renderInsights();
      default: return null;
    }
  };

  const stats = [
    {
      Icon: ExclamationCircleIcon,
      label: 'Active Crises',
      value: events.length,
      iconColor: 'icon-critical'
    },
    {
      Icon: ChartBarIcon,
      label: 'Average Urgency',
      value: (events.reduce((acc, e) => acc + (e.analysis?.urgency || 0), 0) / events.length || 0).toFixed(1),
      iconColor: 'icon-info'
    },
    {
      Icon: MapIcon,
      label: 'Affected Regions',
      value: new Set(events.map(e => e.location)).size,
      iconColor: 'icon-success'
    },
    {
      Icon: ClockIcon,
      label: 'Processing Time',
      value: metadata.processingTimeMs ? `${(metadata.processingTimeMs / 1000).toFixed(1)}s` : 'N/A',
      iconColor: 'icon-accent'
    }
  ];

  return React.createElement('div', { className: 'dashboard-container' },
    React.createElement('div', { className: 'dashboard-header' },
      React.createElement('h1', { className: 'dashboard-title' }, 'CrisisLens AI Dashboard'),
      React.createElement('div', { className: 'dashboard-controls' },
        React.createElement('span', { className: 'last-update' },
          `Last updated: ${metadata.lastUpdate ? format(new Date(metadata.lastUpdate), 'HH:mm:ss') : 'N/A'}`
        ),
        React.createElement('button', {
          onClick: () => window.location.reload(),
          className: 'refresh-button'
        }, 'Refresh')
      )
    ),
    React.createElement('div', { className: 'stats-grid' },
      stats.map((stat, index) =>
        React.createElement(StatsCard, { key: index, ...stat })
      )
    ),
    React.createElement('div', { className: 'tabs-container' },
      React.createElement(TabButton, {
        label: 'Crisis Map',
        isActive: activeTab === 'map',
        onClick: () => setActiveTab('map')
      }),
      React.createElement(TabButton, {
        label: 'AI Insights',
        isActive: activeTab === 'insights',
        onClick: () => setActiveTab('insights')
      })
    ),
    React.createElement('div', { className: 'content-container' },
      renderContent()
    )
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;