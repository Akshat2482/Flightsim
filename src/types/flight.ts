export type CameraMode = 'cockpit' | 'chase' | 'free';

export type TerrainEngine = 'google-3d-tiles' | 'cesium-world-terrain' | 'osm-fallback';

export interface FlightState {
  latitude: number;
  longitude: number;
  altitude: number; // meters above sea level
  altitudeAGL: number; // meters above ground level
  heading: number; // 0 to 360 degrees
  pitch: number; // -90 to +90 degrees (climb positive, dive negative)
  roll: number; // -180 to +180 degrees (bank right positive, bank left negative)
  yawRate: number; // deg/s
  pitchRate: number; // deg/s
  rollRate: number; // deg/s
  airspeed: number; // knots
  mach: number; // Mach number
  verticalSpeed: number; // ft/min
  throttle: number; // Inverted scale: 1.0 = Idle / 0% power, 0.0 = Max / 100% power
  thrustPercentage: number; // Derived: (1.0 - throttle) * 100%
  gForce: number; // Dynamic G-force
  hypersonicActive: boolean;
  hypersonicFactor: number; // 0.0 to 1.0 smooth ramp for hypersonic transition
  airbrakeActive: boolean;
  isPaused: boolean;
  isAudioMuted: boolean;
  isOverSpeed: boolean;
  stallWarning: boolean;
}

export interface FlightControlsInput {
  pitchUp: boolean;
  pitchDown: boolean;
  rollLeft: boolean;
  rollRight: boolean;
  yawLeft: boolean;
  yawRight: boolean;
  airbrake: boolean;
}

export interface Landmark {
  id: string;
  name: string;
  category: 'city' | 'town' | 'peak' | 'airport' | 'landmark';
  latitude: number;
  longitude: number;
  elevation: number; // meters
  region: string;
  country: string;
  distanceKm?: number;
  bearingDeg?: number;
  elevationAngle?: number;
  isInCrosshair?: boolean;
}

export interface FlightPreset {
  id: string;
  name: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  pitch: number;
  roll: number;
  speed: number;
  landmarks: Landmark[];
}
