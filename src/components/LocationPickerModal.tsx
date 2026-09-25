import React from 'react';
import { X, MapPin, Mountain, Plane, Compass, Sparkles } from 'lucide-react';
import { FLIGHT_PRESETS } from '../data/locations';
import { FlightPreset } from '../types/flight';

interface LocationPickerModalProps {
  isOpen: boolean;
  activePresetId: string;
  onClose: () => void;
  onSelectPreset: (preset: FlightPreset) => void;
  onFetchOverpass: () => void;
  isLoadingOverpass: boolean;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  activePresetId,
  onClose,
  onSelectPreset,
  onFetchOverpass,
  isLoadingOverpass
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-black/90 border border-cyan-400/80 rounded-xl p-6 hud-glow font-mono-hud text-cyan-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/40 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="font-orbitron font-bold text-base text-white tracking-wider">
              SCENIC FLIGHT THEATERS & TERRAIN PRESETS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-cyan-400 hover:text-white rounded hover:bg-cyan-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets List */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {FLIGHT_PRESETS.map((preset) => {
            const isSelected = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-lg border text-left transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                    : 'border-cyan-500/30 bg-black/40 hover:bg-cyan-950/30 text-cyan-300'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2 rounded-md ${isSelected ? 'bg-cyan-400 text-black' : 'bg-cyan-950 border border-cyan-500/40 text-cyan-400'}`}>
                    <Mountain className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-orbitron font-bold text-sm text-white group-hover:text-cyan-200 transition-colors flex items-center gap-2">
                      <span>{preset.name}</span>
                      {preset.id === 'swiss-alps' && (
                        <span className="text-[10px] font-sans font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                          REFERENCE SCENE
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-cyan-400/80 mt-0.5">
                      {preset.subtitle}
                    </div>
                    <div className="text-[10px] text-cyan-500/90 mt-1">
                      Alt: {preset.altitude}m · Spd: {preset.speed}kt · {preset.landmarks.length} Landmark Overlays Draped
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                    TELEPORT →
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Overpass API Live Query Trigger */}
        <div className="mt-4 pt-3 border-t border-cyan-500/30 flex items-center justify-between">
          <div className="text-[11px] text-cyan-400/80">
            Flying elsewhere? Scan OpenStreetMap for live peaks & cities:
          </div>
          <button
            onClick={onFetchOverpass}
            disabled={isLoadingOverpass}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/50 border border-cyan-400/50 hover:bg-cyan-900/60 rounded text-xs text-cyan-300 font-bold transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isLoadingOverpass ? 'SCANNING OSM...' : 'LIVE OSM SCAN'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
