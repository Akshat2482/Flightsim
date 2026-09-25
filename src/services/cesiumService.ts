import { CameraMode, FlightState, Landmark, TerrainEngine } from '../types/flight';

declare const Cesium: any;

// Free Community Tier Cesium ion token placeholder & user token storage key
const CESIUM_ION_TOKEN_KEY = 'apex_mach_cesium_ion_token';

// Default public community token (user can override in settings)
const DEFAULT_COMMUNITY_ION_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmMjRlMzM1ZC0xMmI4LTRiYTUtYWE0NS0yNjg1Njc1OTVhN2MiLCJpZCI6MTU5OTg1LCJpYXQiOjE2ODg1MzkwMzB9.7L3gM38zX_HqGzI4E_W8pB9t_K5HkR8u_z0ZqX8e8QY';

export class CesiumFlightEngine {
  private viewer: any = null;
  private currentTileset: any = null;
  private currentEngine: TerrainEngine = 'osm-fallback';
  private landmarkEntities: Map<string, any> = new Map();
  private isDestroyed = false;

  public init(container: HTMLElement, onEngineChanged?: (engine: TerrainEngine) => void): Promise<void> {
    return new Promise((resolve) => {
      // Check if Cesium global exists
      if (typeof Cesium === 'undefined') {
        const checkInterval = setInterval(() => {
          if (typeof Cesium !== 'undefined') {
            clearInterval(checkInterval);
            this.setupViewer(container, onEngineChanged).then(resolve);
          }
        }, 100);
        return;
      }
      this.setupViewer(container, onEngineChanged).then(resolve);
    });
  }

  private async setupViewer(container: HTMLElement, onEngineChanged?: (engine: TerrainEngine) => void): Promise<void> {
    try {
      // Configure Ion token
      const storedToken = localStorage.getItem(CESIUM_ION_TOKEN_KEY) || DEFAULT_COMMUNITY_ION_TOKEN;
      if (Cesium.Ion) {
        Cesium.Ion.defaultAccessToken = storedToken;
      }

      // Create minimal Cesium Viewer optimized for flight simulator
      this.viewer = new Cesium.Viewer(container, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        scene3DOnly: true,
        shouldAnimate: true,
        terrainProvider: undefined, // Start with default or OSM fallback
        orderIndependentTranslucency: false,
        contextOptions: {
          webgl: {
            alpha: false,
            antialias: true,
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false
          }
        }
      });

      // Atmospheric and lighting setup
      const scene = this.viewer.scene;
      scene.globe.enableLighting = true;
      scene.globe.depthTestAgainstTerrain = true;
      scene.fog.enabled = true;
      scene.fog.density = 0.00012;
      scene.skyAtmosphere.show = true;
      scene.highDynamicRange = true;

      // Adjust camera frustum
      if (this.viewer.camera.frustum instanceof Cesium.PerspectiveFrustum) {
        this.viewer.camera.frustum.fov = Cesium.Math.toRadians(60);
        this.viewer.camera.frustum.near = 0.5;
        this.viewer.camera.frustum.far = 500000.0;
      }

      // Load initial terrain or Photorealistic 3D Tiles
      await this.setTerrainEngine('google-3d-tiles', onEngineChanged);
    } catch (e) {
      console.warn('Falling back to basic OpenStreetMap imagery:', e);
      await this.fallbackToOSM(onEngineChanged);
    }
  }

  public getViewer() {
    return this.viewer;
  }

  public getTerrainEngine(): TerrainEngine {
    return this.currentEngine;
  }

  public async setTerrainEngine(engine: TerrainEngine, callback?: (engine: TerrainEngine) => void) {
    if (!this.viewer || this.isDestroyed) return;

    // Clean up existing tileset if any
    if (this.currentTileset) {
      this.viewer.scene.primitives.remove(this.currentTileset);
      this.currentTileset = null;
    }

    try {
      if (engine === 'google-3d-tiles') {
        // Try loading Google Photorealistic 3D Tiles via Cesium ion
        if (typeof Cesium.createGooglePhotorealistic3DTileset === 'function') {
          const tileset = await Cesium.createGooglePhotorealistic3DTileset();
          this.viewer.scene.primitives.add(tileset);
          this.currentTileset = tileset;
          this.currentEngine = 'google-3d-tiles';
          callback?.('google-3d-tiles');
          return;
        }
      } else if (engine === 'cesium-world-terrain') {
        // Cesium World Terrain
        if (typeof Cesium.createWorldTerrainAsync === 'function') {
          const terrain = await Cesium.createWorldTerrainAsync();
          this.viewer.terrainProvider = terrain;
          this.currentEngine = 'cesium-world-terrain';
          callback?.('cesium-world-terrain');
          return;
        }
      }
    } catch (err) {
      console.warn(`Engine ${engine} failed, falling back to OSM:`, err);
    }

    // Fallback to OSM
    await this.fallbackToOSM(callback);
  }

  private async fallbackToOSM(callback?: (engine: TerrainEngine) => void) {
    if (!this.viewer) return;
    try {
      this.viewer.imageryLayers.removeAll();
      const osmProvider = new Cesium.OpenStreetMapImageryProvider({
        url: 'https://tile.openstreetmap.org/'
      });
      this.viewer.imageryLayers.addImageryProvider(osmProvider);
      this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
      this.currentEngine = 'osm-fallback';
      callback?.('osm-fallback');
    } catch {
      // Basic fallback
    }
  }

  public setIonToken(token: string) {
    localStorage.setItem(CESIUM_ION_TOKEN_KEY, token);
    if (Cesium.Ion) {
      Cesium.Ion.defaultAccessToken = token;
    }
  }

  public getIonToken(): string {
    return localStorage.getItem(CESIUM_ION_TOKEN_KEY) || DEFAULT_COMMUNITY_ION_TOKEN;
  }

  /**
   * Updates first-person POV camera position, attitude, and hypersonic FOV warp
   */
  public updateCamera(flight: FlightState, mode: CameraMode) {
    if (!this.viewer || !this.viewer.camera) return;

    const camera = this.viewer.camera;
    const latRad = Cesium.Math.toRadians(flight.latitude);
    const lonRad = Cesium.Math.toRadians(flight.longitude);

    // Compute heading, pitch, roll in Cesium angles
    const headingRad = Cesium.Math.toRadians(flight.heading);
    const pitchRad = Cesium.Math.toRadians(flight.pitch);
    const rollRad = Cesium.Math.toRadians(flight.roll);

    const position = Cesium.Cartesian3.fromDegrees(
      flight.longitude,
      flight.latitude,
      flight.altitude
    );

    // Hypersonic FOV dynamic warp (from 60° opening up to 95°+)
    if (camera.frustum instanceof Cesium.PerspectiveFrustum) {
      const baseFov = 60;
      const fovBoost = 35 * (flight.hypersonicFactor || 0);
      const targetFov = Cesium.Math.toRadians(baseFov + fovBoost);
      // Smooth lerp
      camera.frustum.fov = Cesium.Math.lerp(camera.frustum.fov, targetFov, 0.1);
    }

    if (mode === 'cockpit') {
      // First Person POV - Eye position directly in cockpit looking forward
      camera.setView({
        destination: position,
        orientation: {
          heading: headingRad,
          pitch: pitchRad,
          roll: rollRad
        }
      });
    } else if (mode === 'chase') {
      // Third Person Chase Plane - Camera positioned behind and slightly above
      const hpr = new Cesium.HeadingPitchRoll(headingRad, pitchRad, rollRad);
      const transform = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);

      // Offset: 45 meters back, 12 meters up
      const offset = new Cesium.Cartesian3(-45, 0, 12);
      const camPos = Cesium.Matrix4.multiplyByPoint(transform, offset, new Cesium.Cartesian3());

      camera.setView({
        destination: camPos,
        orientation: {
          heading: headingRad,
          pitch: Cesium.Math.toRadians(flight.pitch - 6),
          roll: rollRad
        }
      });
    }
  }

  /**
   * Samples ground height directly under the aircraft to calculate AGL (above ground level)
   */
  public getGroundAltitude(lat: number, lon: number): number {
    if (!this.viewer || !this.viewer.scene || !this.viewer.scene.globe) return 0;
    try {
      const carto = Cesium.Cartographic.fromDegrees(lon, lat);
      const height = this.viewer.scene.globe.getHeight(carto);
      return height !== undefined && !isNaN(height) ? Math.max(height, 0) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Renders real city and state/province name overlays draped over mountains/terrain (Image 1 style)
   */
  public setLandmarks(landmarks: Landmark[]) {
    if (!this.viewer || !this.viewer.entities) return;

    // Clear old entities
    this.landmarkEntities.forEach((entity) => {
      this.viewer.entities.remove(entity);
    });
    this.landmarkEntities.clear();

    // Create styled draped entities for each landmark
    landmarks.forEach((lm) => {
      // Color and icon styling based on category (matching Image 1 Google Earth flight sim)
      let badgeColor = Cesium.Color.fromCssColorString('#00f0ff');
      let iconSvg = '';

      if (lm.category === 'peak') {
        // Mountain peak badge: green circle with summit glyph (like Image 1)
        badgeColor = Cesium.Color.fromCssColorString('#10b981');
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polygon points="3 20 12 4 21 20 3 20"/></svg>`;
      } else if (lm.category === 'city') {
        // City badge: bright cyan hexagon/diamond
        badgeColor = Cesium.Color.fromCssColorString('#00f0ff');
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2.5"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="#00f0ff"/></svg>`;
      } else if (lm.category === 'airport') {
        // Airport badge: amber runway
        badgeColor = Cesium.Color.fromCssColorString('#f59e0b');
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/></svg>`;
      } else {
        badgeColor = Cesium.Color.fromCssColorString('#38bdf8');
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>`;
      }

      const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(iconSvg);

      // Cesium Entity draped onto terrain (CLAMP_TO_GROUND)
      const entity = this.viewer.entities.add({
        id: lm.id,
        name: lm.name,
        position: Cesium.Cartesian3.fromDegrees(lm.longitude, lm.latitude, lm.elevation),
        billboard: {
          image: svgDataUrl,
          width: 22,
          height: 22,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(100.0, 120000.0),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        label: {
          text: lm.category === 'peak' ? `▲ ${lm.name} (${lm.elevation}m)` : lm.name,
          font: "600 13px 'Chakra Petch', 'Segoe UI', sans-serif",
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: badgeColor,
          outlineColor: Cesium.Color.BLACK.withAlpha(0.9),
          outlineWidth: 3,
          showBackground: true,
          backgroundColor: new Cesium.Color(0.02, 0.08, 0.15, 0.8),
          backgroundPadding: new Cesium.Cartesian2(7, 4),
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, 4),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(100.0, 120000.0),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });

      this.landmarkEntities.set(lm.id, entity);
    });
  }

  /**
   * Projects 3D geographic coordinates onto 2D screen coordinates for HUD target lock
   */
  public projectToScreen(lat: number, lon: number, alt: number): { x: number; y: number; inFront: boolean } | null {
    if (!this.viewer || !this.viewer.scene) return null;
    try {
      const cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
      const scene = this.viewer.scene;
      const camera = scene.camera;

      // Check if point is in front of camera
      const toPoint = Cesium.Cartesian3.subtract(cartesian, camera.position, new Cesium.Cartesian3());
      const dot = Cesium.Cartesian3.dot(camera.direction, toPoint);
      if (dot <= 0) {
        return { x: -9999, y: -9999, inFront: false };
      }

      const windowCoord = Cesium.SceneTransforms.worldToWindowCoordinates(scene, cartesian);
      if (!windowCoord) return null;

      return {
        x: windowCoord.x,
        y: windowCoord.y,
        inFront: true
      };
    } catch {
      return null;
    }
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.viewer && !this.viewer.isDestroyed()) {
      this.viewer.destroy();
      this.viewer = null;
    }
  }
}
