import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CROP_MAP } from '../data/reliefCrops';
import {
  CameraFocusPreset,
  CropId,
  FarmPlotState,
  SeasonType,
  TargetRef,
  WeatherType,
  WildSpecimenState,
} from '../types/botany';
import {
  createBroadleafTree,
  createCropVisual,
  createFarmhouse,
  createPineTree,
  createPlotBed,
  createWell,
  createWheelbarrow,
} from './proceduralProps';
import { createProceduralTextures } from './proceduralTextures';
import { getStreamCenterZ, groundHeightAt } from './terrainMath';

export interface CameraTargetCommand {
  position: [number, number, number];
  target: [number, number, number];
  nonce: number;
}

export interface ParticleBurstCommand {
  position: [number, number, number];
  colorHex: string;
  nonce: number;
}

interface FarmWorldProps {
  plots: FarmPlotState[];
  wildSpecimens: WildSpecimenState[];
  timeHours: number; // 0..24 continuous
  dayOfYear: number; // 1..365
  season: SeasonType;
  weather: WeatherType;
  freeCamPaused?: boolean;
  cameraCommand: CameraTargetCommand | null;
  burstCommand: ParticleBurstCommand | null;
  focusedTarget: TargetRef | null;
  onPlotClick: (plotId: string) => void;
  onWildClick: (wildId: string) => void;
  onHoverChange: (hoverLabel: string | null) => void;
  onHoverTarget: (target: TargetRef | null) => void;
}

// Pre-allocated scratch math helpers (zero GC inside animation loop)
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _camFwd = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _scale = new THREE.Vector3();
const _color = new THREE.Color();
const _colorA = new THREE.Color();
const _colorB = new THREE.Color();

interface PlotVisualNode {
  group: THREE.Group;
  soilMat: THREE.MeshStandardMaterial;
  highlightRing: THREE.Mesh;
  hitMesh: THREE.Mesh;
  cropHolder: THREE.Group;
  renderedKey: string;
}

interface WildVisualNode {
  group: THREE.Group;
  cropHolder: THREE.Group;
  markerMesh: THREE.Mesh;
  ringMesh: THREE.Mesh;
  hitMesh: THREE.Mesh;
  cropId: CropId;
  available: boolean;
  renderedStage: number;
}

interface BurstParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

interface SeasonalTreeNode {
  material: THREE.MeshStandardMaterial;
  role: 'broadleaf' | 'pine';
  baseColor: THREE.Color;
  variant: number;
}

export function getPresetCameraCoords(preset: CameraFocusPreset): {
  position: [number, number, number];
  target: [number, number, number];
} {
  switch (preset) {
    case 'farm':
      return { position: [0, 10.5, 13.5], target: [0, 0.3, 0.5] };
    case 'wild_overview':
      return { position: [0, 17.5, 24.5], target: [0, 0.5, 0] };
    case 'hillside':
      return { position: [-8.5, 8.2, -1.5], target: [-14.2, 2.2, -9.5] };
    case 'highland':
      return { position: [8.5, 8.5, -1.5], target: [14.2, 2.5, -9.5] };
    case 'meadow':
      return { position: [9.5, 6.2, 18.5], target: [8.5, 0.8, 10.2] };
    case 'streamside':
      return { position: [-4.5, 6.5, 20.5], target: [-10.0, 0.8, 12.2] };
  }
}

function getStageFromProgress(progress: number, mature: boolean): 0 | 1 | 2 | 3 {
  if (mature || progress >= 1) return 3;
  if (progress >= 0.62) return 2;
  if (progress >= 0.25) return 1;
  return 0;
}

/**
 * Computes continuous seasonal weights across the 365-day year.
 */
function getSeasonWeights(dayOfYear: number): {
  spring: number;
  summer: number;
  autumn: number;
  winter: number;
} {
  // Peak days: Winter ~15 (Jan 15), Spring ~105 (Apr 15), Summer ~196 (Jul 15), Autumn ~288 (Oct 15)
  const d = ((dayOfYear - 1) % 365 + 365) % 365 + 1;
  const distCircular = (a: number, b: number) => {
    const diff = Math.abs(a - b);
    return Math.min(diff, 365 - diff);
  };
  const weightFor = (peak: number) => Math.max(0, 1 - distCircular(d, peak) / 92);

  const spring = weightFor(105);
  const summer = weightFor(196);
  const autumn = weightFor(288);
  const winter = weightFor(15);
  const total = spring + summer + autumn + winter || 1;
  return {
    spring: spring / total,
    summer: summer / total,
    autumn: autumn / total,
    winter: winter / total,
  };
}

function createSnowflakeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.45, 'rgba(240, 248, 255, 0.85)');
    grad.addColorStop(1, 'rgba(240, 248, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSoftMoteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 28);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.72)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const FarmWorld: React.FC<FarmWorldProps> = ({
  plots,
  wildSpecimens,
  timeHours,
  dayOfYear,
  season,
  weather,
  freeCamPaused = false,
  cameraCommand,
  burstCommand,
  focusedTarget,
  onPlotClick,
  onWildClick,
  onHoverChange,
  onHoverTarget,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Refs bridging React state into stable WebGL loop
  const plotsRef = useRef(plots);
  plotsRef.current = plots;

  const wildRef = useRef(wildSpecimens);
  wildRef.current = wildSpecimens;

  const focusedTargetRef = useRef(focusedTarget);
  focusedTargetRef.current = focusedTarget;

  const timeHoursRef = useRef(timeHours);
  timeHoursRef.current = timeHours;

  const dayOfYearRef = useRef(dayOfYear);
  dayOfYearRef.current = dayOfYear;

  const seasonRef = useRef(season);
  seasonRef.current = season;

  const weatherRef = useRef(weather);
  weatherRef.current = weather;

  const freeCamPausedRef = useRef(freeCamPaused);
  freeCamPausedRef.current = freeCamPaused;

  const callbacksRef = useRef({ onPlotClick, onWildClick, onHoverChange, onHoverTarget });
  callbacksRef.current = { onPlotClick, onWildClick, onHoverChange, onHoverTarget };

  const cameraFlightRef = useRef<{
    active: boolean;
    pos: THREE.Vector3;
    target: THREE.Vector3;
  }>({
    active: false,
    pos: new THREE.Vector3(),
    target: new THREE.Vector3(),
  });

  const pendingBurstRef = useRef<ParticleBurstCommand | null>(null);
  const lastBurstNonceRef = useRef<number>(-1);
  const lastCamNonceRef = useRef<number>(-1);

  useEffect(() => {
    if (cameraCommand && cameraCommand.nonce !== lastCamNonceRef.current) {
      lastCamNonceRef.current = cameraCommand.nonce;
      cameraFlightRef.current.pos.set(...cameraCommand.position);
      cameraFlightRef.current.target.set(...cameraCommand.target);
      cameraFlightRef.current.active = true;
    }
  }, [cameraCommand]);

  useEffect(() => {
    if (burstCommand && burstCommand.nonce !== lastBurstNonceRef.current) {
      lastBurstNonceRef.current = burstCommand.nonce;
      pendingBurstRef.current = burstCommand;
    }
  }, [burstCommand]);

  useEffect(() => {
    const mountEl = containerRef.current;
    if (!mountEl) return;

    // 1. Software WebGL detection
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mountEl.clientWidth || window.innerWidth, mountEl.clientHeight || window.innerHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountEl.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    // 3. Scene, Camera, Environment, Fog
    const scene = new THREE.Scene();
    const skyColor = new THREE.Color(0xc8dcc8);
    scene.background = skyColor.clone();
    scene.fog = new THREE.FogExp2(skyColor.getHex(), 0.0155);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const width = mountEl.clientWidth || window.innerWidth;
    const height = mountEl.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.25, 180);
    camera.position.set(0, 10.5, 13.5);

    // Free & responsive OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.075;
    controls.minDistance = 2.0;
    controls.maxDistance = 60;
    controls.minPolarAngle = 0.05;
    controls.maxPolarAngle = Math.PI * 0.492;
    controls.screenSpacePanning = false;
    controls.panSpeed = 1.25;
    controls.rotateSpeed = 0.9;
    controls.zoomSpeed = 1.2;
    controls.target.set(0, 0.3, 0.5);

    // Cancel camera auto-flight if user grabs controls
    controls.addEventListener('start', () => {
      cameraFlightRef.current.active = false;
    });

    // Free camera keyboard state (WASD / Arrow keys to roam freely around the valley)
    const camKeys: Record<string, boolean> = {};
    const onCamKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (freeCamPausedRef.current) return;
      if (
        e.code === 'KeyW' ||
        e.code === 'KeyA' ||
        e.code === 'KeyS' ||
        e.code === 'KeyD' ||
        e.code === 'ArrowUp' ||
        e.code === 'ArrowDown' ||
        e.code === 'ArrowLeft' ||
        e.code === 'ArrowRight'
      ) {
        camKeys[e.code] = true;
        cameraFlightRef.current.active = false;
      }
    };
    const onCamKeyUp = (e: KeyboardEvent) => {
      camKeys[e.code] = false;
    };
    const onCamBlur = () => {
      Object.keys(camKeys).forEach((k) => {
        camKeys[k] = false;
      });
    };
    window.addEventListener('keydown', onCamKeyDown);
    window.addEventListener('keyup', onCamKeyUp);
    window.addEventListener('blur', onCamBlur);

    // 4. Studio Outdoor Lighting Rig (Warm Sun / Cool Moon + Hemisphere)
    const hemiLight = new THREE.HemisphereLight(0xc8e4f5, 0x5c533c, 0.85);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff1d6, 2.25);
    sunLight.position.set(16, 22, 12);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 75;
    const d = 24;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xbbe0f2, 0.55);
    rimLight.position.set(-14, 10, -16);
    scene.add(rimLight);

    // 5. Procedural Textures
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const textures = createProceduralTextures(maxAniso);

    // 6. Terrain Mesh (Undulating countryside with vertex color biome & seasonal blending)
    const terrainSize = 96;
    const terrainSegs = 96;
    const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegs, terrainSegs);
    terrainGeo.rotateX(-Math.PI / 2);
    const posAttr = terrainGeo.attributes.position;
    const baseTerrainColors = new Float32Array(posAttr.count * 3);
    const colors = new Float32Array(posAttr.count * 3);
    const terrainZoneTags = new Uint8Array(posAttr.count); // 0=meadow, 1=highland, 2=hillside, 3=stream, 4=ridge

    const cMeadow = new THREE.Color(0x88aa68);
    const cHighland = new THREE.Color(0xa69d75);
    const cHillside = new THREE.Color(0x769458);
    const cStreamBank = new THREE.Color(0x6c7c57);
    const cRidge = new THREE.Color(0x566c4a);

    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      const vy = groundHeightAt(vx, vz);
      posAttr.setY(i, vy);

      const dist = Math.hypot(vx, vz);
      const streamDist = Math.abs(vz - getStreamCenterZ(vx));

      if (streamDist < 2.6 && vx < 4) {
        _color.copy(cStreamBank);
        terrainZoneTags[i] = 3;
      } else if (vy > 3.6 || dist > 26) {
        _color.copy(cRidge);
        terrainZoneTags[i] = 4;
      } else if (vx > 7 && vz < 4) {
        _color.copy(cHighland);
        terrainZoneTags[i] = 1;
      } else if (vx < -7 && vz < 4) {
        _color.copy(cHillside);
        terrainZoneTags[i] = 2;
      } else {
        _color.copy(cMeadow);
        terrainZoneTags[i] = 0;
      }

      baseTerrainColors[i * 3] = _color.r;
      baseTerrainColors[i * 3 + 1] = _color.g;
      baseTerrainColors[i * 3 + 2] = _color.b;
      colors[i * 3] = _color.r;
      colors[i * 3 + 1] = _color.g;
      colors[i * 3 + 2] = _color.b;
    }
    const terrainColorAttr = new THREE.BufferAttribute(colors, 3);
    terrainGeo.setAttribute('color', terrainColorAttr);
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      map: textures.meadowMap,
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.02,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // 7. Flowing Stream Ribbon in the Southwest Biome
    const streamGeo = new THREE.PlaneGeometry(34, 4.2, 48, 4);
    streamGeo.rotateX(-Math.PI / 2);
    const sPos = streamGeo.attributes.position;
    for (let i = 0; i < sPos.count; i++) {
      const lx = sPos.getX(i) - 10;
      const lz = sPos.getZ(i);
      const centerZ = getStreamCenterZ(lx);
      sPos.setX(i, lx);
      sPos.setZ(i, centerZ + lz);
      sPos.setY(i, -0.32);
    }
    streamGeo.computeVertexNormals();
    const streamMat = new THREE.MeshStandardMaterial({
      color: 0x4b8f9c,
      roughness: 0.12,
      metalness: 0.25,
      transparent: true,
      opacity: 0.82,
    });
    const streamMesh = new THREE.Mesh(streamGeo, streamMat);
    streamMesh.receiveShadow = true;
    scene.add(streamMesh);

    // 8. Farmstead Structures & Props (Grounded at groundHeightAt)
    const farmhouse = createFarmhouse(textures);
    farmhouse.position.set(0, groundHeightAt(0, -6.4), -6.4);
    scene.add(farmhouse);

    let windowPaperMat: THREE.MeshStandardMaterial | null = null;
    let lanternGlowMat: THREE.MeshStandardMaterial | null = null;
    farmhouse.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (obj.userData.seasonalRole === 'windowPaper') {
          windowPaperMat = obj.material as THREE.MeshStandardMaterial;
        } else if (obj.userData.seasonalRole === 'lanternGlow') {
          lanternGlowMat = obj.material as THREE.MeshStandardMaterial;
        }
      }
    });

    const well = createWell(textures);
    well.position.set(-5.8, groundHeightAt(-5.8, -4.4), -4.4);
    well.rotation.y = 0.4;
    scene.add(well);

    const wheelbarrow = createWheelbarrow(textures);
    wheelbarrow.position.set(5.4, groundHeightAt(5.4, -4.2), -4.2);
    wheelbarrow.rotation.y = -0.65;
    scene.add(wheelbarrow);

    // Wooden farm fence rails framing the back of the terrace
    const fenceMat = new THREE.MeshStandardMaterial({ map: textures.woodMap, roughness: 0.78 });
    const postGeo = new THREE.BoxGeometry(0.14, 0.85, 0.14);
    const railGeo = new THREE.BoxGeometry(2.4, 0.09, 0.07);
    [-6.6, -4.2, 4.2, 6.6].forEach((fx) => {
      const fy = groundHeightAt(fx, -8.3);
      const post = new THREE.Mesh(postGeo, fenceMat);
      post.position.set(fx, fy + 0.42, -8.3);
      post.castShadow = true;
      scene.add(post);
    });
    [-5.4, 5.4].forEach((rx) => {
      const ry = groundHeightAt(rx, -8.3);
      const rail1 = new THREE.Mesh(railGeo, fenceMat);
      rail1.position.set(rx, ry + 0.65, -8.3);
      scene.add(rail1);
      const rail2 = new THREE.Mesh(railGeo, fenceMat);
      rail2.position.set(rx, ry + 0.36, -8.3);
      scene.add(rail2);
    });

    // 9. Natural Outdoor Perimeter: Pines, Broadleaf Trees & Boulders
    const treePlacements: [number, number, 'pine' | 'oak', number][] = [
      [-18, -16, 'pine', 1.1],
      [-21, -8, 'pine', 1.25],
      [-15, -19, 'oak', 1.0],
      [-9, -18, 'pine', 0.95],
      [10, -19, 'pine', 1.15],
      [18, -17, 'oak', 1.1],
      [22, -10, 'pine', 1.2],
      [21, 3, 'oak', 1.05],
      [-20, 6, 'oak', 1.15],
      [-18, 16, 'pine', 1.1],
      [-8, 19, 'oak', 0.95],
      [16, 15, 'oak', 1.0],
      [22, 12, 'pine', 1.15],
      [0, -21, 'pine', 1.2],
      [5, -20, 'oak', 1.0],
      [-24, 0, 'pine', 1.3],
      [25, -3, 'pine', 1.25],
    ];
    const seasonalTrees: SeasonalTreeNode[] = [];
    treePlacements.forEach(([tx, tz, kind, sc], idx) => {
      const tree = kind === 'pine' ? createPineTree(idx + 1) : createBroadleafTree(idx % 3);
      tree.position.set(tx, groundHeightAt(tx, tz) - 0.05, tz);
      tree.scale.setScalar(sc);
      tree.rotation.y = idx * 1.15;
      scene.add(tree);

      const seenMats = new Set<THREE.MeshStandardMaterial>();
      tree.traverse((obj) => {
        if (obj instanceof THREE.Mesh && (obj.userData.seasonalRole === 'broadleaf' || obj.userData.seasonalRole === 'pine')) {
          const mat = obj.material as THREE.MeshStandardMaterial;
          if (!seenMats.has(mat)) {
            seenMats.add(mat);
            seasonalTrees.push({
              material: mat,
              role: obj.userData.seasonalRole,
              baseColor: new THREE.Color(obj.userData.baseHex as number),
              variant: idx,
            });
          }
        }
      });
    });

    // Instanced rocks & boulders around highland & stream
    const rockCount = 48;
    const rockGeo = new THREE.DodecahedronGeometry(0.45, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      map: textures.stoneMap,
      roughness: 0.9,
      metalness: 0.04,
    });
    const rockInst = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
    rockInst.castShadow = true;
    rockInst.receiveShadow = true;
    for (let i = 0; i < rockCount; i++) {
      const angle = i * 2.39996;
      const radius = 10.5 + (i % 7) * 2.4;
      const rx = Math.cos(angle) * radius;
      const rz = Math.sin(angle) * radius;
      const ry = groundHeightAt(rx, rz);
      const s = 0.55 + (i % 5) * 0.25;
      _v1.set(rx, ry + s * 0.14, rz);
      _euler.set((i % 3) * 0.4, i * 0.9, (i % 4) * 0.3);
      _quat.setFromEuler(_euler);
      _scale.set(s * 1.2, s * 0.72, s);
      _mat4.compose(_v1, _quat, _scale);
      rockInst.setMatrixAt(i, _mat4);
      _color.setHSL(0.08, 0.06, 0.45 + (i % 4) * 0.08);
      rockInst.setColorAt(i, _color);
    }
    rockInst.instanceMatrix.needsUpdate = true;
    if (rockInst.instanceColor) rockInst.instanceColor.needsUpdate = true;
    rockInst.computeBoundingSphere();
    scene.add(rockInst);

    // Instanced grass blades & meadow tufts (320 instances)
    const grassCount = 320;
    const grassGeo = new THREE.ConeGeometry(0.075, 0.42, 4);
    grassGeo.translate(0, 0.21, 0);
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.85,
    });
    const grassInst = new THREE.InstancedMesh(grassGeo, grassMat, grassCount);
    const grassBaseColors: THREE.Color[] = [];
    for (let i = 0; i < grassCount; i++) {
      const a = i * 1.6180339 * Math.PI * 2;
      const rad = 8.4 + ((i * 19) % 100) * 0.18;
      const gx = Math.cos(a) * rad;
      const gz = Math.sin(a) * rad;
      const gy = groundHeightAt(gx, gz);
      const s = 0.8 + (i % 5) * 0.16;
      _v1.set(gx, gy - 0.02, gz);
      _euler.set(((i % 3) - 1) * 0.15, a, ((i % 4) - 1.5) * 0.12);
      _quat.setFromEuler(_euler);
      _scale.set(s, s, s);
      _mat4.compose(_v1, _quat, _scale);
      grassInst.setMatrixAt(i, _mat4);
      const baseC = new THREE.Color().setHSL(0.24 + (i % 5) * 0.015, 0.38, 0.34 + (i % 3) * 0.05);
      grassBaseColors.push(baseC);
      grassInst.setColorAt(i, baseC);
    }
    grassInst.instanceMatrix.needsUpdate = true;
    if (grassInst.instanceColor) grassInst.instanceColor.needsUpdate = true;
    grassInst.computeBoundingSphere();
    scene.add(grassInst);

    // 10. Interactive Farm Plot Nodes (8 Plots)
    const clickableMeshes: THREE.Object3D[] = [];
    const plotNodes = new Map<string, PlotVisualNode>();
    const hitGeo = new THREE.BoxGeometry(2.15, 1.35, 2.15);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });

    plotsRef.current.forEach((p) => {
      const { group, soilMat, highlightRing } = createPlotBed(textures);
      const py = groundHeightAt(p.position[0], p.position[2]);
      group.position.set(p.position[0], py, p.position[2]);

      const cropHolder = new THREE.Group();
      cropHolder.position.y = 0.14;
      group.add(cropHolder);

      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.y = 0.65;
      hitMesh.layers.set(1);
      hitMesh.userData = { kind: 'plot', id: p.id };
      group.add(hitMesh);
      clickableMeshes.push(hitMesh);

      scene.add(group);
      plotNodes.set(p.id, {
        group,
        soilMat,
        highlightRing,
        hitMesh,
        cropHolder,
        renderedKey: 'empty',
      });
    });

    // 11. Interactive Wild Habitat Specimen Nodes
    const wildNodes = new Map<string, WildVisualNode>();
    const wildHitGeo = new THREE.CylinderGeometry(0.95, 0.95, 1.5, 8);
    const markerGeo = new THREE.OctahedronGeometry(0.11, 0);

    wildRef.current.forEach((w) => {
      const crop = CROP_MAP[w.cropId];
      const group = new THREE.Group();
      const wy = groundHeightAt(w.position[0], w.position[2]);
      group.position.set(w.position[0], wy, w.position[2]);

      const ringGeo = new THREE.RingGeometry(0.62, 0.72, 24);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: crop.accentHex,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.03;
      group.add(ringMesh);

      const initialStage = getStageFromProgress(w.growthProgress, w.available);
      const cropHolder = new THREE.Group();
      cropHolder.add(createCropVisual(w.cropId, initialStage, true));
      group.add(cropHolder);

      const markerMat = new THREE.MeshStandardMaterial({
        color: crop.accentHex,
        emissive: crop.accentHex,
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.2,
      });
      const markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.y = 1.35;
      group.add(markerMesh);

      const hitMesh = new THREE.Mesh(wildHitGeo, hitMat);
      hitMesh.position.y = 0.75;
      hitMesh.layers.set(1);
      hitMesh.userData = { kind: 'wild', id: w.id };
      group.add(hitMesh);
      clickableMeshes.push(hitMesh);

      scene.add(group);
      wildNodes.set(w.id, {
        group,
        cropHolder,
        markerMesh,
        ringMesh,
        hitMesh,
        cropId: w.cropId,
        available: w.available,
        renderedStage: initialStage,
      });
    });

    // 12. Particle Burst Pool (for watering & harvesting feedback)
    const burstParticles: BurstParticle[] = [];
    const particleGeo = new THREE.DodecahedronGeometry(0.065, 0);

    const spawnBurst = (pos: [number, number, number], hex: string) => {
      const py = groundHeightAt(pos[0], pos[2]) + 0.45;
      for (let i = 0; i < 14; i++) {
        const mat = new THREE.MeshStandardMaterial({
          color: hex,
          emissive: hex,
          emissiveIntensity: 0.3,
          roughness: 0.4,
        });
        const mesh = new THREE.Mesh(particleGeo, mat);
        mesh.position.set(pos[0], py, pos[2]);
        scene.add(mesh);
        const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
        const speed = 1.2 + Math.random() * 1.4;
        burstParticles.push({
          mesh,
          velocity: new THREE.Vector3(
            Math.cos(angle) * speed,
            2.2 + Math.random() * 1.6,
            Math.sin(angle) * speed,
          ),
          life: 0,
          maxLife: 0.72,
        });
      }
    };

    // 12b. 3D Rain Streak System (single draw call LineSegments)
    const rainCount = 380;
    const rainPositions = new Float32Array(rainCount * 6);
    const rainOffsets = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      const rx = (Math.random() - 0.5) * 48;
      const ry = Math.random() * 17;
      const rz = (Math.random() - 0.5) * 48;
      rainOffsets[i * 3] = rx;
      rainOffsets[i * 3 + 1] = ry;
      rainOffsets[i * 3 + 2] = rz;
      rainPositions[i * 6] = rx;
      rainPositions[i * 6 + 1] = ry;
      rainPositions[i * 6 + 2] = rz;
      rainPositions[i * 6 + 3] = rx - 0.08;
      rainPositions[i * 6 + 4] = ry - 0.62;
      rainPositions[i * 6 + 5] = rz + 0.04;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.LineBasicMaterial({
      color: 0xc8deeb,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    });
    const rainLines = new THREE.LineSegments(rainGeo, rainMat);
    rainLines.visible = weatherRef.current === 'rain';
    rainLines.frustumCulled = false;
    scene.add(rainLines);

    // 12c. 3D Snowfall Particle System (single draw call Points)
    const snowCount = 460;
    const snowPositions = new Float32Array(snowCount * 3);
    const snowSeeds = new Float32Array(snowCount);
    for (let i = 0; i < snowCount; i++) {
      snowPositions[i * 3] = (Math.random() - 0.5) * 52;
      snowPositions[i * 3 + 1] = Math.random() * 18;
      snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 52;
      snowSeeds[i] = Math.random() * Math.PI * 2;
    }
    const snowGeo = new THREE.BufferGeometry();
    snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
    const snowTexture = createSnowflakeTexture();
    const snowMat = new THREE.PointsMaterial({
      color: 0xf4f9ff,
      map: snowTexture,
      size: 0.34,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    });
    const snowPoints = new THREE.Points(snowGeo, snowMat);
    snowPoints.visible = weatherRef.current === 'snow';
    snowPoints.frustumCulled = false;
    scene.add(snowPoints);

    // 12d. Seasonal Atmospheric Motes (Spring petals, Summer fireflies/sun-motes, Autumn leaves, Winter frost shimmer)
    const moteCount = 130;
    const motePositions = new Float32Array(moteCount * 3);
    const moteColors = new Float32Array(moteCount * 3);
    const moteSeeds = new Float32Array(moteCount);
    for (let i = 0; i < moteCount; i++) {
      motePositions[i * 3] = (Math.random() - 0.5) * 44;
      motePositions[i * 3 + 1] = 0.6 + Math.random() * 9.5;
      motePositions[i * 3 + 2] = (Math.random() - 0.5) * 44;
      moteSeeds[i] = Math.random() * Math.PI * 2;
      moteColors[i * 3] = 1;
      moteColors[i * 3 + 1] = 1;
      moteColors[i * 3 + 2] = 1;
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
    const moteColorAttr = new THREE.BufferAttribute(moteColors, 3);
    moteGeo.setAttribute('color', moteColorAttr);
    const moteTexture = createSoftMoteTexture();
    const moteMat = new THREE.PointsMaterial({
      size: 0.24,
      map: moteTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const seasonMotes = new THREE.Points(moteGeo, moteMat);
    seasonMotes.frustumCulled = false;
    scene.add(seasonMotes);

    // Seasonal visual state tracking (updates when dayOfYear shifts or snow toggles)
    let lastUpdatedSeasonKey = '';
    const cAutumnGrass = new THREE.Color(0xb3944c);
    const cWinterGrass = new THREE.Color(0xb9c5bf);
    const cSnowTint = new THREE.Color(0xeaf2f6);
    const cSpringBlossom = new THREE.Color(0xe6b5c4);
    const cAutumnOakA = new THREE.Color(0xd27a34);
    const cAutumnOakB = new THREE.Color(0xc24d38);
    const cAutumnOakC = new THREE.Color(0xd9a13b);
    const cWinterOak = new THREE.Color(0x9ca5a4);
    const cStreamWarm = new THREE.Color(0x4b8f9c);
    const cStreamWinter = new THREE.Color(0x88b3c2);

    const applySeasonalPalette = (curDay: number, curWeather: WeatherType) => {
      const w = getSeasonWeights(curDay);
      const isSnow = curWeather === 'snow';
      const snowGroundBlend = Math.min(0.75, w.winter * 0.42 + (isSnow ? 0.38 : 0));

      // Update terrain vertex colors
      const tArr = terrainColorAttr.array as Float32Array;
      for (let i = 0; i < posAttr.count; i++) {
        const br = baseTerrainColors[i * 3];
        const bg = baseTerrainColors[i * 3 + 1];
        const bb = baseTerrainColors[i * 3 + 2];
        const tag = terrainZoneTags[i];

        // Start from base biome color
        _color.setRGB(br, bg, bb);

        // Spring vibrancy
        if (w.spring > 0.05) {
          _colorA.setRGB(br * 1.05, bg * 1.08, bb * 0.96);
          _color.lerp(_colorA, w.spring * 0.45);
        }
        // Summer lush richness
        if (w.summer > 0.05) {
          _colorA.setRGB(br * 0.9, bg * 1.02, bb * 0.85);
          _color.lerp(_colorA, w.summer * 0.45);
        }
        // Autumn warm ochre/russet
        if (w.autumn > 0.05 && tag !== 3) {
          _colorA.setHex(tag === 2 ? 0xa37846 : tag === 1 ? 0xb59c6a : 0xb29854);
          _color.lerp(_colorA, w.autumn * 0.62);
        }
        // Winter / snow ground frosting
        if (snowGroundBlend > 0.02 && tag !== 3) {
          _color.lerp(cSnowTint, snowGroundBlend * (tag === 4 ? 0.85 : 0.68));
        }

        tArr[i * 3] = _color.r;
        tArr[i * 3 + 1] = _color.g;
        tArr[i * 3 + 2] = _color.b;
      }
      terrainColorAttr.needsUpdate = true;

      // Update grass tufts
      for (let i = 0; i < grassCount; i++) {
        _color.copy(grassBaseColors[i]);
        if (w.spring > 0.05) {
          _colorA.copy(grassBaseColors[i]).offsetHSL(0.01, 0.08, 0.05);
          _color.lerp(_colorA, w.spring * 0.5);
        }
        if (w.autumn > 0.05) {
          _color.lerp(cAutumnGrass, w.autumn * 0.72);
        }
        if (snowGroundBlend > 0.02) {
          _color.lerp(cWinterGrass, Math.min(0.85, snowGroundBlend * 1.1));
        }
        grassInst.setColorAt(i, _color);
      }
      if (grassInst.instanceColor) grassInst.instanceColor.needsUpdate = true;

      // Update broadleaf & pine canopies
      seasonalTrees.forEach((node) => {
        if (node.role === 'broadleaf') {
          _color.copy(node.baseColor);
          if (w.spring > 0.2 && node.variant % 3 === 0) {
            _color.lerp(cSpringBlossom, w.spring * 0.65);
          }
          if (w.autumn > 0.05) {
            const autTarget =
              node.variant % 3 === 0
                ? cAutumnOakA
                : node.variant % 3 === 1
                  ? cAutumnOakB
                  : cAutumnOakC;
            _color.lerp(autTarget, w.autumn * 0.85);
          }
          if (w.winter > 0.05) {
            _color.lerp(cWinterOak, w.winter * 0.75);
          }
          if (isSnow) {
            _color.lerp(cSnowTint, 0.35);
          }
          node.material.color.copy(_color);
        } else {
          // Evergreen pine gets subtle snow frosting in winter/snow
          _color.copy(node.baseColor);
          if (snowGroundBlend > 0.05) {
            _color.lerp(cSnowTint, snowGroundBlend * 0.32);
          }
          node.material.color.copy(_color);
        }
      });

      // Stream tint
      streamMat.color.copy(cStreamWarm).lerp(cStreamWinter, Math.min(1, w.winter * 0.75 + (isSnow ? 0.25 : 0)));
    };

    applySeasonalPalette(dayOfYearRef.current, weatherRef.current);

    // Pre-warm shaders on GPU
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 13. Raycasting for Hover & Click (layer 1 only)
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointerNdc = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let hoveredTarget: { kind: 'plot' | 'wild'; id: string } | null = null;
    let lastMoveCheck = 0;

    const updateNdc = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastMoveCheck < 45) return;
      lastMoveCheck = now;

      updateNdc(e.clientX, e.clientY);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);

      if (hits.length > 0) {
        const { kind, id } = hits[0].object.userData as { kind: 'plot' | 'wild'; id: string };
        hoveredTarget = { kind, id };
        callbacksRef.current.onHoverTarget(hoveredTarget);
        renderer.domElement.style.cursor = 'pointer';
        if (kind === 'plot') {
          const p = plotsRef.current.find((item) => item.id === id);
          if (p) {
            const cropLabel = p.cropId
              ? `${CROP_MAP[p.cropId].nameKo} (${p.mature ? '[F] 꾹 눌러 수확' : `${Math.round(p.growthProgress * 100)}%`})`
              : p.soil === 'tilled'
                ? '갈아둔 밭'
                : '빈 밭 (갈기 필요)';
            callbacksRef.current.onHoverChange(`${p.index + 1}번 밭 · ${cropLabel}`);
          }
        } else {
          const w = wildRef.current.find((item) => item.id === id);
          if (w) {
            const c = CROP_MAP[w.cropId];
            callbacksRef.current.onHoverChange(
              !w.emerged
                ? `야생 ${c.nameKo} 자생지`
                : w.available
                  ? `야생 ${c.nameKo} · [F] 꾹 눌러 채집`
                  : `야생 ${c.nameKo} · ${Math.round(w.growthProgress * 100)}%`,
            );
          }
        }
      } else {
        if (hoveredTarget) {
          hoveredTarget = null;
          renderer.domElement.style.cursor = 'grab';
          callbacksRef.current.onHoverTarget(null);
          callbacksRef.current.onHoverChange(null);
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      const moved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (moved > 7) return; // Was a camera drag, not a click

      updateNdc(e.clientX, e.clientY);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0) {
        const { kind, id } = hits[0].object.userData as { kind: 'plot' | 'wild'; id: string };
        if (kind === 'plot') {
          callbacksRef.current.onPlotClick(id);
        } else {
          callbacksRef.current.onWildClick(id);
        }
      }
    };

    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    // 14. Resize Observer
    const handleResize = () => {
      if (!mountEl) return;
      const w = mountEl.clientWidth || window.innerWidth;
      const h = mountEl.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 15. Animation Loop with software-WebGL pacing & smooth damping
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const targetSky = new THREE.Color();
    const targetSunColor = new THREE.Color();
    const targetSunPos = new THREE.Vector3();
    const targetHemiSky = new THREE.Color();
    const targetHemiGround = new THREE.Color();
    const targetRimColor = new THREE.Color();

    const cSkyDawn = new THREE.Color(0xdcc2b2);
    const cSkyMorn = new THREE.Color(0xcce2d4);
    const cSkyNoon = new THREE.Color(0xc6e0ed);
    const cSkySunset = new THREE.Color(0xdca882);
    const cSkyNight = new THREE.Color(0x1f2d42);

    const cSunDawn = new THREE.Color(0xffcfa0);
    const cSunMorn = new THREE.Color(0xffe9c4);
    const cSunNoon = new THREE.Color(0xfff7e6);
    const cSunSunset = new THREE.Color(0xffa66b);
    const cMoonLight = new THREE.Color(0xa6c0eb);

    // Seasonal atmospheric color grading palettes (Sky tint, Sun tint, Hemi Sky, Hemi Ground, Rim Light)
    const cSeasonSkySpring = new THREE.Color(0xd7e8dc);
    const cSeasonSkySummer = new THREE.Color(0xbce0f4);
    const cSeasonSkyAutumn = new THREE.Color(0xe3c8a8);
    const cSeasonSkyWinter = new THREE.Color(0xc8d8e6);

    const cSeasonSunSpring = new THREE.Color(0xfff1d9);
    const cSeasonSunSummer = new THREE.Color(0xfff9e6);
    const cSeasonSunAutumn = new THREE.Color(0xffd299);
    const cSeasonSunWinter = new THREE.Color(0xe6f0ff);

    const cHemiSkySpring = new THREE.Color(0xd4ecf7);
    const cHemiSkySummer = new THREE.Color(0xbfe4fa);
    const cHemiSkyAutumn = new THREE.Color(0xe6d4be);
    const cHemiSkyWinter = new THREE.Color(0xc2d8ed);
    const cHemiSkyNight = new THREE.Color(0x3a5073);

    const cHemiGroundSpring = new THREE.Color(0x6e6f4a);
    const cHemiGroundSummer = new THREE.Color(0x55663d);
    const cHemiGroundAutumn = new THREE.Color(0x7c5a37);
    const cHemiGroundWinter = new THREE.Color(0x7d8c96);
    const cHemiGroundNight = new THREE.Color(0x232b2d);

    const cRimSpring = new THREE.Color(0xd2eee4);
    const cRimSummer = new THREE.Color(0xbce6ff);
    const cRimAutumn = new THREE.Color(0xf2c28d);
    const cRimWinter = new THREE.Color(0xc8e4ff);
    const cRimNight = new THREE.Color(0x6888bd);

    // Pre-allocated scratch colors for seasonal lighting & particle motes
    const cSeasonSkyBlend = new THREE.Color();
    const cSeasonSunBlend = new THREE.Color();
    const cSeasonHemiSkyBlend = new THREE.Color();
    const cSeasonHemiGroundBlend = new THREE.Color();
    const cSeasonRimBlend = new THREE.Color();
    const cMoteSpringA = new THREE.Color(0xf9cddb);
    const cMoteSpringB = new THREE.Color(0xfbf5e6);
    const cMoteSummerDay = new THREE.Color(0xf7eba8);
    const cMoteSummerNight = new THREE.Color(0xd8f576);
    const cMoteAutumnA = new THREE.Color(0xe07e3c);
    const cMoteAutumnB = new THREE.Color(0xdcb04b);
    const cMoteWinter = new THREE.Color(0xe6f4ff);
    const cMoteBlend = new THREE.Color();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();

      // A. Continuous 24h Sky, Sun/Moon Arc, Weather & 365-Day Seasonal Transitions
      const h = ((timeHoursRef.current % 24) + 24) % 24;
      const curDay = dayOfYearRef.current;
      const curWeather = weatherRef.current;
      const sWeights = getSeasonWeights(curDay);

      const seasonBucket = Math.floor(curDay / 2);
      const seasonKey = `${seasonBucket}:${curWeather === 'snow' ? 1 : 0}`;
      if (seasonKey !== lastUpdatedSeasonKey) {
        lastUpdatedSeasonKey = seasonKey;
        applySeasonalPalette(curDay, curWeather);
      }

      // Compute sky/sun keyframe blend across 24 hours
      let targetSunIntensity = 2.2;
      let targetHemiIntensity = 0.85;
      let targetRimIntensity = 0.55;
      let targetFogDensity = 0.015;
      let nightFactor = 0;

      if (h < 5) {
        // Deep night -> predawn
        const t = Math.max(0, (h - 4) / 1);
        targetSky.copy(cSkyNight).lerp(cSkyDawn, t * 0.35);
        targetSunColor.copy(cMoonLight);
        targetSunPos.set(-10, 18, 12);
        targetSunIntensity = 0.72;
        targetHemiIntensity = 0.5;
        targetRimIntensity = 0.42;
        targetFogDensity = 0.0185;
        nightFactor = 1 - t * 0.3;
      } else if (h < 7.5) {
        const t = (h - 5) / 2.5;
        targetSky.copy(cSkyDawn).lerp(cSkyMorn, t);
        targetSunColor.copy(cSunDawn).lerp(cSunMorn, t);
        targetSunPos.set(22 - t * 4, 6 + t * 10, 14);
        targetSunIntensity = THREE.MathUtils.lerp(1.25, 2.05, t);
        targetHemiIntensity = THREE.MathUtils.lerp(0.65, 0.85, t);
        targetRimIntensity = THREE.MathUtils.lerp(0.45, 0.58, t);
        nightFactor = Math.max(0, 1 - t * 1.4);
      } else if (h < 12) {
        const t = (h - 7.5) / 4.5;
        targetSky.copy(cSkyMorn).lerp(cSkyNoon, t);
        targetSunColor.copy(cSunMorn).lerp(cSunNoon, t);
        targetSunPos.set(18 - t * 12, 16 + t * 10, 14 - t * 4);
        targetSunIntensity = THREE.MathUtils.lerp(2.05, 2.3, t);
        targetHemiIntensity = 0.9;
        targetRimIntensity = 0.58;
      } else if (h < 16.5) {
        const t = (h - 12) / 4.5;
        targetSky.copy(cSkyNoon).lerp(cSkySunset, t * 0.25);
        targetSunColor.copy(cSunNoon).lerp(cSunSunset, t * 0.25);
        targetSunPos.set(6 - t * 16, 26 - t * 9, 10 + t * 3);
        targetSunIntensity = THREE.MathUtils.lerp(2.3, 2.0, t);
        targetHemiIntensity = 0.86;
        targetRimIntensity = 0.56;
      } else if (h < 19.5) {
        const t = (h - 16.5) / 3.0;
        targetSky.copy(cSkySunset).lerp(cSkyNight, Math.pow(t, 1.8) * 0.78);
        targetSunColor.copy(cSunSunset).lerp(cMoonLight, Math.pow(t, 2.0) * 0.65);
        targetSunPos.set(-10 - t * 10, 17 - t * 11, 13);
        targetSunIntensity = THREE.MathUtils.lerp(1.9, 0.85, t);
        targetHemiIntensity = THREE.MathUtils.lerp(0.82, 0.56, t);
        targetRimIntensity = THREE.MathUtils.lerp(0.62, 0.45, t);
        nightFactor = Math.min(1, t * 1.15);
      } else {
        // Evening -> night
        const t = Math.min(1, (h - 19.5) / 1.5);
        targetSky.copy(cSkySunset).lerp(cSkyNight, 0.78 + t * 0.22);
        targetSunColor.copy(cMoonLight);
        targetSunPos.set(-10, 18, 12);
        targetSunIntensity = 0.72;
        targetHemiIntensity = 0.5;
        targetRimIntensity = 0.42;
        targetFogDensity = 0.0185;
        nightFactor = 1;
      }

      // Seasonal color-temperature, sun arc, hemisphere bounce & fog mood blending
      cSeasonSkyBlend.setRGB(
        cSeasonSkySpring.r * sWeights.spring +
          cSeasonSkySummer.r * sWeights.summer +
          cSeasonSkyAutumn.r * sWeights.autumn +
          cSeasonSkyWinter.r * sWeights.winter,
        cSeasonSkySpring.g * sWeights.spring +
          cSeasonSkySummer.g * sWeights.summer +
          cSeasonSkyAutumn.g * sWeights.autumn +
          cSeasonSkyWinter.g * sWeights.winter,
        cSeasonSkySpring.b * sWeights.spring +
          cSeasonSkySummer.b * sWeights.summer +
          cSeasonSkyAutumn.b * sWeights.autumn +
          cSeasonSkyWinter.b * sWeights.winter,
      );
      cSeasonSunBlend.setRGB(
        cSeasonSunSpring.r * sWeights.spring +
          cSeasonSunSummer.r * sWeights.summer +
          cSeasonSunAutumn.r * sWeights.autumn +
          cSeasonSunWinter.r * sWeights.winter,
        cSeasonSunSpring.g * sWeights.spring +
          cSeasonSunSummer.g * sWeights.summer +
          cSeasonSunAutumn.g * sWeights.autumn +
          cSeasonSunWinter.g * sWeights.winter,
        cSeasonSunSpring.b * sWeights.spring +
          cSeasonSunSummer.b * sWeights.summer +
          cSeasonSunAutumn.b * sWeights.autumn +
          cSeasonSunWinter.b * sWeights.winter,
      );
      cSeasonHemiSkyBlend.setRGB(
        cHemiSkySpring.r * sWeights.spring +
          cHemiSkySummer.r * sWeights.summer +
          cHemiSkyAutumn.r * sWeights.autumn +
          cHemiSkyWinter.r * sWeights.winter,
        cHemiSkySpring.g * sWeights.spring +
          cHemiSkySummer.g * sWeights.summer +
          cHemiSkyAutumn.g * sWeights.autumn +
          cHemiSkyWinter.g * sWeights.winter,
        cHemiSkySpring.b * sWeights.spring +
          cHemiSkySummer.b * sWeights.summer +
          cHemiSkyAutumn.b * sWeights.autumn +
          cHemiSkyWinter.b * sWeights.winter,
      );
      cSeasonHemiGroundBlend.setRGB(
        cHemiGroundSpring.r * sWeights.spring +
          cHemiGroundSummer.r * sWeights.summer +
          cHemiGroundAutumn.r * sWeights.autumn +
          cHemiGroundWinter.r * sWeights.winter,
        cHemiGroundSpring.g * sWeights.spring +
          cHemiGroundSummer.g * sWeights.summer +
          cHemiGroundAutumn.g * sWeights.autumn +
          cHemiGroundWinter.g * sWeights.winter,
        cHemiGroundSpring.b * sWeights.spring +
          cHemiGroundSummer.b * sWeights.summer +
          cHemiGroundAutumn.b * sWeights.autumn +
          cHemiGroundWinter.b * sWeights.winter,
      );
      cSeasonRimBlend.setRGB(
        cRimSpring.r * sWeights.spring +
          cRimSummer.r * sWeights.summer +
          cRimAutumn.r * sWeights.autumn +
          cRimWinter.r * sWeights.winter,
        cRimSpring.g * sWeights.spring +
          cRimSummer.g * sWeights.summer +
          cRimAutumn.g * sWeights.autumn +
          cRimWinter.g * sWeights.winter,
        cRimSpring.b * sWeights.spring +
          cRimSummer.b * sWeights.summer +
          cRimAutumn.b * sWeights.autumn +
          cRimWinter.b * sWeights.winter,
      );

      const dayWeight = 1 - nightFactor * 0.72;
      const seasonalSkyInfluence = (0.34 + sWeights.autumn * 0.14 + sWeights.winter * 0.12) * dayWeight;
      targetSky.lerp(cSeasonSkyBlend, seasonalSkyInfluence);
      targetSunColor.lerp(cSeasonSunBlend, 0.48 * (1 - nightFactor * 0.8));

      // Adjust solar elevation & warm/cool lighting strength per season
      const sunElevationOffset =
        sWeights.spring * 0.4 +
        sWeights.summer * 3.2 -
        sWeights.autumn * 1.8 -
        sWeights.winter * 4.2;
      targetSunPos.y = Math.max(5.5, targetSunPos.y + sunElevationOffset * (1 - nightFactor));

      const seasonSunIntensityMul =
        sWeights.spring * 1.0 +
        sWeights.summer * 1.12 +
        sWeights.autumn * 0.96 +
        sWeights.winter * 0.86;
      const seasonHemiIntensityMul =
        sWeights.spring * 1.04 +
        sWeights.summer * 1.02 +
        sWeights.autumn * 0.94 +
        sWeights.winter * 1.08;
      const seasonFogMul =
        sWeights.spring * 1.04 +
        sWeights.summer * 0.86 +
        sWeights.autumn * 1.15 +
        sWeights.winter * 1.22;

      targetSunIntensity *= THREE.MathUtils.lerp(seasonSunIntensityMul, 1.0, nightFactor);
      targetHemiIntensity *= THREE.MathUtils.lerp(seasonHemiIntensityMul, 1.0, nightFactor);
      targetFogDensity *= seasonFogMul;
      targetRimIntensity += sWeights.autumn * 0.08 + sWeights.winter * 0.1;

      targetHemiSky.copy(cSeasonHemiSkyBlend).lerp(cHemiSkyNight, nightFactor * 0.85);
      targetHemiGround.copy(cSeasonHemiGroundBlend).lerp(cHemiGroundNight, nightFactor * 0.85);
      targetRimColor.copy(cSeasonRimBlend).lerp(cRimNight, nightFactor * 0.82);

      let targetExposure =
        1.05 +
        sWeights.spring * 0.03 +
        sWeights.summer * 0.07 +
        sWeights.autumn * 0.02 -
        sWeights.winter * 0.02 -
        nightFactor * 0.14;
      let targetEnvIntensity =
        0.92 + sWeights.summer * 0.12 + sWeights.winter * 0.08 - nightFactor * 0.42;

      // Weather atmosphere modulation
      if (curWeather === 'cloudy') {
        _color.setHex(0x9eabae);
        targetSky.lerp(_color, 0.56 * (1 - nightFactor * 0.5));
        targetSunColor.lerp(_color, 0.42);
        targetHemiSky.lerp(_color, 0.38);
        targetRimColor.lerp(_color, 0.4);
        targetSunIntensity *= 0.58;
        targetHemiIntensity *= 1.06;
        targetFogDensity = Math.max(targetFogDensity, 0.021);
        targetExposure -= 0.04;
      } else if (curWeather === 'rain') {
        _color.setHex(0x6c7f88);
        targetSky.lerp(_color, 0.7 * (1 - nightFactor * 0.4));
        targetSunColor.lerp(_color, 0.6);
        targetHemiSky.lerp(_color, 0.55);
        targetRimColor.lerp(_color, 0.5);
        targetSunIntensity *= 0.42;
        targetHemiIntensity *= 0.9;
        targetFogDensity = Math.max(targetFogDensity, 0.026);
        targetExposure -= 0.08;
        targetEnvIntensity *= 0.85;
      } else if (curWeather === 'snow') {
        _color.setHex(0xd6e2ea);
        targetSky.lerp(_color, 0.65 * (1 - nightFactor * 0.55));
        targetSunColor.lerp(_color, 0.45);
        targetHemiSky.lerp(_color, 0.5);
        targetHemiGround.lerp(cSnowTint, 0.45 * (1 - nightFactor * 0.65));
        targetRimColor.lerp(cSnowTint, 0.5);
        targetSunIntensity *= 0.72;
        targetHemiIntensity *= 1.12;
        targetFogDensity = Math.max(targetFogDensity, 0.0235);
        targetEnvIntensity *= 1.08;
      }

      const envLambda = 2.8;
      const envAlpha = 1 - Math.exp(-envLambda * dt);
      (scene.background as THREE.Color).lerp(targetSky, envAlpha);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(scene.background as THREE.Color);
        scene.fog.density = THREE.MathUtils.damp(scene.fog.density, targetFogDensity, envLambda, dt);
      }
      sunLight.color.lerp(targetSunColor, envAlpha);
      sunLight.position.lerp(targetSunPos, envAlpha);
      sunLight.intensity = THREE.MathUtils.damp(sunLight.intensity, targetSunIntensity, envLambda, dt);
      hemiLight.color.lerp(targetHemiSky, envAlpha);
      hemiLight.groundColor.lerp(targetHemiGround, envAlpha);
      hemiLight.intensity = THREE.MathUtils.damp(hemiLight.intensity, targetHemiIntensity, envLambda, dt);
      rimLight.color.lerp(targetRimColor, envAlpha);
      rimLight.intensity = THREE.MathUtils.damp(rimLight.intensity, targetRimIntensity, envLambda, dt);
      renderer.toneMappingExposure = THREE.MathUtils.damp(
        renderer.toneMappingExposure,
        targetExposure,
        envLambda,
        dt,
      );
      scene.environmentIntensity = THREE.MathUtils.damp(
        scene.environmentIntensity,
        targetEnvIntensity,
        envLambda,
        dt,
      );

      // Update Seasonal Atmospheric Motes
      const moteOpacityTarget =
        curWeather === 'rain' ? 0.08 : curWeather === 'snow' ? 0.25 : 0.45 + sWeights.spring * 0.2 + sWeights.autumn * 0.2;
      moteMat.opacity = THREE.MathUtils.damp(moteMat.opacity, moteOpacityTarget, 3, dt);
      moteMat.size = THREE.MathUtils.damp(
        moteMat.size,
        0.18 + sWeights.autumn * 0.1 + sWeights.spring * 0.06 + sWeights.summer * nightFactor * 0.08,
        3,
        dt,
      );
      const mPosArr = moteGeo.attributes.position.array as Float32Array;
      const mColArr = moteColorAttr.array as Float32Array;
      const moteFallRate =
        (sWeights.autumn * 0.95 + sWeights.spring * 0.42 + sWeights.winter * 0.22 - sWeights.summer * 0.08) *
        dt;
      const windX = (0.45 + sWeights.autumn * 0.55 + sWeights.spring * 0.25) * dt;
      for (let i = 0; i < moteCount; i++) {
        const seed = moteSeeds[i];
        let mx = mPosArr[i * 3] + windX + Math.sin(elapsed * 0.75 + seed) * 0.35 * dt;
        let my = mPosArr[i * 3 + 1] - moteFallRate + Math.cos(elapsed * 1.1 + seed) * 0.22 * dt;
        let mz = mPosArr[i * 3 + 2] + Math.cos(elapsed * 0.65 + seed) * 0.3 * dt;
        if (my < 0.35) {
          my = 9.5 + (seed % 1.5);
          mx = (Math.random() - 0.5) * 44;
          mz = (Math.random() - 0.5) * 44;
        } else if (my > 11) {
          my = 0.8 + (seed % 2);
        }
        if (mx > 22) mx -= 44;
        if (mx < -22) mx += 44;
        mPosArr[i * 3] = mx;
        mPosArr[i * 3 + 1] = my;
        mPosArr[i * 3 + 2] = mz;

        const alt = i % 2 === 0;
        _colorA.copy(alt ? cMoteSpringA : cMoteSpringB);
        _colorB.copy(cMoteSummerDay).lerp(cMoteSummerNight, nightFactor);
        cMoteBlend.setRGB(
          _colorA.r * sWeights.spring +
            _colorB.r * sWeights.summer +
            (alt ? cMoteAutumnA : cMoteAutumnB).r * sWeights.autumn +
            cMoteWinter.r * sWeights.winter,
          _colorA.g * sWeights.spring +
            _colorB.g * sWeights.summer +
            (alt ? cMoteAutumnA : cMoteAutumnB).g * sWeights.autumn +
            cMoteWinter.g * sWeights.winter,
          _colorA.b * sWeights.spring +
            _colorB.b * sWeights.summer +
            (alt ? cMoteAutumnA : cMoteAutumnB).b * sWeights.autumn +
            cMoteWinter.b * sWeights.winter,
        );
        mColArr[i * 3] = cMoteBlend.r;
        mColArr[i * 3 + 1] = cMoteBlend.g;
        mColArr[i * 3 + 2] = cMoteBlend.b;
      }
      moteGeo.attributes.position.needsUpdate = true;
      moteColorAttr.needsUpdate = true;

      // Warm farmhouse window & lantern glow at sunset/night
      if (windowPaperMat) {
        windowPaperMat.emissiveIntensity = THREE.MathUtils.damp(
          windowPaperMat.emissiveIntensity,
          0.06 + nightFactor * 1.15,
          4,
          dt,
        );
      }
      if (lanternGlowMat) {
        lanternGlowMat.emissiveIntensity = THREE.MathUtils.damp(
          lanternGlowMat.emissiveIntensity,
          0.35 + nightFactor * 1.4,
          4,
          dt,
        );
      }

      // Rain animation
      rainLines.visible = curWeather === 'rain';
      if (rainLines.visible) {
        const posArr = rainGeo.attributes.position.array as Float32Array;
        const fallSpeed = 16.5 * dt;
        const windShift = -2.2 * dt;
        for (let i = 0; i < rainCount; i++) {
          let ry = rainOffsets[i * 3 + 1] - fallSpeed;
          let rx = rainOffsets[i * 3] + windShift;
          if (ry < 0) {
            ry += 17;
            rx = (Math.random() - 0.5) * 48;
          }
          rainOffsets[i * 3] = rx;
          rainOffsets[i * 3 + 1] = ry;
          const rz = rainOffsets[i * 3 + 2];
          posArr[i * 6] = rx;
          posArr[i * 6 + 1] = ry;
          posArr[i * 6 + 2] = rz;
          posArr[i * 6 + 3] = rx - 0.08;
          posArr[i * 6 + 4] = ry - 0.62;
          posArr[i * 6 + 5] = rz + 0.04;
        }
        rainGeo.attributes.position.needsUpdate = true;
      }

      // Snow animation
      snowPoints.visible = curWeather === 'snow';
      if (snowPoints.visible) {
        const sArr = snowGeo.attributes.position.array as Float32Array;
        const fallSpeed = 2.65 * dt;
        for (let i = 0; i < snowCount; i++) {
          let sy = sArr[i * 3 + 1] - fallSpeed;
          const seed = snowSeeds[i];
          let sx = sArr[i * 3] + Math.sin(elapsed * 1.2 + seed) * 0.7 * dt;
          let sz = sArr[i * 3 + 2] + Math.cos(elapsed * 0.9 + seed) * 0.5 * dt;
          if (sy < 0) {
            sy += 18;
            sx = (Math.random() - 0.5) * 52;
            sz = (Math.random() - 0.5) * 52;
          }
          sArr[i * 3] = sx;
          sArr[i * 3 + 1] = sy;
          sArr[i * 3 + 2] = sz;
        }
        snowGeo.attributes.position.needsUpdate = true;
      }

      // B. Free Camera WASD / Arrow Key Roaming + Smooth Preset Flight Damping
      if (!freeCamPausedRef.current) {
        const moveFwd =
          (camKeys.KeyW || camKeys.ArrowUp ? 1 : 0) -
          (camKeys.KeyS || camKeys.ArrowDown ? 1 : 0);
        const moveRight =
          (camKeys.KeyD || camKeys.ArrowRight ? 1 : 0) -
          (camKeys.KeyA || camKeys.ArrowLeft ? 1 : 0);

        if (moveFwd !== 0 || moveRight !== 0) {
          camera.getWorldDirection(_camFwd);
          _camFwd.y = 0;
          if (_camFwd.lengthSq() > 1e-4) _camFwd.normalize();
          _camRight.set(-_camFwd.z, 0, _camFwd.x);

          const panDist = 14.5 * dt;
          _v1.set(0, 0, 0);
          _v1.addScaledVector(_camFwd, moveFwd * panDist);
          _v1.addScaledVector(_camRight, moveRight * panDist);

          const nextTx = THREE.MathUtils.clamp(controls.target.x + _v1.x, -30, 30);
          const nextTz = THREE.MathUtils.clamp(controls.target.z + _v1.z, -30, 30);
          const dx = nextTx - controls.target.x;
          const dz = nextTz - controls.target.z;
          const nextTy = groundHeightAt(nextTx, nextTz) + 0.4;

          controls.target.set(nextTx, THREE.MathUtils.damp(controls.target.y, nextTy, 8, dt), nextTz);
          camera.position.x += dx;
          camera.position.z += dz;
        }
      }

      if (cameraFlightRef.current.active) {
        const camAlpha = 1 - Math.exp(-5.0 * dt);
        camera.position.lerp(cameraFlightRef.current.pos, camAlpha);
        controls.target.lerp(cameraFlightRef.current.target, camAlpha);
        if (
          camera.position.distanceTo(cameraFlightRef.current.pos) < 0.08 &&
          controls.target.distanceTo(cameraFlightRef.current.target) < 0.08
        ) {
          cameraFlightRef.current.active = false;
        }
      }

      controls.update();

      // Prevent camera from dipping below undulating terrain
      const minCamY = groundHeightAt(camera.position.x, camera.position.z) + 0.75;
      if (camera.position.y < minCamY) {
        camera.position.y = minCamY;
      }

      // C. Sync Plot States & Crop Meshes
      plotsRef.current.forEach((p) => {
        const node = plotNodes.get(p.id);
        if (!node) return;

        if (p.soil === 'fallow') {
          if (node.soilMat.map !== textures.meadowMap) {
            node.soilMat.map = textures.meadowMap;
            node.soilMat.needsUpdate = true;
          }
          node.soilMat.color.setHex(curWeather === 'snow' ? 0xc2c6bd : 0x9a8c6c);
          node.soilMat.roughness = 0.94;
        } else if (p.watered) {
          if (node.soilMat.map !== textures.tilledWetMap) {
            node.soilMat.map = textures.tilledWetMap;
            node.soilMat.needsUpdate = true;
          }
          node.soilMat.color.setHex(0xffffff);
          node.soilMat.roughness = 0.58;
        } else {
          if (node.soilMat.map !== textures.tilledDryMap) {
            node.soilMat.map = textures.tilledDryMap;
            node.soilMat.needsUpdate = true;
          }
          node.soilMat.color.setHex(0xffffff);
          node.soilMat.roughness = 0.88;
        }

        const isHovered = hoveredTarget?.kind === 'plot' && hoveredTarget.id === p.id;
        const isSelected =
          focusedTargetRef.current?.kind === 'plot' && focusedTargetRef.current.id === p.id;
        const ringMat = node.highlightRing.material as THREE.MeshBasicMaterial;
        const targetOpacity = isSelected ? 0.78 : isHovered ? 0.55 : p.mature ? 0.35 : 0;
        ringMat.opacity = THREE.MathUtils.damp(ringMat.opacity, targetOpacity, 10, dt);
        if (p.mature && !isHovered && !isSelected) {
          ringMat.color.setHex(0xe8c458);
        } else {
          ringMat.color.setHex(0xf4f0d8);
        }

        const stage = p.cropId ? getStageFromProgress(p.growthProgress, p.mature) : -1;
        const nextKey = p.cropId ? `${p.cropId}:${stage}` : 'empty';
        if (node.renderedKey !== nextKey) {
          node.renderedKey = nextKey;
          while (node.cropHolder.children.length > 0) {
            const child = node.cropHolder.children[0];
            node.cropHolder.remove(child);
          }
          if (p.cropId && stage >= 0) {
            const visual = createCropVisual(p.cropId, stage as 0 | 1 | 2 | 3, false);
            visual.scale.setScalar(0.1);
            node.cropHolder.add(visual);
          }
        }

        if (node.cropHolder.children.length > 0) {
          const plantObj = node.cropHolder.children[0];
          const s = THREE.MathUtils.damp(plantObj.scale.x, 1, 9, dt);
          plantObj.scale.setScalar(s);
          plantObj.rotation.z = Math.sin(elapsed * 1.6 + p.index) * 0.025;
        }
      });

      // D. Sync Wild Habitat Specimens
      wildRef.current.forEach((w, idx) => {
        const node = wildNodes.get(w.id);
        if (!node) return;
        node.available = w.available;

        const rMat = node.ringMesh.material as THREE.MeshBasicMaterial;
        const isHovered = hoveredTarget?.kind === 'wild' && hoveredTarget.id === w.id;
        const isSelected =
          focusedTargetRef.current?.kind === 'wild' && focusedTargetRef.current.id === w.id;

        if (!w.emerged) {
          node.cropHolder.visible = false;
          node.markerMesh.visible = false;
          rMat.opacity = isSelected ? 0.62 : isHovered ? 0.45 : 0.14;
          return;
        }

        const wStage = getStageFromProgress(w.growthProgress, w.available);
        if (node.renderedStage !== wStage) {
          node.renderedStage = wStage;
          while (node.cropHolder.children.length > 0) {
            node.cropHolder.remove(node.cropHolder.children[0]);
          }
          const visual = createCropVisual(w.cropId, wStage, true);
          visual.scale.setScalar(0.15);
          node.cropHolder.add(visual);
        }

        if (node.cropHolder.children.length > 0) {
          const plantObj = node.cropHolder.children[0];
          const s = THREE.MathUtils.damp(plantObj.scale.x, 1, 8, dt);
          plantObj.scale.setScalar(s);
          plantObj.rotation.z = Math.sin(elapsed * 1.4 + idx * 0.7) * 0.028;
        }

        node.cropHolder.visible = true;
        node.markerMesh.visible = w.available;
        rMat.opacity = isSelected ? 0.9 : isHovered ? 0.75 : w.available ? 0.48 : 0.2;

        if (w.available) {
          node.markerMesh.position.y = 1.32 + Math.sin(elapsed * 2.4 + idx) * 0.08;
          node.markerMesh.rotation.y = elapsed * 1.1;
        }
      });

      // E. Trigger & Update Particle Bursts
      if (pendingBurstRef.current) {
        spawnBurst(pendingBurstRef.current.position, pendingBurstRef.current.colorHex);
        pendingBurstRef.current = null;
      }

      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const bp = burstParticles[i];
        bp.life += dt;
        if (bp.life >= bp.maxLife) {
          scene.remove(bp.mesh);
          (bp.mesh.material as THREE.Material).dispose();
          burstParticles.splice(i, 1);
          continue;
        }
        bp.velocity.y -= 6.5 * dt;
        _v2.copy(bp.velocity).multiplyScalar(dt);
        bp.mesh.position.add(_v2);
        const s = 1 - bp.life / bp.maxLife;
        bp.mesh.scale.setScalar(Math.max(0.01, s));
      }

      // F. Gentle water shimmer
      streamMat.opacity = 0.78 + Math.sin(elapsed * 1.5) * 0.05;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('keydown', onCamKeyDown);
      window.removeEventListener('keyup', onCamKeyUp);
      window.removeEventListener('blur', onCamBlur);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      controls.dispose();
      rainGeo.dispose();
      rainMat.dispose();
      snowGeo.dispose();
      snowMat.dispose();
      snowTexture.dispose();
      moteGeo.dispose();
      moteMat.dispose();
      moteTexture.dispose();
      textures.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mountEl) {
        mountEl.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden" />;
};
