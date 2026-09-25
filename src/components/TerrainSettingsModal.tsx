import React, { useState } from 'react';
import { X, Layers, Key, CheckCircle, RefreshCw, Globe } from 'lucide-react';
import { TerrainEngine } from '../types/flight';

interface TerrainSettingsModalProps {
  isOpen: boolean;
  currentEngine: TerrainEngine;
  currentToken: string;
  onClose: () => void;
  onSelectEngine: (engine: TerrainEngine) => void;
  onSaveToken: (token: string) => void;
}

export const TerrainSettingsModal: React.FC<TerrainSettingsModalProps> = ({
  isOpen,
  currentEngine,
  currentToken,
  onClose,
  onSelectEngine,
  onSaveToken
}) => {
  const [tokenInput, setTokenInput] = useState(currentToken);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveToken(tokenInput.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-black/90 border border-cyan-400/80 rounded-xl p-6 hud-glow font-mono-hud text-cyan-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/40 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="font-orbitron font-bold text-base text-white tracking-wider">
              CESIUM ENGINE & TERRAIN CONFIGURATION
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-cyan-400 hover:text-white rounded hover:bg-cyan-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Engine Modes */}
        <div className="space-y-3 mb-5">
          <div className="text-xs text-cyan-300 font-bold uppercase tracking-wider font-orbitron">
            Select 3D Globe & Imagery Provider:
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Google Photorealistic 3D Tiles */}
            <button
              onClick={() => onSelectEngine('google-3d-tiles')}
              className={`p-3 rounded-lg border text-left transition-all flex items-start justify-between ${
                currentEngine === 'google-3d-tiles'
                  ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'border-cyan-500/30 bg-black/50 hover:bg-cyan-950/30 text-cyan-400/80'
              }`}
            >
              <div>
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <span>Google Photorealistic 3D Tiles</span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40">
                    RECOMMENDED
                  </span>
                </div>
                <div className="text-[11px] text-cyan-300/80 mt-1 leading-normal">
                  High-fidelity 3D photogrammetry buildings, cliffs, and real-world topography via Cesium ion.
                </div>
              </div>
              {currentEngine === 'google-3d-tiles' && (
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              )}
            </button>

            {/* Cesium World Terrain */}
            <button
              onClick={() => onSelectEngine('cesium-world-terrain')}
              className={`p-3 rounded-lg border text-left transition-all flex items-start justify-between ${
                currentEngine === 'cesium-world-terrain'
                  ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'border-cyan-500/30 bg-black/50 hover:bg-cyan-950/30 text-cyan-400/80'
              }`}
            >
              <div>
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <span>Cesium World Terrain</span>
                </div>
                <div className="text-[11px] text-cyan-300/80 mt-1 leading-normal">
                  Global high-resolution digital elevation model with satellite drape.
                </div>
              </div>
              {currentEngine === 'cesium-world-terrain' && (
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              )}
            </button>

            {/* OpenStreetMap Fallback */}
            <button
              onClick={() => onSelectEngine('osm-fallback')}
              className={`p-3 rounded-lg border text-left transition-all flex items-start justify-between ${
                currentEngine === 'osm-fallback'
                  ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'border-cyan-500/30 bg-black/50 hover:bg-cyan-950/30 text-cyan-400/80'
              }`}
            >
              <div>
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <span>OpenStreetMap (Zero-Key Fallback)</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    ZERO SETUP
                  </span>
                </div>
                <div className="text-[11px] text-cyan-300/80 mt-1 leading-normal">
                  Guaranteed runnable with zero API keys or tokens required, using open tile servers.
                </div>
              </div>
              {currentEngine === 'osm-fallback' && (
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Cesium ion Access Token */}
        <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/30 rounded-lg text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-300 font-bold font-orbitron">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>CESIUM ION ACCESS TOKEN</span>
            </div>
            <span className="text-[10px] text-cyan-400/80">Free Community Tier</span>
          </div>

          <p className="text-[11px] text-cyan-300/80 leading-relaxed">
            The simulator includes a pre-configured Community token for instant 3D rendering. You can also provide your own personal free token from{' '}
            <a
              href="https://ion.cesium.com/tokens"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-300 underline hover:text-white"
            >
              cesium.com/ion
            </a>
            :
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste Cesium ion JWT token here..."
              className="flex-1 bg-black/70 border border-cyan-500/50 rounded px-3 py-1.5 text-xs text-white placeholder-cyan-700 focus:outline-none focus:border-cyan-300 font-mono-hud"
            />
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded transition-colors whitespace-nowrap"
            >
              {savedSuccess ? 'SAVED!' : 'UPDATE TOKEN'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors font-orbitron"
          >
            APPLY & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
