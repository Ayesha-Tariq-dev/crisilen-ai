// src/components/CrisisEventList.js
import React from 'react';
import { format } from 'date-fns';
import { crisisTypes } from '../data/sampleCrisisData.js';
import '../styles/CrisisEventList.css';

const getUrgencyClass = (urgency) => {
  if (urgency >= 8) return 'urgency-critical';
  if (urgency >= 6) return 'urgency-high';
  if (urgency >= 4) return 'urgency-medium';
  return 'urgency-low';
};

const CrisisEventList = React.memo(({ events, selectedEvent, onSelectEvent }) => {
  const renderEvent = (event) => {
    const crisisType = crisisTypes[event.type] || crisisTypes.other;
    const urgencyColorClass = getUrgencyColor(event.analysis?.urgency);
    const isSelected = selectedEvent?.id === event.id;

    const renderEventHeader = () => 
      React.createElement('div', { className: 'event-header' },
        React.createElement('div', { className: 'event-type' },
          React.createElement('span', { className: 'event-icon' }, crisisType.icon),
          React.createElement('span', { className: 'event-type-text' }, 
            event.type.replace('_', ' ')
          )
        ),
        React.createElement('span', { 
          className: `urgency-badge ${getUrgencyClass(event.analysis?.urgency)}`
        }, `Urgency: ${event.analysis?.urgency || 'N/A'}/10`)
      );

    const renderEventMeta = () =>
      React.createElement('div', { className: 'event-meta' },
        React.createElement('div', { className: 'event-info' },
          React.createElement('span', { className: 'event-location' }, `📍 ${event.location}`),
          React.createElement('span', { className: 'event-time' }, `🕒 ${format(new Date(event.timestamp), 'HH:mm')}`)
        ),
        event.verified && React.createElement('span', { 
          className: 'event-verified'
        }, '✓ Verified')
      );

    return React.createElement('button', {
      key: event.id,
      className: `event-item ${isSelected ? 'selected' : ''}`,
      onClick: () => onSelectEvent(event)
    },
      renderEventHeader(),
      React.createElement('p', { 
        className: 'event-description'
      }, event.text),
      renderEventMeta(),
      event.analysis && React.createElement('div', { className: 'event-action' },
        React.createElement('span', { className: 'event-action-label' }, 'Immediate Action: '),
        event.analysis.immediateActions[0]
      )
    );
  };

  return React.createElement('div', { className: 'event-list-container' },
    React.createElement('div', { className: 'event-list-header' },
      React.createElement('h2', { className: 'event-list-title' }, 'Active Crisis Events'),
      React.createElement('p', { className: 'event-list-subtitle' },
        `Showing ${events.length} events, sorted by urgency`
      )
    ),
    React.createElement('div', { 
      className: 'event-list-content'
    }, events.map(renderEvent))
  );
});

CrisisEventList.displayName = 'CrisisEventList';

export default CrisisEventList;