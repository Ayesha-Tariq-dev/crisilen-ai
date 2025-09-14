import React from 'react'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline'
import { crisisTypes } from '../data/sampleCrisisData.js'

const MetricsPanel = ({ insights }) => {
  if (!insights) return null

  const { metrics, trends, recommendations } = insights

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
  }

  const trendChartData = {
    labels: trends.hourlyData.map(d => `${d.hour}h ago`),
    datasets: [{
      label: 'Average Urgency',
      data: trends.hourlyData.map(d => d.avgUrgency),
      borderColor: '#2563eb',
      tension: 0.4
    }]
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-red-500" />
      case 'decreasing':
        return <ArrowTrendingDownIcon className="h-5 w-5 text-green-500" />
      default:
        return <MinusIcon className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Events</h3>
          <p className="mt-1 text-3xl font-semibold">{metrics.totalEvents}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Average Urgency</h3>
          <p className="mt-1 text-3xl font-semibold">{metrics.averageUrgency.toFixed(1)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Trend</h3>
          <div className="mt-1 flex items-center">
            {getTrendIcon(trends.overall)}
            <span className="ml-1 text-xl font-semibold capitalize">
              {trends.overall}
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Crisis Types Distribution</h3>
          <div className="h-64">
            <Doughnut 
              data={typeChartData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Urgency Trend</h3>
          <div className="h-64">
            <Line 
              data={trendChartData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Type-based Trends */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Crisis Type Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(trends.byType).map(([type, data]) => (
            <div 
              key={type}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <span className="text-2xl mr-2">{crisisTypes[type]?.icon || '⚠️'}</span>
                <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
                <div className="text-sm text-gray-500">
                  Count: {data.count} | Avg Urgency: {data.avgUrgency.toFixed(1)}
                </div>
              </div>
              {getTrendIcon(data.trend)}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-4">AI Recommendations</h3>
        <ul className="space-y-2">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                {index + 1}
              </span>
              <span className="ml-3">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default MetricsPanel
