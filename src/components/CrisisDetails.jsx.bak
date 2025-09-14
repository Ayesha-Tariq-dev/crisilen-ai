import React from 'react'
import { format } from 'date-fns'
import '../styles/CrisisDetails.css'
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MapPinIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { crisisTypes } from '../data/sampleCrisisData.js'

const CrisisDetails = ({ crisis }) => {
  if (!crisis) return null

  const {
    text,
    type,
    location,
    timestamp,
    source,
    verified,
    analysis
  } = crisis

  const urgencyColor = analysis?.urgency >= 8
    ? 'text-red-600'
    : analysis?.urgency >= 6
    ? 'text-orange-600'
    : 'text-yellow-600'

  const crisisType = crisisTypes[type] || crisisTypes.other

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{crisisType.icon}</span>
          <h3 className="text-lg font-semibold">{type.replace('_', ' ').toUpperCase()}</h3>
        </div>
        {verified && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Verified
          </span>
        )}
      </div>

      <p className="text-gray-700 mb-4">{text}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <MapPinIcon className="h-5 w-5 mr-1" />
          {location}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <CalendarIcon className="h-5 w-5 mr-1" />
          {format(new Date(timestamp), 'MMM d, HH:mm')}
        </div>
      </div>

      {analysis && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold mb-2">AI Analysis</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className={`flex items-center ${urgencyColor} mb-2`}>
                <ChartBarIcon className="h-5 w-5 mr-1" />
                <span className="font-medium">Urgency Level: {analysis.urgency}/10</span>
              </div>
              
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Risk Level:</span> {analysis.riskLevel}</p>
                <p><span className="font-medium">Casualties:</span> {analysis.estimatedCasualties}</p>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium mb-1">Resources Needed:</h5>
              <ul className="text-sm space-y-1">
                {analysis.resourcesNeeded.map((resource, index) => (
                  <li key={index} className="flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 text-orange-500 mr-1" />
                    {resource}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4">
            <h5 className="text-sm font-medium mb-1">Immediate Actions:</h5>
            <ul className="text-sm space-y-1">
              {analysis.immediateActions.map((action, index) => (
                <li key={index} className="flex items-start">
                  <InformationCircleIcon className="h-4 w-4 text-blue-500 mr-1 mt-0.5" />
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {analysis.stakeholders && (
            <div className="mt-4 text-sm">
              <span className="font-medium">Key Stakeholders: </span>
              {analysis.stakeholders.join(', ')}
            </div>
          )}

          {analysis.confidence && (
            <div className="mt-2 text-xs text-gray-500">
              Analysis confidence: {Math.round(analysis.confidence * 100)}%
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Source: {source}
      </div>
    </div>
  )
}

export default CrisisDetails
