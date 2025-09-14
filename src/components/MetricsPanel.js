// src/components/MetricsPanel.js
import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { crisisTypes } from '../data/sampleCrisisData.js';

const MetricCard = React.memo(({ title, value, icon }) =>
  React.createElement('div', { className: 'bg-white rounded-lg shadow p-4' },
    React.createElement('h3', { className: 'text-sm font-medium text-gray-500' }, title),
    icon 
      ? React.createElement('div', { className: 'mt-1 flex items-center' },
          icon,
          React.createElement('span', { className: 'ml-1 text-xl font-semibold capitalize' }, value)
        )
      : React.createElement('p', { className: 'mt-1 text-3xl font-semibold' }, value)
  )
);

const ChartCard = React.memo(({ title, children }) =>
  React.createElement('div', { className: 'bg-white rounded-lg shadow p-4' },
    React.createElement('h3', { className: 'text-sm font-medium text-gray-500 mb-4' }, title),
    React.createElement('div', { className: 'h-64' }, children)
  )
);

const TypeTrendCard = React.memo(({ type, data, icon }) =>
  React.createElement('div', { 
    className: 'flex items-center justify-between p-3 bg-gray-50 rounded-lg'
  },
    React.createElement('div', null,
      React.createElement('span', { className: 'text-2xl mr-2' }, crisisTypes[type]?.icon || '⚠️'),
      React.createElement('span', { className: 'font-medium capitalize' }, type.replace('_', ' ')),
      React.createElement('div', { className: 'text-sm text-gray-500' },
        `Count: ${data.count} | Avg Urgency: ${data.avgUrgency.toFixed(1)}`
      )
    ),
    icon
  )
);

const MetricsPanel = React.memo(({ insights }) => {
  if (!insights) return null;

  const { metrics, trends, recommendations } = insights;

  const typeChartData = {
    labels: Object.keys(metrics.typeCounts).map(type => 
      crisisTypes[type]?.name || type
    ),
    datasets: [{
      data: Object.values(metrics.typeCounts),
      backgroundColor: Object.keys(metrics.typeCounts).map(type => 
        crisisTypes[type]?.color || '#666666'
      ),
      borderWidth: 1
    }]
  };

  const trendChartData = {
    labels: trends.hourlyData.map(d => `${d.hour}h ago`),
    datasets: [{
      label: 'Average Urgency',
      data: trends.hourlyData.map(d => d.avgUrgency),
      borderColor: '#2563eb',
      tension: 0.4
    }]
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return React.createElement(ArrowTrendingUpIcon, { className: 'h-5 w-5 text-red-500' });
      case 'decreasing':
        return React.createElement(ArrowTrendingDownIcon, { className: 'h-5 w-5 text-green-500' });
      default:
        return React.createElement(MinusIcon, { className: 'h-5 w-5 text-gray-500' });
    }
  };

  const renderCharts = () =>
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
      React.createElement(ChartCard, { title: 'Crisis Types Distribution' },
        React.createElement(Doughnut, {
          data: typeChartData,
          options: {
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'right' }
            }
          }
        })
      ),
      React.createElement(ChartCard, { title: 'Urgency Trend' },
        React.createElement(Line, {
          data: trendChartData,
          options: {
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 10
              }
            }
          }
        })
      )
    );

  const renderRecommendation = (rec, index) =>
    React.createElement('li', { key: index, className: 'flex items-start' },
      React.createElement('span', {
        className: 'flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 text-sm font-medium'
      }, index + 1),
      React.createElement('span', { className: 'ml-3' }, rec)
    );

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
      React.createElement(MetricCard, {
        title: 'Total Events',
        value: metrics.totalEvents
      }),
      React.createElement(MetricCard, {
        title: 'Average Urgency',
        value: metrics.averageUrgency.toFixed(1)
      }),
      React.createElement(MetricCard, {
        title: 'Trend',
        value: trends.overall,
        icon: getTrendIcon(trends.overall)
      })
    ),
    renderCharts(),
    React.createElement('div', { className: 'bg-white rounded-lg shadow p-4' },
      React.createElement('h3', { className: 'text-sm font-medium text-gray-500 mb-4' }, 'Crisis Type Trends'),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' },
        Object.entries(trends.byType).map(([type, data]) =>
          React.createElement(TypeTrendCard, {
            key: type,
            type,
            data,
            icon: getTrendIcon(data.trend)
          })
        )
      )
    ),
    React.createElement('div', { className: 'bg-white rounded-lg shadow p-4' },
      React.createElement('h3', { className: 'text-sm font-medium text-gray-500 mb-4' }, 'AI Recommendations'),
      React.createElement('ul', { className: 'space-y-2' },
        recommendations.map(renderRecommendation)
      )
    )
  );
});

MetricsPanel.displayName = 'MetricsPanel';

export default MetricsPanel;