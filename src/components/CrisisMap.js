// src/components/CrisisMap.js
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { crisisTypes } from '../data/sampleCrisisData.js';
import { divIcon } from 'leaflet';
import '../styles/CrisisMap.css';

const createMarkerIcon = (type, urgency) => {
  const crisisType = crisisTypes[type] || crisisTypes.other;
  const markerClass = urgency >= 8 ? 'marker-large' : 'marker-normal';
  const pulseClass = urgency >= 8 ? 'marker-pulse' : '';

  return divIcon({
    html: `
      <div class="map-marker ${markerClass}">
        <span class="marker-icon ${pulseClass}">
          ${crisisType.icon}
        </span>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
};

const CrisisMap = React.memo(({ events, onSelectEvent }) => {
  const renderMarker = (event) => {
    if (!event.coordinates?.lat || !event.coordinates?.lng) {
      return null;
    }

    return React.createElement(Marker, {
      key: event.id,
      position: [event.coordinates.lat, event.coordinates.lng],
      icon: createMarkerIcon(event.type, event.analysis?.urgency),
      eventHandlers: {
        click: () => onSelectEvent(event)
      }
    },
      React.createElement(Popup, null,
        React.createElement('div', { className: 'popup-container' },
          React.createElement('div', { className: 'popup-header' },
            React.createElement('span', { className: 'popup-icon' },
              crisisTypes[event.type]?.icon || '⚠️'
            ),
            event.analysis && React.createElement('span', {
              className: 'popup-urgency'
            }, `Urgency: ${event.analysis.urgency}/10`)
          ),
          React.createElement('h3', { className: 'popup-title' },
            event.type.replace('_', ' ')
          ),
          React.createElement('p', { className: 'text-sm text-gray-600 mb-2' },
            event.text.length > 100 ? `${event.text.substring(0, 100)}...` : event.text
          ),
          React.createElement('div', { className: 'text-xs text-gray-500' },
            React.createElement('div', null, `📍 ${event.location}`),
            event.verified && React.createElement('div', { className: 'text-green-600' },
              '✓ Verified Source'
            )
          ),
          React.createElement('button', {
            onClick: () => onSelectEvent(event),
            className: 'mt-2 w-full px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:underline'
          }, 'View Details →')
        )
      )
    );
  };

  return React.createElement(MapContainer, {
    center: [20, 0],
    zoom: 2,
    className: 'h-full w-full rounded-lg overflow-hidden',
    style: { minHeight: '600px' }
  },
    React.createElement(TileLayer, {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors'
    }),
    events.map(renderMarker)
  );
});

CrisisMap.displayName = 'CrisisMap';

export default CrisisMap;