import React from 'react';
import { yuvaData } from '../data';

/**
 * Info panel that slides in when a planet/category is selected.
 * Displays Gujarati name, planet equivalent, and description.
 */
export default function InfoPanel({ selectedId, onClose }) {
  if (selectedId === null) return null;

  const data = yuvaData[selectedId];
  if (!data) return null;

  return (
    <div
      id="info-panel"
      className="info-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-title"
    >
      <div className="info-panel-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span
            className="info-panel-planet-dot"
            style={{ backgroundColor: data.cssColor, color: data.cssColor }}
          />
          <div>
            <h2 id="info-title" className="info-title">{data.name}</h2>
            <div className="info-subtitle">{data.planet}</div>
          </div>
        </div>
        <button
          className="close-btn"
          onClick={onClose}
          aria-label="Close info panel"
          id="info-close-btn"
        >
          ✕
        </button>
      </div>

      <div
        id="info-desc"
        className="info-desc"
        dangerouslySetInnerHTML={{ __html: data.desc }}
      />

      {/* Decorative gradient bar */}
      <div
        style={{
          marginTop: 20,
          height: 3,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${data.cssColor}66, transparent)`,
        }}
      />
    </div>
  );
}
