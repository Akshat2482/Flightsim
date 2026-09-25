// Ambient global declaration for Cesium loaded via CDN
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Cesium: any;

interface Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Cesium?: any;
  CESIUM_BASE_URL?: string;
}
