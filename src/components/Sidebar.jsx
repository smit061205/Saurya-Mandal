import React from 'react';
import { yuvaData } from '../data';

/**
 * Collapsible sidebar menu listing all Yuva Kendra categories as planets.
 * On desktop: slides left/right from the left edge.
 * On mobile: slides up/down from the bottom edge.
 */
export default function Sidebar({ isOpen, activeId, onSelect }) {
  return (
    <aside className={`sidebar${isOpen ? '' : ' collapsed'}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" />
          <div>
            <div className="sidebar-title">યુવા કેન્દ્ર</div>
            <div className="sidebar-subtitle">Yuva Kendra</div>
          </div>
        </div>
        <p className="sidebar-subtitle" style={{ marginTop: 6 }}>
          મુખ્ય કેન્દ્ર (સૂર્ય) — ગ્રહ ક્લિક કરો
        </p>
      </div>

      {/* Menu Items */}
      <nav className="menu-list" aria-label="Categories">
        {yuvaData.map((item) => (
          <button
            key={item.id}
            id={`menu-item-${item.id}`}
            className={`menu-item${activeId === item.id ? ' active' : ''}`}
            onClick={() => onSelect(item.id)}
            aria-pressed={activeId === item.id}
          >
            <span
              className="menu-item-dot"
              style={{ backgroundColor: item.cssColor, color: item.cssColor }}
            />
            <span className="menu-item-name">{item.name}</span>
            <span className="menu-item-planet">
              {item.planet.split(' ')[0]}
            </span>
          </button>
        ))}
      </nav>

      {/* Footer hint */}
      <div className="sidebar-header" style={{ borderTop: '1px solid rgba(255,204,0,0.15)', borderBottom: 'none', padding: '12px 20px' }}>
        <p className="sidebar-subtitle" style={{ fontSize: 11 }}>
          🌌 ગ્રહ પર ક્લિક કરો અથવા ઉપર ચૂંટો
        </p>
      </div>
    </aside>
  );
}
