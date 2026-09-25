import React from 'react';
import { X, Navigation, Gauge, Zap, Eye, Volume2, Shield } from 'lucide-react';

interface ControlHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlHelpModal: React.FC<ControlHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-black/90 border border-cyan-400/80 rounded-xl p-6 hud-glow font-mono-hud text-cyan-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/40 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="font-orbitron font-bold text-lg text-white tracking-wider">
              FLIGHT SYSTEM MANUAL // CONTROLS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-cyan-400 hover:text-white rounded hover:bg-cyan-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs">
          {/* Flight Controls */}
          <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-cyan-300 font-bold mb-2 font-orbitron">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>FLIGHT CONTROLS & COORDINATED TURNING</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-white font-bold bg-cyan-900/60 px-1.5 py-0.5 rounded border border-cyan-500/50">
                  ↑ Arrow Up
                </span>{' '}
                : Pitch Nose Down (Dive)
              </div>
              <div>
                <span className="text-white font-bold bg-cyan-900/60 px-1.5 py-0.5 rounded border border-cyan-500/50">
                  ↓ Arrow Down
                </span>{' '}
                : Pitch Nose Up (Climb)
              </div>
              <div>
                <span className="text-white font-bold bg-cyan-900/60 px-1.5 py-0.5 rounded border border-cyan-500/50">
                  ← Arrow Left
                </span>{' '}
                : Bank Left + Coordinated Turn
              </div>
              <div>
                <span className="text-white font-bold bg-cyan-900/60 px-1.5 py-0.5 rounded border border-cyan-500/50">
                  → Arrow Right
                </span>{' '}
                : Bank Right + Coordinated Turn
              </div>
            </div>
            <div className="mt-2 text-[10px] text-cyan-400/80">
              *Coordinated Turn Dynamics: Banking left or right continuously induces realistic aerodynamic yaw rate, smoothly turning your aircraft toward the bank angle.
            </div>
          </div>

          {/* Inverted Throttle */}
          <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-cyan-300 font-bold mb-2 font-orbitron">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span>INVERTED THROTTLE SCALE (1 TO 0 SCALE)</span>
            </div>
            <p className="text-[11px] mb-2 leading-relaxed">
              In accordance with your flight configuration, the number row uses an inverted power scale:
            </p>
            <div className="flex items-center justify-between text-center bg-black/50 p-2 rounded border border-cyan-500/30 text-[10px]">
              <div>
                <span className="text-white font-bold">Key 1</span>
                <div className="text-cyan-400">1.0 (Idle)</div>
              </div>
              <div>
                <span className="text-white font-bold">Keys 2-4</span>
                <div className="text-cyan-400">10% - 35%</div>
              </div>
              <div>
                <span className="text-white font-bold">Keys 5-7</span>
                <div className="text-cyan-400">45% - 65%</div>
              </div>
              <div>
                <span className="text-white font-bold">Keys 8-9</span>
                <div className="text-cyan-400">75% - 90%</div>
              </div>
              <div>
                <span className="text-cyan-300 font-bold">Key 0</span>
                <div className="text-cyan-300 font-bold">0.0 (Max 100%)</div>
              </div>
            </div>
          </div>

          {/* Hypersonic Boost & Visor HUD */}
          <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-cyan-300 font-bold mb-2 font-orbitron">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>HYPERSONIC BOOST & SPECIAL FUNCTIONS</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-white font-bold bg-cyan-900/60 px-1.5 py-0.5 rounded border border-cyan-500/50">
                  H Key
                </span>{' '}
                : Hypersonic Warp Drive (Mach 5 - 12+)
              </div>
              <div>
                <span className="text-white font-bold bg-cyan-900/60 px-1.5 py-0.5 rounded border border-cyan-500/50">
                  Space
                </span>{' '}
                : Airbrake / Flight Trim
              </div>
              <div>
                <span className="text-white font-bold bg-cyan-900/60 px-1.5 py-0.5 rounded border border-cyan-500/50">
                  C Key
                </span>{' '}
                : Toggle 1st-Person / Chase Camera
              </div>
              <div>
                <span className="text-white font-bold bg-cyan-900/60 px-1.5 py-0.5 rounded border border-cyan-500/50">
                  M Key
                </span>{' '}
                : Toggle Jet Engine Sound Synth
              </div>
              <div>
                <span className="text-white font-bold bg-cyan-900/60 px-1.5 py-0.5 rounded border border-cyan-500/50">
                  P Key
                </span>{' '}
                : Pause / Resume Flight
              </div>
              <div>
                <span className="text-white font-bold bg-cyan-900/60 px-1.5 py-0.5 rounded border border-cyan-500/50">
                  ? Key
                </span>{' '}
                : Open / Close Manual
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors font-orbitron shadow-[0_0_12px_#00f0ff]"
          >
            CONFIRM & RETURN TO COCKPIT
          </button>
        </div>
      </div>
    </div>
  );
};
