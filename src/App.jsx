import React, { useEffect, useRef, useState } from 'react';
import './index.css';
import { useSolarSystem } from './hooks/useSolarSystem';
import Sidebar from './components/Sidebar';
import SidebarToggle from './components/SidebarToggle';
import InfoPanel from './components/InfoPanel';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const isMobile = () => window.innerWidth <= 768;

  // On mobile, start with sidebar closed
  useEffect(() => {
    if (isMobile()) setSidebarOpen(false);
  }, []);

  // Use a ref for solarSystem so callbacks defined before it can still call it
  const solarSystemRef = useRef(null);

  // ── Close info panel ───────────────────────────────────────
  // Defined FIRST so it can be safely referenced anywhere below
  const handleClose = () => {
    setSelectedId(null);
    solarSystemRef.current?.deselectPlanet();
  };

  // ── 3D planet click (from Three.js raycaster) ──────────────
  const handlePlanetClick = (id) => {
    setSelectedId(id);
    if (isMobile()) setSidebarOpen(false);
  };

  // ── Void click (empty space) ───────────────────────────────
  const handleVoidClick = () => {
    handleClose();
  };

  const solarSystem = useSolarSystem({
    onPlanetClick: handlePlanetClick,
    onVoidClick: handleVoidClick,
  });

  // Keep ref in sync so handleClose can always reach the latest solarSystem
  solarSystemRef.current = solarSystem;

  useEffect(() => {
    const cleanup = solarSystem.init();
    return () => cleanup?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sidebar menu click ─────────────────────────────────────
  const handleMenuSelect = (id) => {
    setSelectedId(id);
    solarSystem.selectPlanet(id);
    if (isMobile()) setSidebarOpen(false);
  };

  return (
    <>
      {/* Three.js Canvas */}
      <canvas id="three-canvas" />

      {/* Planet Labels Layer */}
      <div id="labels-container" />

      {/* Mobile top bar */}
      <div className="top-bar">
        <div className="top-bar-sun" />
        <div>
          <div className="top-bar-title">યુવા કેન્દ્ર</div>
          <div className="top-bar-subtitle">સૌર મંડળ</div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        activeId={selectedId}
        onSelect={handleMenuSelect}
      />

      {/* Sidebar Toggle */}
      <SidebarToggle
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />

      {/* Info Panel */}
      {selectedId !== null && (
        <InfoPanel key={selectedId} selectedId={selectedId} onClose={handleClose} />
      )}

      {/* Interaction hint */}
      <div className="hint">
        🖱️ Drag to rotate &nbsp;·&nbsp; Scroll to zoom &nbsp;·&nbsp; Click planet for info
      </div>
    </>
  );
}
