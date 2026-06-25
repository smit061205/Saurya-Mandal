import React from 'react';

/**
 * Hamburger/chevron toggle button for the sidebar.
 * Renders as a side tab on desktop and a floating pill on mobile.
 */
export default function SidebarToggle({ isOpen, onToggle }) {
  return (
    <>
      {/* Desktop toggle tab */}
      <button
        id="sidebar-toggle-desktop"
        className={`sidebar-toggle desktop${isOpen ? '' : ' collapsed'}`}
        onClick={onToggle}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <svg
          width="10"
          height="18"
          viewBox="0 0 10 18"
          fill="none"
          style={{
            transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.3s',
          }}
        >
          <path
            d="M8 2L2 9L8 16"
            stroke="#ffcc00"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Mobile toggle pill */}
      <button
        id="sidebar-toggle-mobile"
        className={`sidebar-toggle mobile${isOpen ? ' open' : ''}`}
        onClick={onToggle}
        aria-label={isOpen ? 'Hide menu' : 'Show menu'}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
          }}
        >
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke="#ffcc00"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <span style={{ color: '#ffcc00' }}>{isOpen ? 'બંધ' : 'મેનૂ'}</span>
      </button>
    </>
  );
}
