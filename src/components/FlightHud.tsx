import React, { useEffect, useRef } from 'react';
import { CameraMode, FlightState, Landmark, TerrainEngine } from '../types/flight';
import { Volume2, VolumeX, Eye, Compass, HelpCircle, Flame, Layers } from 'lucide-react';

interface FlightHudProps {
  flight: FlightState;
  targetLandmark: (Landmark & { screenX?: number; screenY?: number; inFront?: boolean }) | null;
  cameraMode: CameraMode;
  terrainEngine: TerrainEngine;
  onToggleHypersonic: () => void;
  onSetThrottle: (throttle: number) => void;
  onCycleCamera: () => void;
  onToggleAudio: () => void;
  onOpenLocations: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onPitchInput?: (direction: 'up' | 'down', active: boolean) => void;
  onRollInput?: (direction: 'left' | 'right', active: boolean) => void;
}

export const FlightHud: React.FC<FlightHudProps> = ({
  flight,
  targetLandmark,
  cameraMode,
  terrainEngine,
  onToggleHypersonic,
  onSetThrottle,
  onCycleCamera,
  onToggleAudio,
  onOpenLocations,
  onOpenSettings,
  onOpenHelp,
  onPitchInput,
  onRollInput
}) => {
  const warpCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Hypersonic warp streak canvas animation
  useEffect(() => {
    const canvas = warpCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const streakCount = 90;
    const streaks = Array.from({ length: streakCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 0.8 + 0.1,
      speed: Math.random() * 0.04 + 0.02,
      length: Math.random() * 60 + 20
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (flight.hypersonicFactor > 0.02) {
        const factor = flight.hypersonicFactor;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const maxRadius = Math.max(cx, cy);

        ctx.lineWidth = 1.5;
        for (const s of streaks) {
          s.dist += s.speed * (1 + factor * 3.5);
          if (s.dist > 1.2) {
            s.dist = 0.08 + Math.random() * 0.15;
            s.angle = Math.random() * Math.PI * 2;
          }

          const r1 = s.dist * maxRadius;
          const r2 = r1 + s.length * (0.5 + factor * 2.5);

          const x1 = cx + Math.cos(s.angle) * r1;
          const y1 = cy + Math.sin(s.angle) * r1;
          const x2 = cx + Math.cos(s.angle) * r2;
          const y2 = cy + Math.sin(s.angle) * r2;

          const alpha = Math.min(factor * (s.dist * 0.9), 0.85);
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Radial speed cone glow
        const radGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, maxRadius * 0.95);
        radGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
        radGrad.addColorStop(0.7, `rgba(0, 240, 255, ${factor * 0.05})`);
        radGrad.addColorStop(1, `rgba(0, 180, 255, ${factor * 0.25})`);
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [flight.hypersonicFactor]);

  // Sync canvas size to screen size
  useEffect(() => {
    const handleResize = () => {
      if (warpCanvasRef.current) {
        warpCanvasRef.current.width = window.innerWidth;
        warpCanvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Format latitude and longitude like military HUD
  const formatCoord = (val: number, isLat: boolean) => {
    const dir = isLat ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W');
    const absVal = Math.abs(val);
    const deg = Math.floor(absVal);
    const min = ((absVal - deg) * 60).toFixed(2);
    return `${deg}°${min}'${dir}`;
  };

  // Heading compass degree offsets
  const headingVal = Math.round(flight.heading) % 360;
  const compassTicks: { deg: number; label: string }[] = [];
  for (let d = headingVal - 45; d <= headingVal + 45; d += 5) {
    const norm = (d + 360) % 360;
    let label = `${norm}`;
    if (norm === 0) label = 'N';
    else if (norm === 45) label = 'NE';
    else if (norm === 90) label = 'E';
    else if (norm === 135) label = 'SE';
    else if (norm === 180) label = 'S';
    else if (norm === 225) label = 'SW';
    else if (norm === 270) label = 'W';
    else if (norm === 315) label = 'NW';
    compassTicks.push({ deg: d, label });
  }

  // Pitch ladder degree offsets
  const pitchInt = Math.round(flight.pitch);
  const pitchSteps = [-30, -20, -10, 0, 10, 20, 30];

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden font-mono-hud select-none">
      {/* Visor Vignette and scanline overlay */}
      <div className="absolute inset-0 hud-visor-overlay" />
      <div className="absolute inset-0 hud-scanlines" />

      {/* Hypersonic Warp Canvas */}
      <canvas
        ref={warpCanvasRef}
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* Top Sci-Fi Navigation Bar */}
      <div className="absolute top-0 inset-x-0 h-14 flex items-center justify-between px-6 z-30 pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Left: Brand / System Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse hud-glow" />
            <span className="font-orbitron font-black text-cyan-300 tracking-widest text-sm">
              APEX // MACH-1
            </span>
          </div>

          <div className="h-4 w-px bg-cyan-500/30" />

          {/* Terrain Engine Badge */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-cyan-500/40 rounded bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 transition-colors"
            title="Configure Cesium ion Token & 3D Terrain"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {terrainEngine === 'google-3d-tiles'
                ? 'GOOGLE 3D TILES'
                : terrainEngine === 'cesium-world-terrain'
                ? 'CESIUM WORLD TERRAIN'
                : 'OSM ZERO-KEY MODE'}
            </span>
          </button>
        </div>

        {/* Center: Top Heading Compass Ribbon */}
        <div className="relative w-96 h-10 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-x-0 bottom-0 h-px bg-cyan-500/40" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-cyan-300" />

          <div className="flex items-center gap-6 text-xs text-cyan-300/80">
            {compassTicks.map((tick, idx) => {
              const offset = (tick.deg - headingVal) * 3.5;
              if (Math.abs(offset) > 170) return null;
              const isCenter = Math.abs(tick.deg - headingVal) < 2.5;
              return (
                <div
                  key={idx}
                  className="absolute flex flex-col items-center transition-all"
                  style={{ transform: `translateX(${offset}px)` }}
                >
                  <div
                    className={`h-2.5 w-px ${
                      isCenter ? 'bg-cyan-300 h-3.5 w-0.5' : 'bg-cyan-500/50'
                    }`}
                  />
                  <span
                    className={`mt-1 font-semibold ${
                      isCenter ? 'text-white text-xs font-bold hud-text-glow' : 'text-[10px] text-cyan-400/70'
                    }`}
                  >
                    {tick.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Controls & Modals */}
        <div className="flex items-center gap-2">
          {/* Location presets button */}
          <button
            onClick={onOpenLocations}
            className="flex items-center gap-1.5 px-3 py-1 text-xs border border-cyan-500/40 rounded bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>LOCATIONS</span>
          </button>

          {/* Camera View Switcher */}
          <button
            onClick={onCycleCamera}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-cyan-500/40 rounded bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 transition-colors"
            title="Cycle Camera POV [C]"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>{cameraMode === 'cockpit' ? '1ST-PERSON' : 'CHASE'}</span>
          </button>

          {/* Hypersonic Toggle Button */}
          <button
            onClick={onToggleHypersonic}
            className={`flex items-center gap-1 px-3 py-1 text-xs border rounded transition-all ${
              flight.hypersonicActive
                ? 'bg-cyan-500 text-black font-bold border-cyan-200 hud-glow'
                : 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/50'
            }`}
            title="Hypersonic Boost [H]"
          >
            <Flame className={`w-3.5 h-3.5 ${flight.hypersonicActive ? 'text-amber-300 animate-bounce' : 'text-cyan-400'}`} />
            <span>HYPERSONIC [H]</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={onToggleAudio}
            className="p-1.5 text-cyan-400 border border-cyan-500/40 rounded bg-cyan-950/40 hover:bg-cyan-900/50 transition-colors"
            title="Toggle Engine Sound [M]"
          >
            {flight.isAudioMuted ? (
              <VolumeX className="w-4 h-4 text-cyan-600" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-300" />
            )}
          </button>

          {/* Help modal */}
          <button
            onClick={onOpenHelp}
            className="p-1.5 text-cyan-400 border border-cyan-500/40 rounded bg-cyan-950/40 hover:bg-cyan-900/50 transition-colors"
            title="Flight Controls & Keybinds [?]"
          >
            <HelpCircle className="w-4 h-4 text-cyan-300" />
          </button>
        </div>
      </div>

      {/* 4 Angled Iron Man Sci-Fi Visor Corner Brackets */}
      <div className="absolute top-16 left-6 w-16 h-16 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none">
        <div className="w-3 h-0.5 bg-cyan-400 mb-1" />
        <span className="text-[9px] text-cyan-400/70 tracking-widest pl-1">SYS // OK</span>
      </div>

      <div className="absolute top-16 right-6 w-16 h-16 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none flex flex-col items-end">
        <div className="w-3 h-0.5 bg-cyan-400 mb-1" />
        <span className="text-[9px] text-cyan-400/70 tracking-widest pr-1">TGT // SCAN</span>
      </div>

      <div className="absolute bottom-16 left-6 w-16 h-16 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none flex flex-col justify-end">
        <span className="text-[9px] text-cyan-400/70 tracking-widest pl-1">PWR // {((1.0 - flight.throttle) * 100).toFixed(0)}%</span>
        <div className="w-3 h-0.5 bg-cyan-400 mt-1" />
      </div>

      <div className="absolute bottom-16 right-6 w-16 h-16 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none flex flex-col justify-end items-end">
        <span className="text-[9px] text-cyan-400/70 tracking-widest pr-1">G-FORCE // {flight.gForce.toFixed(1)}G</span>
        <div className="w-3 h-0.5 bg-cyan-400 mt-1" />
      </div>

      {/* LEFT ARC GAUGE: Airspeed, Mach & Inverted Throttle Scale */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center gap-4">
        {/* Throttle Scale 1-to-0 (Inverted scale requested: 1 = Idle, 0 = Max) */}
        <div className="pointer-events-auto flex flex-col items-center bg-cyan-950/30 border border-cyan-500/40 p-2 rounded backdrop-blur-xs">
          <div className="text-[9px] text-cyan-300 font-bold mb-1 tracking-wider">PWR [1-0]</div>
          <div className="flex flex-col gap-1 items-center">
            {[0.0, 0.11, 0.22, 0.33, 0.44, 0.56, 0.67, 0.78, 0.89, 1.0].map((thrVal, idx) => {
              // 0.0 is key '0' (Max), 1.0 is key '1' (Idle)
              const keyLabel = idx === 0 ? '0' : `${10 - idx}`;
              const isSelected = Math.abs(flight.throttle - thrVal) < 0.06;
              const thrustPct = (1.0 - thrVal) * 100;

              return (
                <button
                  key={keyLabel}
                  onClick={() => onSetThrottle(thrVal)}
                  className={`w-7 h-5 text-[10px] font-bold rounded flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-cyan-400 text-black shadow-[0_0_8px_#00f0ff]'
                      : 'text-cyan-400/70 hover:bg-cyan-900/40 hover:text-cyan-200'
                  }`}
                  title={`Throttle ${keyLabel}: ${thrustPct.toFixed(0)}% Thrust`}
                >
                  {keyLabel}
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-[10px] text-cyan-300 font-bold">
            THR {flight.throttle.toFixed(2)}
          </div>
        </div>

        {/* Circular Stepped Airspeed Arc & Mach Display */}
        <div className="relative w-36 h-80 flex flex-col justify-center">
          {/* Circular SVG Arc */}
          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 144 320">
            {/* Background Arc */}
            <path
              d="M 120 20 A 240 240 0 0 0 120 300"
              fill="none"
              stroke="rgba(0, 240, 255, 0.25)"
              strokeWidth="3"
            />
            {/* Speed Ladder Ticks */}
            {[-120, -90, -60, -30, 0, 30, 60, 90, 120].map((offset, i) => {
              const y = 160 + offset;
              const spd = Math.max(0, Math.round(flight.airspeed - offset * 2));
              return (
                <g key={i}>
                  <line
                    x1="105"
                    y1={y}
                    x2="120"
                    y2={y}
                    stroke="rgba(0, 240, 255, 0.7)"
                    strokeWidth="1.5"
                  />
                  <text
                    x="98"
                    y={y + 4}
                    fill="rgba(0, 240, 255, 0.85)"
                    fontSize="10"
                    textAnchor="end"
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    {spd}
                  </text>
                </g>
              );
            })}
            {/* Current Speed Indicator Pointer */}
            <polygon
              points="132,160 122,154 122,166"
              fill="#00f0ff"
              filter="drop-shadow(0 0 4px #00f0ff)"
            />
          </svg>

          {/* Mach Readout Badge */}
          <div className="absolute top-4 left-0 bg-black/60 border border-cyan-400/70 p-2 rounded hud-glow-soft">
            <div className="text-[10px] text-cyan-400/80 font-bold">AIRSPEED</div>
            <div className="text-xl font-black text-cyan-200 tracking-wider">
              {Math.round(flight.airspeed)}{' '}
              <span className="text-xs font-normal text-cyan-400">KT</span>
            </div>
            <div className="text-sm font-bold text-white tracking-widest mt-0.5">
              MACH {flight.mach.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT ARC GAUGE: Altitude, Radar AGL, Climb Rate Tape */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4">
        {/* Stepped Altitude Arc */}
        <div className="relative w-36 h-80 flex flex-col justify-center">
          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 144 320">
            {/* Background Arc */}
            <path
              d="M 24 20 A 240 240 0 0 1 24 300"
              fill="none"
              stroke="rgba(0, 240, 255, 0.25)"
              strokeWidth="3"
            />
            {/* Altitude Ladder Ticks */}
            {[-120, -90, -60, -30, 0, 30, 60, 90, 120].map((offset, i) => {
              const y = 160 + offset;
              const altFeet = Math.round(flight.altitude * 3.28084 - offset * 25);
              return (
                <g key={i}>
                  <line
                    x1="24"
                    y1={y}
                    x2="39"
                    y2={y}
                    stroke="rgba(0, 240, 255, 0.7)"
                    strokeWidth="1.5"
                  />
                  <text
                    x="46"
                    y={y + 4}
                    fill="rgba(0, 240, 255, 0.85)"
                    fontSize="10"
                    textAnchor="start"
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    {altFeet}
                  </text>
                </g>
              );
            })}
            {/* Current Altitude Indicator Pointer */}
            <polygon
              points="12,160 22,154 22,166"
              fill="#00f0ff"
              filter="drop-shadow(0 0 4px #00f0ff)"
            />
          </svg>

          {/* Altitude readout box */}
          <div className="absolute top-4 right-0 bg-black/60 border border-cyan-400/70 p-2 rounded hud-glow-soft text-right">
            <div className="text-[10px] text-cyan-400/80 font-bold">ALTITUDE (MSL)</div>
            <div className="text-xl font-black text-cyan-200 tracking-wider">
              {Math.round(flight.altitude * 3.28084)}{' '}
              <span className="text-xs font-normal text-cyan-400">FT</span>
            </div>
            <div className="text-xs font-semibold text-cyan-300 mt-0.5">
              AGL {Math.round(flight.altitudeAGL * 3.28084)} FT ({Math.round(flight.altitudeAGL)}M)
            </div>
            <div className="text-[11px] text-cyan-400/90 font-mono-hud mt-0.5">
              VVI {flight.verticalSpeed > 0 ? '+' : ''}
              {Math.round(flight.verticalSpeed)} FPM
            </div>
          </div>
        </div>
      </div>

      {/* CENTER: Iron Man Horizon, Pitch Ladder, Bank Arc & Reticle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Dynamic Pitch & Roll Horizon Gimbal */}
        <div
          className="relative w-96 h-96 transition-transform duration-75 ease-out"
          style={{
            transform: `rotate(${-flight.roll}deg)`
          }}
        >
          {/* Outer Bank Angle Degree Ring */}
          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 384 384">
            <circle
              cx="192"
              cy="192"
              r="170"
              fill="none"
              stroke="rgba(0, 240, 255, 0.3)"
              strokeWidth="1.5"
              strokeDasharray="4 8"
            />
            {/* Horizon Line */}
            <g
              style={{
                transform: `translateY(${flight.pitch * 3.5}px)`
              }}
            >
              {/* Artificial Horizon bar with gap in center */}
              <line
                x1="20"
                y1="192"
                x2="140"
                y2="192"
                stroke="#00f0ff"
                strokeWidth="2.5"
                filter="drop-shadow(0 0 4px #00f0ff)"
              />
              <line
                x1="244"
                y1="192"
                x2="364"
                y2="192"
                stroke="#00f0ff"
                strokeWidth="2.5"
                filter="drop-shadow(0 0 4px #00f0ff)"
              />

              {/* Pitch Ladder Bars */}
              {pitchSteps.map((deg) => {
                if (deg === 0) return null;
                const yPos = 192 - deg * 3.5;
                const isClimb = deg > 0;
                return (
                  <g key={deg} opacity={Math.abs(flight.pitch - deg) < 30 ? 1 : 0.4}>
                    {/* Left rung */}
                    <line
                      x1="120"
                      y1={yPos}
                      x2="160"
                      y2={yPos}
                      stroke="#00f0ff"
                      strokeWidth="1.5"
                      strokeDasharray={isClimb ? 'none' : '4 3'}
                    />
                    <line
                      x1="120"
                      y1={yPos}
                      x2="120"
                      y2={isClimb ? yPos + 6 : yPos - 6}
                      stroke="#00f0ff"
                      strokeWidth="1.5"
                    />
                    <text
                      x="112"
                      y={yPos + 4}
                      fill="#00f0ff"
                      fontSize="10"
                      textAnchor="end"
                    >
                      {deg}°
                    </text>

                    {/* Right rung */}
                    <line
                      x1="224"
                      y1={yPos}
                      x2="264"
                      y2={yPos}
                      stroke="#00f0ff"
                      strokeWidth="1.5"
                      strokeDasharray={isClimb ? 'none' : '4 3'}
                    />
                    <line
                      x1="264"
                      y1={yPos}
                      x2="264"
                      y2={isClimb ? yPos + 6 : yPos - 6}
                      stroke="#00f0ff"
                      strokeWidth="1.5"
                    />
                    <text
                      x="272"
                      y={yPos + 4}
                      fill="#00f0ff"
                      fontSize="10"
                      textAnchor="start"
                    >
                      {deg}°
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Center Iron Man Boresight & Flight Path Pipper (Stationary on screen) */}
        <div className="absolute w-28 h-28 flex items-center justify-center">
          {/* Inner targeting ring with 4 tick marks */}
          <div className="w-14 h-14 rounded-full border border-cyan-400/80 flex items-center justify-center hud-glow-soft">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
          </div>
          {/* Crosshair ticks */}
          <div className="absolute w-24 h-px bg-cyan-400/70" />
          <div className="absolute h-24 w-px bg-cyan-400/70" />
        </div>
      </div>

      {/* IRON MAN TARGET LOCK (Image 2 style): Locks nearest landmark in front */}
      {targetLandmark && targetLandmark.inFront && targetLandmark.screenX !== undefined && targetLandmark.screenY !== undefined && (
        <div
          className="absolute pointer-events-none transition-all duration-100 ease-out z-20"
          style={{
            left: `${targetLandmark.screenX}px`,
            top: `${targetLandmark.screenY}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Rotating Iron Man Sci-Fi Lock Circle */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-cyan-400 border-dashed animate-spin [animation-duration:8s] hud-glow" />
            <div className="absolute w-20 h-20 rounded-full border-2 border-cyan-300/60" />
            {/* 4 Corner tick marks */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-300" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-300" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-300" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-300" />
            {/* Center dot */}
            <div className="w-2 h-2 rounded-full bg-cyan-300 hud-glow" />
          </div>

          {/* Quick Target Tag below reticle */}
          <div className="absolute top-26 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded border border-cyan-400/60 text-[10px] text-cyan-300 text-center font-bold hud-glow-soft">
            <div>{targetLandmark.name.toUpperCase()}</div>
            <div className="text-[9px] text-cyan-400/80">
              RNG {(targetLandmark.distanceKm || 0).toFixed(1)} KM · ELV {targetLandmark.elevation}M
            </div>
          </div>
        </div>
      )}

      {/* IRON MAN TACTICAL TELEMETRY CARD (Santa Monica style panel from Image 2!) */}
      {targetLandmark && (
        <div className="absolute top-20 right-12 w-80 p-3.5 bg-black/60 border border-cyan-400/80 rounded-lg hud-glow-soft backdrop-blur-xs text-xs pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-500/40 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-orbitron font-bold text-white tracking-wider">
                {targetLandmark.name}
              </span>
            </div>
            <span className="text-[10px] text-cyan-300 px-1.5 py-0.5 border border-cyan-400/40 rounded uppercase">
              {targetLandmark.category}
            </span>
          </div>

          {/* Target telemetry grid */}
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11px] text-cyan-200">
            <div>
              <span className="text-cyan-400/70 text-[10px] block">TGT DISTANCE</span>
              <span className="font-bold text-white">{(targetLandmark.distanceKm || 0).toFixed(1)} KM</span>
            </div>
            <div>
              <span className="text-cyan-400/70 text-[10px] block">TARGET ELEVATION</span>
              <span className="font-bold text-white">{targetLandmark.elevation} M</span>
            </div>
            <div>
              <span className="text-cyan-400/70 text-[10px] block">TARGET COORDS</span>
              <span className="font-bold text-white">
                {formatCoord(targetLandmark.latitude, true)}, {formatCoord(targetLandmark.longitude, false)}
              </span>
            </div>
            <div>
              <span className="text-cyan-400/70 text-[10px] block">REGION / CANTON</span>
              <span className="font-bold text-white truncate block">{targetLandmark.region}</span>
            </div>
          </div>

          {/* Tactical summary prose */}
          <div className="mt-2.5 pt-2 border-t border-cyan-500/30 text-[10px] text-cyan-300/90 leading-tight">
            Iron Man HUD optical lock active. Terrain entities draped via Cesium 3D engine. Visual contact confirmed.
          </div>
        </div>
      )}

      {/* BOTTOM CENTER: Iron Man Arc Reactor & Flight Status Widget */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
        {/* Hypersonic Status Alert */}
        {flight.hypersonicActive && (
          <div className="mb-2 px-4 py-1 bg-cyan-500/20 border border-cyan-400 rounded-full text-cyan-300 text-xs font-black tracking-widest animate-pulse hud-glow">
            HYPERSONIC DRIVE ENGAGED // MACH {flight.mach.toFixed(1)}
          </div>
        )}

        {/* Live Coordinates Readout */}
        <div className="flex items-center gap-4 text-xs text-cyan-300/90 bg-black/60 px-4 py-1.5 rounded-full border border-cyan-500/40 backdrop-blur-xs">
          <div>
            <span className="text-cyan-500 text-[10px]">LAT: </span>
            <span className="font-bold text-white">{formatCoord(flight.latitude, true)}</span>
          </div>
          <div>
            <span className="text-cyan-500 text-[10px]">LON: </span>
            <span className="font-bold text-white">{formatCoord(flight.longitude, false)}</span>
          </div>
          <div>
            <span className="text-cyan-500 text-[10px]">HDG: </span>
            <span className="font-bold text-white">{headingVal}°</span>
          </div>
          <div>
            <span className="text-cyan-500 text-[10px]">BANK: </span>
            <span className="font-bold text-white">{flight.roll.toFixed(1)}°</span>
          </div>
          <div>
            <span className="text-cyan-500 text-[10px]">G: </span>
            <span className="font-bold text-white">+{flight.gForce.toFixed(1)}</span>
          </div>
        </div>

        {/* Bottom Helper Bar */}
        <div className="mt-1.5 text-[10px] text-cyan-400/60 tracking-wider">
          ARROWS: PITCH & ROLL (COORDINATED TURN) · 1..0: THROTTLE (1:IDLE, 0:MAX) · H: HYPERSONIC · C: CAMERA · ?: HELP
        </div>
      </div>

      {/* On-Screen Flight Stick / Touch D-Pad (Bottom Right) */}
      <div className="absolute bottom-6 right-6 pointer-events-auto flex flex-col items-center gap-1 z-30">
        <button
          onMouseDown={() => onPitchInput?.('up', true)}
          onMouseUp={() => onPitchInput?.('up', false)}
          onTouchStart={() => onPitchInput?.('up', true)}
          onTouchEnd={() => onPitchInput?.('up', false)}
          className="w-9 h-9 rounded bg-cyan-950/70 border border-cyan-500/50 hover:bg-cyan-800/80 text-cyan-300 flex items-center justify-center font-bold text-sm select-none active:scale-95 transition-all hud-glow-soft"
          title="Pitch Nose Down (ArrowUp)"
        >
          ▲
        </button>
        <div className="flex items-center gap-1">
          <button
            onMouseDown={() => onRollInput?.('left', true)}
            onMouseUp={() => onRollInput?.('left', false)}
            onTouchStart={() => onRollInput?.('left', true)}
            onTouchEnd={() => onRollInput?.('left', false)}
            className="w-9 h-9 rounded bg-cyan-950/70 border border-cyan-500/50 hover:bg-cyan-800/80 text-cyan-300 flex items-center justify-center font-bold text-sm select-none active:scale-95 transition-all hud-glow-soft"
            title="Bank Left + Coordinated Turn (ArrowLeft)"
          >
            ◀
          </button>
          <button
            onMouseDown={() => onPitchInput?.('down', true)}
            onMouseUp={() => onPitchInput?.('down', false)}
            onTouchStart={() => onPitchInput?.('down', true)}
            onTouchEnd={() => onPitchInput?.('down', false)}
            className="w-9 h-9 rounded bg-cyan-950/70 border border-cyan-500/50 hover:bg-cyan-800/80 text-cyan-300 flex items-center justify-center font-bold text-sm select-none active:scale-95 transition-all hud-glow-soft"
            title="Pitch Nose Up (ArrowDown)"
          >
            ▼
          </button>
          <button
            onMouseDown={() => onRollInput?.('right', true)}
            onMouseUp={() => onRollInput?.('right', false)}
            onTouchStart={() => onRollInput?.('right', true)}
            onTouchEnd={() => onRollInput?.('right', false)}
            className="w-9 h-9 rounded bg-cyan-950/70 border border-cyan-500/50 hover:bg-cyan-800/80 text-cyan-300 flex items-center justify-center font-bold text-sm select-none active:scale-95 transition-all hud-glow-soft"
            title="Bank Right + Coordinated Turn (ArrowRight)"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};
