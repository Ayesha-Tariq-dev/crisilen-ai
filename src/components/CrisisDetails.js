// src/components/CrisisDetails.js
import React from 'react';
import { format } from 'date-fns';
import '../styles/CrisisDetails.css';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MapPinIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { crisisTypes } from '../data/sampleCrisisData.js';

const CrisisDetails = React.memo(({ crisis }) => {
  if (!crisis) return null;

  const {
    text,
    type,
    location,
    timestamp,
    source,
    verified,
    analysis
  } = crisis;

  const urgencyClass = analysis?.urgency >= 8
    ? 'urgency-critical'
    : analysis?.urgency >= 6
    ? 'urgency-high'
    : 'urgency-medium';

  const crisisType = crisisTypes[type] || crisisTypes.other;

  const renderResourceItem = (resource, index) => 
    React.createElement('li', { key: index, className: 'resource-item' },
      React.createElement(ExclamationTriangleIcon, { className: 'resource-icon' }),
      resource
    );

  const renderActionItem = (action, index) =>
    React.createElement('li', { key: index, className: 'action-item' },
      React.createElement(InformationCircleIcon, { className: 'action-icon' }),
      action
    );

  const renderAnalysis = () => {
    if (!analysis) return null;

    return React.createElement('div', { className: 'analysis-section' },
      React.createElement('h4', { className: 'analysis-title' }, 'AI Analysis'),
      React.createElement('div', { className: 'analysis-grid' },
        React.createElement('div', null,
          React.createElement('div', { className: `urgency-meter ${urgencyClass}` },
            React.createElement(ChartBarIcon, { className: 'metric-icon' }),
            React.createElement('span', { className: 'metric-value' }, `Urgency Level: ${analysis.urgency}/10`)
          ),
          React.createElement('div', { className: 'metrics-list' },
            React.createElement('p', null,
              React.createElement('span', { className: 'metric-label' }, 'Risk Level: '),
              analysis.riskLevel
            ),
            React.createElement('p', null,
              React.createElement('span', { className: 'metric-label' }, 'Casualties: '),
              analysis.estimatedCasualties
            )
          )
        ),
        React.createElement('div', null,
          React.createElement('h5', { className: 'section-subtitle' }, 'Resources Needed:'),
          React.createElement('ul', { className: 'resources-list' },
            analysis.resourcesNeeded.map(renderResourceItem)
          )
        )
      ),
      React.createElement('div', { className: 'actions-section' },
        React.createElement('h5', { className: 'section-subtitle' }, 'Immediate Actions:'),
        React.createElement('ul', { className: 'actions-list' },
          analysis.immediateActions.map(renderActionItem)
        )
      ),
      analysis.stakeholders && React.createElement('div', { className: 'stakeholders-section' },
        React.createElement('span', { className: 'stakeholders-label' }, 'Key Stakeholders: '),
        analysis.stakeholders.join(', ')
      ),
      analysis.confidence && React.createElement('div', { className: 'confidence-info' },
        `Analysis confidence: ${Math.round(analysis.confidence * 100)}%`
      )
    );
  };

  return React.createElement('div', { className: 'crisis-details' },
    React.createElement('div', { className: 'crisis-header' },
      React.createElement('div', { className: 'crisis-title-group' },
        React.createElement('span', { className: 'crisis-icon' }, crisisType.icon),
        React.createElement('h3', { className: 'crisis-title' }, type.replace('_', ' ').toUpperCase())
      ),
      verified && React.createElement('span', {
        className: 'crisis-verified'
      }, 'Verified')
    ),
    React.createElement('p', { className: 'crisis-description' }, text),
    React.createElement('div', { className: 'crisis-metadata' },
      React.createElement('div', { className: 'metadata-item' },
        React.createElement(MapPinIcon, { className: 'metadata-icon' }),
        location
      ),
      React.createElement('div', { className: 'metadata-item' },
        React.createElement(CalendarIcon, { className: 'metadata-icon' }),
        format(new Date(timestamp), 'MMM d, HH:mm')
      )
    ),
    renderAnalysis(),
    React.createElement('div', { className: 'crisis-source' },
      `Source: ${source}`
    )
  );
});

CrisisDetails.displayName = 'CrisisDetails';

export default CrisisDetails;