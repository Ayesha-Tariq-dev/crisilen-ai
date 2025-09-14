import React, { useState, useMemo } from 'react'
import 'leaflet/dist/leaflet.css'
import '../styles/Dashboard.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
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
} from 'chart.js'
import { format } from 'date-fns'
import classNames from 'classnames'
import {
  ChartBarIcon,
  MapIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

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
)

const Dashboard = ({ crisisData, loading }) => {
  const [activeTab, setActiveTab] = useState('map')
  const [selectedCrisis, setSelectedCrisis] = useState(null)

  const events = useMemo(() => crisisData?.events || [], [crisisData])
  const insights = useMemo(() => crisisData?.insights || {}, [crisisData])
  const metadata = useMemo(() => crisisData?.metadata || {}, [crisisData])

  const priorityEvents = useMemo(() => {
    return events
      .filter(event => event.analysis?.urgency >= 8)
      .sort((a, b) => b.analysis.urgency - a.analysis.urgency)
      .slice(0, 5)
  }, [events])

  const crisisTypeStats = useMemo(() => {
    const stats = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1
      return acc
    }, {})
    
    return {
      labels: Object.keys(stats),
      datasets: [{
        data: Object.values(stats),
        backgroundColor: [
          '#dc2626', // red
          '#2563eb', // blue
          '#ea580c', // orange
          '#7c3aed', // purple
          '#d97706', // amber
        ]
      }]
    }
  }, [events])

  const urgencyTrends = useMemo(() => {
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    )

    const labels = sortedEvents.map(event => 
      format(new Date(event.timestamp), 'HH:mm')
    )

    return {
      labels,
      datasets: [{
        label: 'Urgency Level',
        data: sortedEvents.map(event => event.analysis?.urgency || 0),
        borderColor: '#2563eb',
        tension: 0.4
      }]
    }
  }, [events])

  const renderMap = () => {
    if (!events.length) return null

    return (
      <div className="h-[600px] rounded-lg overflow-hidden">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {events.map(event => (
            <Marker
              key={event.id}
              position={[event.coordinates.lat, event.coordinates.lng]}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{event.type.toUpperCase()}</h3>
                  <p>{event.text}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Urgency: {event.analysis?.urgency}/10
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    )
  }

  const renderInsights = () => {
    if (!insights.executiveSummary) return null

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Executive Summary</h3>
          <p className="whitespace-pre-line">{insights.executiveSummary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Charts */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold mb-2">Crisis Types</h4>
            <Doughnut data={crisisTypeStats} options={{ maintainAspectRatio: false }} />
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold mb-2">Urgency Trends</h4>
            <Line data={urgencyTrends} options={{ maintainAspectRatio: false }} />
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold mb-2">Priority Events</h4>
            <ul className="space-y-2">
              {priorityEvents.map(event => (
                <li key={event.id} className="flex items-start space-x-2">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{event.type} in {event.location}</p>
                    <p className="text-xs text-gray-500">
                      Urgency: {event.analysis?.urgency}/10
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading crisis data...</p>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'map':
        return renderMap()
      case 'insights':
        return renderInsights()
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CrisisLens AI Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Last updated: {metadata.lastUpdate ? format(new Date(metadata.lastUpdate), 'HH:mm:ss') : 'N/A'}
          </span>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Active Crises</p>
              <p className="text-2xl font-semibold">{events.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ChartBarIcon className="h-6 w-6 text-blue-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Average Urgency</p>
              <p className="text-2xl font-semibold">
                {(events.reduce((acc, e) => acc + (e.analysis?.urgency || 0), 0) / events.length || 0).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <MapIcon className="h-6 w-6 text-green-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Affected Regions</p>
              <p className="text-2xl font-semibold">
                {new Set(events.map(e => e.location)).size}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ClockIcon className="h-6 w-6 text-purple-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Processing Time</p>
              <p className="text-2xl font-semibold">
                {metadata.processingTimeMs ? `${(metadata.processingTimeMs / 1000).toFixed(1)}s` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('map')}
          className={classNames(
            'px-4 py-2 rounded-lg font-medium',
            activeTab === 'map'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          Crisis Map
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={classNames(
            'px-4 py-2 rounded-lg font-medium',
            activeTab === 'insights'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          AI Insights
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {renderContent()}
      </div>
    </div>
  )
}

export default Dashboard
