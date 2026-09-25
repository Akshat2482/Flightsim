/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CesiumFlightEngine } from './services/cesiumService';
import { FlightHud } from './components/FlightHud';
import { ControlHelpModal } from './components/ControlHelpModal';
import { TerrainSettingsModal } from './components/TerrainSettingsModal';
import { LocationPickerModal } from './components/LocationPickerModal';
import { FLIGHT_PRESETS, fetchLiveOverpassLandmarks } from './data/locations';
import { CameraMode, FlightPreset, FlightState, Landmark, TerrainEngine } from './types/flight';
import { audioSynth } from './utils/audioSynth';

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cesiumEngineRef = useRef<CesiumFlightEngine | null>(null);

  // Active flight preset (Default: Swiss Alps reference scene from Image 1!)
  const [activePreset, setActivePreset] = useState<FlightPreset>(FLIGHT_PRESETS[0]);
  const [landmarks, setLandmarks] = useState<Landmark[]>(FLIGHT_PRESETS[0].landmarks);

  // Flight physical state
  const flightStateRef = useRef<FlightState>({
    latitude: FLIGHT_PRESETS[0].latitude,
    longitude: FLIGHT_PRESETS[0].longitude,
    altitude: FLIGHT_PRESETS[0].altitude,
    altitudeAGL: 1200,
    heading: FLIGHT_PRESETS[0].heading,
    pitch: FLIGHT_PRESETS[0].pitch,
    roll: FLIGHT_PRESETS[0].roll,
    yawRate: 0,
    pitchRate: 0,
    rollRate: 0,
    airspeed: FLIGHT_PRESETS[0].speed,
    mach: FLIGHT_PRESETS[0].speed / 661.47,
    verticalSpeed: 0,
    throttle: 0.5, // 50% power initially (1.0 = Idle, 0.0 = Max)
    thrustPercentage: 50,
    gForce: 1.0,
    hypersonicActive: false,
    hypersonicFactor: 0.0,
    airbrakeActive: false,
    isPaused: false,
    isAudioMuted: false,
    isOverSpeed: false,
    stallWarning: false
  });

  const [flightDisplay, setFlightDisplay] = useState<FlightState>(flightStateRef.current);
  const [targetLandmark, setTargetLandmark] = useState<(Landmark & { screenX?: number; screenY?: number; inFront?: boolean }) | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>('cockpit');
  const [terrainEngine, setTerrainEngine] = useState<TerrainEngine>('google-3d-tiles');
  const [isCesiumReady, setIsCesiumReady] = useState(false);

  // Modals state
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);
  const [isLoadingOverpass, setIsLoadingOverpass] = useState(false);

  // Keyboard input state tracker
  const keysDownRef = useRef<Record<string, boolean>>({});

  // Initialize Cesium Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new CesiumFlightEngine();
    cesiumEngineRef.current = engine;

    engine
      .init(containerRef.current, (newEngine) => {
        setTerrainEngine(newEngine);
      })
      .then(() => {
        setIsCesiumReady(true);
        // Load initial landmarks draped onto terrain
        engine.setLandmarks(activePreset.landmarks);
      });

    return () => {
      engine.destroy();
      cesiumEngineRef.current = null;
    };
  }, []);

  // Keyboard events listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't capture inputs when user is typing in text fields
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      keysDownRef.current[e.code] = true;

      // Initialize audio on first user key interaction
      audioSynth.init();

      // Number row throttle keys: 1 to 0 (Inverted scale: 1 = Idle/0%, 0 = Max/100%)
      const numberKeys: Record<string, number> = {
        Digit1: 1.0,  // 0% thrust
        Digit2: 0.89, // ~11% thrust
        Digit3: 0.78, // ~22% thrust
        Digit4: 0.67, // ~33% thrust
        Digit5: 0.56, // ~44% thrust
        Digit6: 0.44, // ~56% thrust
        Digit7: 0.33, // ~67% thrust
        Digit8: 0.22, // ~78% thrust
        Digit9: 0.11, // ~89% thrust
        Digit0: 0.0   // 100% thrust (Full Afterburner)
      };

      if (e.code in numberKeys) {
        flightStateRef.current.throttle = numberKeys[e.code];
        flightStateRef.current.thrustPercentage = (1.0 - numberKeys[e.code]) * 100;
        audioSynth.playHudBeep(900, 0.05);
      }

      // H: Hypersonic speed boost toggle
      if (e.code === 'KeyH') {
        const nextState = !flightStateRef.current.hypersonicActive;
        flightStateRef.current.hypersonicActive = nextState;
        if (nextState) {
          audioSynth.playSonicBoom();
        } else {
          audioSynth.playHudBeep(600, 0.09);
        }
      }

      // C: Cycle camera mode
      if (e.code === 'KeyC') {
        setCameraMode((prev) => (prev === 'cockpit' ? 'chase' : 'cockpit'));
        audioSynth.playHudBeep(1100, 0.04);
      }

      // M: Audio mute toggle
      if (e.code === 'KeyM') {
        const muted = audioSynth.toggleMute();
        flightStateRef.current.isAudioMuted = muted;
      }

      // P: Pause simulation
      if (e.code === 'KeyP') {
        flightStateRef.current.isPaused = !flightStateRef.current.isPaused;
      }

      // Space: Airbrake
      if (e.code === 'Space') {
        flightStateRef.current.airbrakeActive = true;
      }

      // ?: Help
      if (e.key === '?' || e.code === 'Slash') {
        setIsHelpOpen((prev) => !prev);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current[e.code] = false;
      if (e.code === 'Space') {
        flightStateRef.current.airbrakeActive = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Main 60 FPS Flight Physics & Cesium Update Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let tickCounter = 0;

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      tickCounter++;

      const state = flightStateRef.current;
      const keys = keysDownRef.current;

      if (!state.isPaused && dt > 0) {
        // --- 1. Pitch Control (Up/Down arrows) ---
        // ArrowUp pitches nose down (dive), ArrowDown pitches nose up (climb)
        let pitchInput = 0;
        if (keys['ArrowUp'] || keys['KeyW']) pitchInput -= 1;
        if (keys['ArrowDown'] || keys['KeyS']) pitchInput += 1;

        if (pitchInput !== 0) {
          state.pitchRate = Math.min(Math.max(state.pitchRate + pitchInput * 45 * dt, -35), 35);
        } else {
          // Pitch auto-damping
          state.pitchRate *= Math.pow(0.85, dt * 60);
        }
        state.pitch = Math.min(Math.max(state.pitch + state.pitchRate * dt, -85), 85);

        // --- 2. Roll Control (Left/Right arrows) ---
        let rollInput = 0;
        if (keys['ArrowLeft'] || keys['KeyA']) rollInput -= 1;
        if (keys['ArrowRight'] || keys['KeyD']) rollInput += 1;

        if (rollInput !== 0) {
          state.rollRate = Math.min(Math.max(state.rollRate + rollInput * 75 * dt, -65), 65);
        } else {
          // Roll auto-leveling damping toward wings level
          state.rollRate *= Math.pow(0.88, dt * 60);
          if (Math.abs(state.roll) < 0.5) state.roll = 0;
          else state.roll *= Math.pow(0.97, dt * 60);
        }
        state.roll = Math.min(Math.max(state.roll + state.rollRate * dt, -75), 75);

        // --- 3. Coordinated Turn: Banking induces aerodynamic yaw! ---
        // Yaw rate = (g / airspeed) * tan(bank)
        if (Math.abs(state.roll) > 0.5) {
          const bankRad = (state.roll * Math.PI) / 180;
          // Calibrated aerodynamic turn rate constant
          const turnRate = Math.tan(bankRad) * 24.0;
          state.yawRate = turnRate;
          state.heading = (state.heading + turnRate * dt + 360) % 360;
        } else {
          state.yawRate = 0;
        }

        // --- 4. Throttle & Hypersonic Speed Integration ---
        // Throttle scale is 1 to 0:
        // 1.0 = Idle / 0% power, 0.0 = Max / 100% power
        const thrustFraction = Math.max(0, Math.min(1.0 - state.throttle, 1.0));

        // Smooth Hypersonic Boost Ramp In / Out
        if (state.hypersonicActive) {
          state.hypersonicFactor = Math.min(state.hypersonicFactor + dt * 0.75, 1.0);
        } else {
          state.hypersonicFactor = Math.max(state.hypersonicFactor - dt * 0.85, 0.0);
        }

        // Target airspeed in knots:
        // Normal: 150kt idle up to 550kt full throttle
        // Hypersonic boost: Mach 5 to Mach 9 (3,300kt - 5,900kt)
        const baseSpeed = 150 + thrustFraction * 400;
        const hypersonicSpeedBoost = state.hypersonicFactor * 4800;
        const airbrakeReduction = state.airbrakeActive ? 120 : 0;
        const targetAirspeed = Math.max(baseSpeed + hypersonicSpeedBoost - airbrakeReduction, 120);

        // Smooth speed acceleration lerp
        const accelRate = state.hypersonicActive ? 1.8 : 0.8;
        state.airspeed += (targetAirspeed - state.airspeed) * Math.min(accelRate * dt, 1.0);
        state.mach = state.airspeed / 661.47;

        // --- 5. Altitude & Vertical Speed ---
        // Speed in m/s: airspeed * 0.514444
        const pitchRad = (state.pitch * Math.PI) / 180;
        const climbMps = state.airspeed * 0.514444 * Math.sin(pitchRad);
        state.verticalSpeed = climbMps * 196.85; // ft/min

        state.altitude += climbMps * dt;

        // Ground collision avoidance / AGL calculation
        if (cesiumEngineRef.current) {
          const groundHeight = cesiumEngineRef.current.getGroundAltitude(state.latitude, state.longitude);
          const minAlt = groundHeight + 25; // Keep at least 25m above ground
          if (state.altitude < minAlt) {
            state.altitude = minAlt;
            if (state.pitch < 0) state.pitch = 0;
          }
          state.altitudeAGL = Math.max(state.altitude - groundHeight, 0);
        }

        // --- 6. Position Integration across Globe ---
        const horizMps = state.airspeed * 0.514444 * Math.cos(pitchRad);
        const distTravelled = horizMps * dt;
        const headingRad = (state.heading * Math.PI) / 180;

        // 1 degree lat ~ 111,139 meters
        const dLat = (distTravelled * Math.cos(headingRad)) / 111139;
        const dLon = (distTravelled * Math.sin(headingRad)) / (111139 * Math.cos((state.latitude * Math.PI) / 180));

        state.latitude += dLat;
        state.longitude += dLon;

        // Wrap longitude
        if (state.longitude > 180) state.longitude -= 360;
        if (state.longitude < -180) state.longitude += 360;

        // G-Force computation
        const bankRad = Math.abs((state.roll * Math.PI) / 180);
        const gTurn = 1 / Math.max(Math.cos(bankRad), 0.25);
        const gPitch = 1 + (state.pitchRate / 25);
        state.gForce = Math.min(Math.max(gTurn * gPitch, 0.8), 8.5);

        // --- 7. Update Audio Telemetry ---
        audioSynth.updateTelemetry(thrustFraction, state.airspeed, state.hypersonicFactor);
      }

      // --- 8. Update Cesium Camera ---
      if (cesiumEngineRef.current) {
        cesiumEngineRef.current.updateCamera(state, cameraMode);

        // --- 9. Target Lock Selection (Iron Man Reticle & Santa Monica Panel) ---
        // Check nearest landmark in view every 4 frames
        if (tickCounter % 4 === 0 && landmarks.length > 0) {
          let closestLm: (Landmark & { screenX?: number; screenY?: number; inFront?: boolean }) | null = null;
          let minDistance = Infinity;

          const cx = window.innerWidth / 2;
          const cy = window.innerHeight / 2;

          for (const lm of landmarks) {
            // Distance calculation
            const dLat = (lm.latitude - state.latitude) * 111.139;
            const dLon = (lm.longitude - state.longitude) * 111.139 * Math.cos((state.latitude * Math.PI) / 180);
            const distKm = Math.sqrt(dLat * dLat + dLon * dLon);
            lm.distanceKm = distKm;

            const proj = cesiumEngineRef.current.projectToScreen(lm.latitude, lm.longitude, lm.elevation);
            if (proj && proj.inFront) {
              const screenDist = Math.sqrt((proj.x - cx) ** 2 + (proj.y - cy) ** 2);
              if (screenDist < 450 && screenDist < minDistance) {
                minDistance = screenDist;
                closestLm = {
                  ...lm,
                  screenX: proj.x,
                  screenY: proj.y,
                  inFront: true
                };
              }
            }
          }

          setTargetLandmark(closestLm || (landmarks[0] ? { ...landmarks[0], inFront: false } : null));
        }
      }

      // Update state for HUD display at ~30 FPS
      if (tickCounter % 2 === 0) {
        setFlightDisplay({ ...state });
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [cameraMode, landmarks]);

  // Teleport to flight preset
  const handleSelectPreset = useCallback((preset: FlightPreset) => {
    setActivePreset(preset);
    setLandmarks(preset.landmarks);

    const s = flightStateRef.current;
    s.latitude = preset.latitude;
    s.longitude = preset.longitude;
    s.altitude = preset.altitude;
    s.heading = preset.heading;
    s.pitch = preset.pitch;
    s.roll = preset.roll;
    s.airspeed = preset.speed;
    s.mach = preset.speed / 661.47;
    s.pitchRate = 0;
    s.rollRate = 0;
    s.yawRate = 0;

    if (cesiumEngineRef.current) {
      cesiumEngineRef.current.setLandmarks(preset.landmarks);
    }

    audioSynth.playHudBeep(1400, 0.08);
  }, []);

  // Fetch live Overpass API landmarks for current zone
  const handleFetchOverpass = async () => {
    setIsLoadingOverpass(true);
    try {
      const s = flightStateRef.current;
      const osmLandmarks = await fetchLiveOverpassLandmarks(s.latitude, s.longitude, 35);
      if (osmLandmarks.length > 0) {
        const combined = [...osmLandmarks, ...landmarks].slice(0, 40);
        setLandmarks(combined);
        if (cesiumEngineRef.current) {
          cesiumEngineRef.current.setLandmarks(combined);
        }
        audioSynth.playHudBeep(1600, 0.1);
      }
    } finally {
      setIsLoadingOverpass(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 3D Cesium WebGL Viewport */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Sci-Fi Boot / Initialization Overlay */}
      {!isCesiumReady && (
        <div className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center p-6 text-center font-mono-hud">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-6 hud-glow" />
          <div className="font-orbitron font-bold text-lg text-cyan-300 tracking-widest hud-text-glow mb-2">
            APEX MACH // FIRST-PERSON FLIGHT SYSTEM
          </div>
          <div className="text-xs text-cyan-400/80 max-w-md leading-relaxed mb-4">
            CONNECTING CESIUM 3D PHOTOREALISTIC ENGINE · INITIALIZING IRON MAN VISOR HUD · CALIBRATING COORDINATED FLIGHT CONTROLS...
          </div>
          <div className="flex items-center gap-2 text-[11px] text-cyan-500">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>MOUNTING TERRAIN TILES & SWISS ALPS THEATER</span>
          </div>
        </div>
      )}

      {/* Iron Man HUD Overlay */}
      {isCesiumReady && (
        <FlightHud
          flight={flightDisplay}
          targetLandmark={targetLandmark}
          cameraMode={cameraMode}
          terrainEngine={terrainEngine}
          onToggleHypersonic={() => {
            const next = !flightStateRef.current.hypersonicActive;
            flightStateRef.current.hypersonicActive = next;
            if (next) audioSynth.playSonicBoom();
            else audioSynth.playHudBeep(600, 0.08);
          }}
          onSetThrottle={(val) => {
            flightStateRef.current.throttle = val;
            flightStateRef.current.thrustPercentage = (1.0 - val) * 100;
            audioSynth.playHudBeep(900, 0.05);
          }}
          onCycleCamera={() => {
            setCameraMode((prev) => (prev === 'cockpit' ? 'chase' : 'cockpit'));
            audioSynth.playHudBeep(1100, 0.04);
          }}
          onToggleAudio={() => {
            const muted = audioSynth.toggleMute();
            flightStateRef.current.isAudioMuted = muted;
          }}
          onOpenLocations={() => setIsLocationsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          onPitchInput={(dir, active) => {
            audioSynth.init();
            if (dir === 'up') keysDownRef.current['ArrowUp'] = active;
            if (dir === 'down') keysDownRef.current['ArrowDown'] = active;
          }}
          onRollInput={(dir, active) => {
            audioSynth.init();
            if (dir === 'left') keysDownRef.current['ArrowLeft'] = active;
            if (dir === 'right') keysDownRef.current['ArrowRight'] = active;
          }}
        />
      )}

      {/* Modals */}
      <ControlHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <TerrainSettingsModal
        isOpen={isSettingsOpen}
        currentEngine={terrainEngine}
        currentToken={cesiumEngineRef.current ? cesiumEngineRef.current.getIonToken() : ''}
        onClose={() => setIsSettingsOpen(false)}
        onSelectEngine={(engine) => {
          if (cesiumEngineRef.current) {
            cesiumEngineRef.current.setTerrainEngine(engine, (res) => {
              setTerrainEngine(res);
            });
          }
        }}
        onSaveToken={(token) => {
          if (cesiumEngineRef.current) {
            cesiumEngineRef.current.setIonToken(token);
            cesiumEngineRef.current.setTerrainEngine(terrainEngine, (res) => {
              setTerrainEngine(res);
            });
          }
        }}
      />

      <LocationPickerModal
        isOpen={isLocationsOpen}
        activePresetId={activePreset.id}
        onClose={() => setIsLocationsOpen(false)}
        onSelectPreset={handleSelectPreset}
        onFetchOverpass={handleFetchOverpass}
        isLoadingOverpass={isLoadingOverpass}
      />
    </div>
  );
}
