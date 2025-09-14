import React from 'react'
import { format } from 'date-fns'
import { crisisTypes } from '../data/sampleCrisisData.js'

const CrisisEventList = ({ events, selectedEvent, onSelectEvent }) => {
  const getUrgencyColor = (urgency) => {
    if (urgency >= 8) return 'bg-red-100 text-red-800 border-red-300'
    if (urgency >= 6) return 'bg-orange-100 text-orange-800 border-orange-300'
    if (urgency >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-green-100 text-green-800 border-green-300'
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Active Crisis Events</h2>
        <p className="text-sm text-gray-500">
          Showing {events.length} events, sorted by urgency
        </p>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {events.map(event => {
          const crisisType = crisisTypes[event.type] || crisisTypes.other
          const urgencyColorClass = getUrgencyColor(event.analysis?.urgency)
          const isSelected = selectedEvent?.id === event.id

          return (
            <button
              key={event.id}
              className={`w-full text-left p-4 border-b border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors ${
                isSelected ? 'bg-blue-50' : ''
              }`}
              onClick={() => onSelectEvent(event)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{crisisType.icon}</span>
                  <span className="font-medium capitalize">{event.type.replace('_', ' ')}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${urgencyColorClass}`}>
                  Urgency: {event.analysis?.urgency || 'N/A'}/10
                </span>
              </div>

              <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                {event.text}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <span className="mr-2">📍 {event.location}</span>
                  <span>🕒 {format(new Date(event.timestamp), 'HH:mm')}</span>
                </div>
                {event.verified && (
                  <span className="inline-flex items-center text-green-600">
                    ✓ Verified
                  </span>
                )}
              </div>

              {event.analysis && (
                <div className="mt-2 text-xs">
                  <span className="font-medium">Immediate Action: </span>
                  {event.analysis.immediateActions[0]}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CrisisEventList
