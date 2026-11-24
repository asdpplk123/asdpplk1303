import * as THREE from 'three';
import { CROP_MAP } from '../data/reliefCrops';
import { CropId } from '../types/botany';
import { ProceduralTextureSet } from './proceduralTextures';

function addContactShadow(
  parent: THREE.Group,
  radiusX: number,
  radiusZ: number,
  textures: ProceduralTextureSet,
) {
  const geo = new THREE.PlaneGeometry(radiusX * 2, radiusZ * 2);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: textures.contactShadowMap,
    transparent: true,
    depthWrite: false,
    opacity: 0.45,
  });
  const shadow = new THREE.Mesh(geo, mat);
  shadow.position.y = 0.02;
  parent.add(shadow);
}

/**
 * Composite 10-part Korean-inspired timber & stone farmhouse/granary
 * Grounded at bottom-center (y = 0).
 */
export function createFarmhouse(textures: ProceduralTextureSet): THREE.Group {
  const group = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({
    map: textures.stoneMap,
    roughness: 0.9,
    metalness: 0.05,
  });
  const plasterMat = new THREE.MeshStandardMaterial({
    map: textures.plasterMap,
    roughness: 0.88,
    metalness: 0.02,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    map: textures.woodMap,
    roughness: 0.62,
    metalness: 0.04,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    map: textures.roofTileMap,
    roughness: 0.48,
    metalness: 0.12,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xc99c4a,
    roughness: 0.25,
    metalness: 0.85,
  });
  const lanternGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffdf99,
    emissive: 0xffb347,
    emissiveIntensity: 0.85,
    roughness: 0.35,
  });

  addContactShadow(group, 3.6, 2.8, textures);

  // 1. Stone foundation plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.4, 3.4), stoneMat);
  plinth.position.y = 0.2;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  group.add(plinth);

  // 2. Main earthen plaster walls
  const walls = new THREE.Mesh(new THREE.BoxGeometry(4.1, 2.1, 2.9), plasterMat);
  walls.position.y = 1.45;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  // 3. Wooden corner pillars (4 posts)
  const postGeo = new THREE.BoxGeometry(0.18, 2.18, 0.18);
  const corners: [number, number][] = [
    [-2.02, -1.42],
    [2.02, -1.42],
    [-2.02, 1.42],
    [2.02, 1.42],
  ];
  corners.forEach(([cx, cz]) => {
    const post = new THREE.Mesh(postGeo, woodMat);
    post.position.set(cx, 1.48, cz);
    post.castShadow = true;
    group.add(post);
  });

  // 4. Front wooden veranda deck (Maru)
  const veranda = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.14, 0.72), woodMat);
  veranda.position.set(0, 0.46, 1.78);
  veranda.castShadow = true;
  veranda.receiveShadow = true;
  group.add(veranda);

  // 5. Double paneled wooden doors
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.18, 1.68, 0.1), woodMat);
  doorFrame.position.set(-0.6, 1.32, 1.45);
  group.add(doorFrame);

  const handleGeo = new THREE.TorusGeometry(0.06, 0.015, 8, 16);
  [-0.78, -0.42].forEach((hx) => {
    const handle = new THREE.Mesh(handleGeo, brassMat);
    handle.position.set(hx, 1.25, 1.52);
    group.add(handle);
  });

  // 6. Traditional Changhoji lattice window
  const winFrame = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.85, 0.08), woodMat);
  winFrame.position.set(0.95, 1.55, 1.46);
  group.add(winFrame);

  const winPaperMat = new THREE.MeshStandardMaterial({
    color: 0xf6eedb,
    emissive: 0xffb95c,
    emissiveIntensity: 0.05,
    roughness: 0.75,
  });
  const winPaper = new THREE.Mesh(
    new THREE.BoxGeometry(0.88, 0.68, 0.09),
    winPaperMat,
  );
  winPaper.userData.seasonalRole = 'windowPaper';
  winPaper.position.set(0.95, 1.55, 1.47);
  group.add(winPaper);

  // 7. Gable roof left & right slopes (Extrude/angled slabs)
  const roofPanelGeo = new THREE.BoxGeometry(5.3, 0.14, 2.35);
  const frontRoof = new THREE.Mesh(roofPanelGeo, roofMat);
  frontRoof.position.set(0, 2.95, 0.92);
  frontRoof.rotation.x = 0.46;
  frontRoof.castShadow = true;
  frontRoof.receiveShadow = true;
  group.add(frontRoof);

  const backRoof = new THREE.Mesh(roofPanelGeo, roofMat);
  backRoof.position.set(0, 2.95, -0.92);
  backRoof.rotation.x = -0.46;
  backRoof.castShadow = true;
  backRoof.receiveShadow = true;
  group.add(backRoof);

  // 8. Gable triangular end caps
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-1.5, 0);
  gableShape.lineTo(1.5, 0);
  gableShape.lineTo(0, 0.98);
  gableShape.closePath();
  const gableGeo = new THREE.ExtrudeGeometry(gableShape, { depth: 4.12, bevelEnabled: false });
  gableGeo.rotateY(Math.PI / 2);
  gableGeo.translate(-2.06, 2.48, 0);
  const gableMesh = new THREE.Mesh(gableGeo, plasterMat);
  gableMesh.castShadow = true;
  group.add(gableMesh);

  // 9. Ridge beam cap
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(5.45, 0.22, 0.28), roofMat);
  ridge.position.set(0, 3.46, 0);
  ridge.castShadow = true;
  group.add(ridge);

  // 10. Hanging porch lantern
  const lanternMount = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.35), woodMat);
  lanternMount.position.set(-1.35, 2.35, 1.62);
  group.add(lanternMount);
  const lanternBody = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.24, 8), lanternGlowMat);
  lanternBody.userData.seasonalRole = 'lanternGlow';
  lanternBody.position.set(-1.35, 2.15, 1.75);
  group.add(lanternBody);

  return group;
}

/**
 * Composite 7-part Stone Well & Timber Canopy
 */
export function createWell(textures: ProceduralTextureSet): THREE.Group {
  const group = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({
    map: textures.stoneMap,
    roughness: 0.9,
    metalness: 0.04,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    map: textures.woodMap,
    roughness: 0.65,
    metalness: 0.04,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    map: textures.roofTileMap,
    roughness: 0.5,
    metalness: 0.1,
  });
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x2d6d7a,
    roughness: 0.12,
    metalness: 0.15,
  });

  addContactShadow(group, 1.25, 1.25, textures);

  // 1. Stone curb ring (LatheGeometry)
  const pts = [
    new THREE.Vector2(0.54, 0),
    new THREE.Vector2(0.76, 0),
    new THREE.Vector2(0.74, 0.72),
    new THREE.Vector2(0.8, 0.78),
    new THREE.Vector2(0.55, 0.78),
    new THREE.Vector2(0.55, 0.1),
  ];
  const curbGeo = new THREE.LatheGeometry(pts, 18);
  const curb = new THREE.Mesh(curbGeo, stoneMat);
  curb.castShadow = true;
  curb.receiveShadow = true;
  group.add(curb);

  // 2. Water surface inside well
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.54, 18), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.42;
  group.add(water);

  // 3. Twin wooden support posts
  const postGeo = new THREE.CylinderGeometry(0.06, 0.07, 1.55, 8);
  [-0.62, 0.62].forEach((px) => {
    const post = new THREE.Mesh(postGeo, woodMat);
    post.position.set(px, 1.48, 0);
    post.castShadow = true;
    group.add(post);
  });

  // 4. Windlass axle + crank
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.28, 10), woodMat);
  axle.rotation.z = Math.PI / 2;
  axle.position.set(0, 1.62, 0);
  group.add(axle);

  // 5. Suspended wooden bucket
  const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.28, 10), woodMat);
  bucket.position.set(0, 1.08, 0);
  group.add(bucket);

  // 6. Pitched canopy roof
  const roofGeo = new THREE.BoxGeometry(1.75, 0.08, 0.85);
  const r1 = new THREE.Mesh(roofGeo, roofMat);
  r1.position.set(0, 2.38, 0.34);
  r1.rotation.x = 0.52;
  r1.castShadow = true;
  group.add(r1);

  const r2 = new THREE.Mesh(roofGeo, roofMat);
  r2.position.set(0, 2.38, -0.34);
  r2.rotation.x = -0.52;
  r2.castShadow = true;
  group.add(r2);

  return group;
}

/**
 * Composite 6-part Wooden Wheelbarrow
 */
export function createWheelbarrow(textures: ProceduralTextureSet): THREE.Group {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({
    map: textures.woodMap,
    roughness: 0.72,
    metalness: 0.04,
  });
  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x3b3f44,
    roughness: 0.35,
    metalness: 0.82,
  });

  addContactShadow(group, 0.9, 0.65, textures);

  // 1. Iron wheel rim
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 8, 20), ironMat);
  wheel.position.set(0.68, 0.28, 0);
  wheel.castShadow = true;
  group.add(wheel);

  // 2. Wooden hub
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 10), woodMat);
  hub.rotation.x = Math.PI / 2;
  hub.position.set(0.68, 0.28, 0);
  group.add(hub);

  // 3. Twin frame rails + handles
  const railGeo = new THREE.BoxGeometry(1.45, 0.06, 0.06);
  [-0.26, 0.26].forEach((rz) => {
    const rail = new THREE.Mesh(railGeo, woodMat);
    rail.position.set(0.05, 0.42, rz);
    rail.rotation.z = -0.14;
    rail.castShadow = true;
    group.add(rail);
  });

  // 4. Tray bed
  const tray = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.24, 0.56), woodMat);
  tray.position.set(0.15, 0.54, 0);
  tray.rotation.z = -0.12;
  tray.castShadow = true;
  group.add(tray);

  // 5. Rear support legs
  const legGeo = new THREE.BoxGeometry(0.06, 0.36, 0.06);
  [-0.24, 0.24].forEach((lz) => {
    const leg = new THREE.Mesh(legGeo, woodMat);
    leg.position.set(-0.36, 0.18, lz);
    leg.castShadow = true;
    group.add(leg);
  });

  return group;
}

/**
 * Composite 5-part Korean Red Pine Tree (소나무)
 */
export function createPineTree(seed = 1): THREE.Group {
  const group = new THREE.Group();
  const barkMat = new THREE.MeshStandardMaterial({
    color: 0x6f4b36,
    roughness: 0.92,
    metalness: 0.02,
  });
  const needleMat = new THREE.MeshStandardMaterial({
    color: seed % 2 === 0 ? 0x2f5a38 : 0x37643e,
    roughness: 0.78,
    metalness: 0.02,
  });

  // 1. Curved trunk (TubeGeometry)
  const bend = ((seed % 5) - 2) * 0.18;
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(bend * 0.5, 1.3, bend * 0.3),
    new THREE.Vector3(bend, 2.6, -bend * 0.4),
    new THREE.Vector3(bend * 0.6, 3.7, 0),
  ]);
  const trunkGeo = new THREE.TubeGeometry(curve, 12, 0.18, 7, false);
  const trunk = new THREE.Mesh(trunkGeo, barkMat);
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  // 2. Root flare collar
  const rootFlare = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.42, 7), barkMat);
  rootFlare.position.y = 0.2;
  group.add(rootFlare);

  // 3-5. Layered organic pine canopy cushions
  const crownSpecs: [number, number, number, number, number][] = [
    [bend * 0.8 + 0.38, 2.75, 0.22, 0.95, 0.45],
    [bend * 0.6 - 0.36, 3.15, -0.25, 0.88, 0.42],
    [bend * 0.6, 3.75, 0, 1.18, 0.55],
  ];
  crownSpecs.forEach(([cx, cy, cz, rx, ry]) => {
    const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(rx, 1), needleMat);
    crown.userData.seasonalRole = 'pine';
    crown.userData.baseHex = needleMat.color.getHex();
    crown.scale.set(1, ry / rx, 1);
    crown.position.set(cx, cy, cz);
    crown.castShadow = true;
    crown.receiveShadow = true;
    group.add(crown);
  });

  return group;
}

/**
 * Composite 4-part Broadleaf Oak/Chestnut Tree (참나무/상수리나무)
 */
export function createBroadleafTree(tint = 0): THREE.Group {
  const group = new THREE.Group();
  const barkMat = new THREE.MeshStandardMaterial({
    color: 0x57463a,
    roughness: 0.92,
  });
  const leafColor = tint === 0 ? 0x45733b : tint === 1 ? 0x52803e : 0x62853a;
  const leafMat = new THREE.MeshStandardMaterial({
    color: leafColor,
    roughness: 0.76,
  });

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.28, 2.1, 8), barkMat);
  trunk.position.y = 1.05;
  trunk.castShadow = true;
  group.add(trunk);

  const offsets: [number, number, number, number][] = [
    [0, 2.75, 0, 1.12],
    [-0.58, 2.35, 0.32, 0.78],
    [0.56, 2.42, -0.28, 0.82],
  ];
  offsets.forEach(([x, y, z, r]) => {
    const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), leafMat);
    blob.userData.seasonalRole = 'broadleaf';
    blob.userData.baseHex = leafColor;
    blob.position.set(x, y, z);
    blob.castShadow = true;
    blob.receiveShadow = true;
    group.add(blob);
  });

  return group;
}

/**
 * Interactive 3-part Farm Plot Bed (Wood frame + furrowed soil mound + selection ring)
 */
export function createPlotBed(textures: ProceduralTextureSet): {
  group: THREE.Group;
  soilMesh: THREE.Mesh;
  soilMat: THREE.MeshStandardMaterial;
  highlightRing: THREE.Mesh;
} {
  const group = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({
    map: textures.woodMap,
    roughness: 0.76,
    metalness: 0.03,
  });

  // Raised timber bed frame (4 perimeter rails)
  const railLong = new THREE.BoxGeometry(2.18, 0.2, 0.12);
  const railShort = new THREE.BoxGeometry(0.12, 0.2, 2.18);

  const r1 = new THREE.Mesh(railLong, frameMat);
  r1.position.set(0, 0.1, 1.03);
  r1.castShadow = true;
  r1.receiveShadow = true;
  group.add(r1);

  const r2 = new THREE.Mesh(railLong, frameMat);
  r2.position.set(0, 0.1, -1.03);
  r2.castShadow = true;
  r2.receiveShadow = true;
  group.add(r2);

  const r3 = new THREE.Mesh(railShort, frameMat);
  r3.position.set(1.03, 0.1, 0);
  r3.castShadow = true;
  r3.receiveShadow = true;
  group.add(r3);

  const r4 = new THREE.Mesh(railShort, frameMat);
  r4.position.set(-1.03, 0.1, 0);
  r4.castShadow = true;
  r4.receiveShadow = true;
  group.add(r4);

  // Soil interior
  const soilMat = new THREE.MeshStandardMaterial({
    color: 0x9b8265,
    map: textures.meadowMap,
    bumpMap: textures.soilBumpMap,
    bumpScale: 0.04,
    roughness: 0.94,
    metalness: 0.0,
  });
  const soilMesh = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.14, 1.94), soilMat);
  soilMesh.position.y = 0.08;
  soilMesh.receiveShadow = true;
  group.add(soilMesh);

  // Subtle ground hover ring
  const ringGeo = new THREE.RingGeometry(1.18, 1.28, 32);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xf4d26a,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
  });
  const highlightRing = new THREE.Mesh(ringGeo, ringMat);
  highlightRing.position.y = 0.03;
  group.add(highlightRing);

  return { group, soilMesh, soilMat, highlightRing };
}

/**
 * Distinct 3-10 part procedural 3D botanical specimen per relief crop & growth stage.
 * stage: 0 = planted seed mound, 1 = sprout, 2 = growing foliage, 3 = mature/wild harvestable
 */
export function createCropVisual(cropId: CropId, stage: 0 | 1 | 2 | 3, isWild = false): THREE.Group {
  const crop = CROP_MAP[cropId];
  const group = new THREE.Group();

  const leafMat = new THREE.MeshStandardMaterial({
    color: crop.foliageHex,
    roughness: 0.65,
    metalness: 0.02,
  });
  const stemMat = new THREE.MeshStandardMaterial({
    color: cropId === 'buckwheat' ? 0xa94a58 : 0x527a3d,
    roughness: 0.72,
  });
  const flowerMat = new THREE.MeshStandardMaterial({
    color: crop.flowerHex,
    roughness: 0.45,
    metalness: 0.02,
  });
  const tuberMat = new THREE.MeshStandardMaterial({
    color: crop.tuberHex,
    roughness: 0.78,
  });

  if (stage === 0) {
    // Seed mound + marker stake
    const moundGeo = new THREE.SphereGeometry(0.18, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const mound = new THREE.Mesh(moundGeo, new THREE.MeshStandardMaterial({ color: 0x4b3523, roughness: 0.95 }));
    mound.scale.set(1.2, 0.55, 1.2);
    group.add(mound);

    const stake = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.34, 6),
      new THREE.MeshStandardMaterial({ color: 0xc2a378, roughness: 0.8 }),
    );
    stake.position.set(0.22, 0.17, -0.12);
    group.add(stake);
    return group;
  }

  if (stage === 1) {
    // Young cotyledon sprout (3 parts)
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.032, 0.22, 6), stemMat);
    stem.position.y = 0.11;
    group.add(stem);

    [-1, 1].forEach((dir) => {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), leafMat);
      leaf.scale.set(1.3, 0.25, 0.75);
      leaf.position.set(dir * 0.09, 0.21, 0);
      leaf.rotation.z = dir * -0.35;
      group.add(leaf);
    });
    return group;
  }

  if (stage === 2) {
    // Mid-growth foliage cluster (4-5 parts)
    const count = 4;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + 0.4;
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.035, 0.4, 6), stemMat);
      stalk.position.set(Math.cos(a) * 0.08, 0.18, Math.sin(a) * 0.08);
      stalk.rotation.z = -Math.cos(a) * 0.28;
      stalk.rotation.x = Math.sin(a) * 0.28;
      group.add(stalk);

      const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14, 0), leafMat);
      leaf.scale.set(1.25, 0.35, 0.9);
      leaf.position.set(Math.cos(a) * 0.18, 0.34, Math.sin(a) * 0.18);
      group.add(leaf);
    }
    return group;
  }

  // Stage 3: Mature / Wild Harvestable Specimen (species-specific 5-10 parts)
  const scaleFactor = isWild ? 1.15 : 1.0;

  switch (cropId) {
    case 'sweet_potato': {
      // Peeking reddish-purple spindle tubers + trailing heart-leaf vines
      [-0.14, 0.16, 0.02].forEach((tx, idx) => {
        const tuber = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.16, 5, 8), tuberMat);
        tuber.position.set(tx, 0.06, idx === 2 ? 0.16 : -0.08);
        tuber.rotation.set(0.4, idx * 1.1, 1.15);
        tuber.castShadow = true;
        group.add(tuber);
      });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), leafMat);
        leaf.scale.set(1.15, 0.25, 1.05);
        leaf.position.set(Math.cos(a) * 0.28, 0.22 + (i % 2) * 0.07, Math.sin(a) * 0.28);
        leaf.rotation.y = a;
        leaf.castShadow = true;
        group.add(leaf);
      }
      break;
    }

    case 'potato': {
      // Mounded golden tubers + upright leafy stalks + white star blossoms
      [-0.14, 0.14].forEach((px, idx) => {
        const tuber = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 1), tuberMat);
        tuber.scale.set(1.2, 0.85, 1.0);
        tuber.position.set(px, 0.06, idx === 0 ? 0.15 : -0.14);
        group.add(tuber);
      });
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.3;
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.04, 0.56, 6), stemMat);
        stalk.position.set(Math.cos(a) * 0.08, 0.28, Math.sin(a) * 0.08);
        stalk.rotation.z = -Math.cos(a) * 0.18;
        stalk.castShadow = true;
        group.add(stalk);

        const foliage = new THREE.Mesh(new THREE.IcosahedronGeometry(0.19, 0), leafMat);
        foliage.scale.set(1.1, 0.55, 1.1);
        foliage.position.set(Math.cos(a) * 0.16, 0.46, Math.sin(a) * 0.16);
        foliage.castShadow = true;
        group.add(foliage);
      }
      [-0.08, 0.12].forEach((fx, i) => {
        const blossom = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.02, 0.04, 5), flowerMat);
        blossom.position.set(fx, 0.64, i === 0 ? 0.1 : -0.1);
        group.add(blossom);
      });
      break;
    }

    case 'doraji': {
      // Erect slender stems + serrated foliage + iconic 5-lobed purple-blue bellflowers
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.82, 7), stemMat);
      stem.position.y = 0.41;
      stem.castShadow = true;
      group.add(stem);

      for (let i = 0; i < 4; i++) {
        const y = 0.22 + i * 0.12;
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.28, 5), leafMat);
        leaf.rotation.z = (i % 2 === 0 ? 1 : -1) * 1.1;
        leaf.rotation.y = i * 1.5;
        leaf.scale.set(1, 1, 0.35);
        leaf.position.set(Math.cos(i * 1.5) * 0.11, y, Math.sin(i * 1.5) * 0.11);
        group.add(leaf);
      }

      // Bellflower cups
      [
        [0, 0.86, 0, 0.15],
        [0.14, 0.72, 0.09, 0.12],
        [-0.13, 0.68, -0.08, 0.11],
      ].forEach(([bx, by, bz, r]) => {
        const bell = new THREE.Mesh(new THREE.ConeGeometry(r, r * 1.35, 5, 1, true), flowerMat);
        bell.material.side = THREE.DoubleSide;
        bell.position.set(bx, by, bz);
        bell.rotation.x = Math.PI * 0.85;
        bell.castShadow = true;
        group.add(bell);
      });
      break;
    }

    case 'kudzu': {
      // Wooden support stake + coiled vine + broad trifoliate leaves + purple raceme flowers
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.045, 0.95, 6),
        new THREE.MeshStandardMaterial({ color: 0x6f4e37, roughness: 0.88 }),
      );
      pole.position.y = 0.47;
      pole.castShadow = true;
      group.add(pole);

      const vineCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.1, 0.05, 0),
        new THREE.Vector3(0, 0.3, 0.12),
        new THREE.Vector3(-0.12, 0.55, 0),
        new THREE.Vector3(0, 0.8, -0.11),
        new THREE.Vector3(0.09, 0.95, 0.04),
      ]);
      const vine = new THREE.Mesh(new THREE.TubeGeometry(vineCurve, 16, 0.025, 6, false), stemMat);
      group.add(vine);

      for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), leafMat);
        leaf.scale.set(1.2, 0.28, 1.0);
        leaf.position.set(
          Math.cos(i * 1.3) * 0.2,
          0.35 + i * 0.12,
          Math.sin(i * 1.3) * 0.2,
        );
        leaf.castShadow = true;
        group.add(leaf);
      }

      const raceme = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.24, 7), flowerMat);
      raceme.position.set(0.16, 0.72, 0.12);
      raceme.rotation.x = Math.PI;
      group.add(raceme);
      break;
    }

    case 'yam': {
      // Climbing vine + heart leaves + thick cream yam root collar
      const rootCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.22, 8), tuberMat);
      rootCrown.position.y = 0.09;
      group.add(rootCrown);

      const trellis = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.035, 0.9, 6),
        new THREE.MeshStandardMaterial({ color: 0x7b6148, roughness: 0.85 }),
      );
      trellis.position.y = 0.45;
      group.add(trellis);

      for (let i = 0; i < 6; i++) {
        const a = i * 1.1;
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.13, 7, 5), leafMat);
        leaf.scale.set(1.2, 0.22, 1.0);
        leaf.position.set(Math.cos(a) * 0.16, 0.26 + i * 0.1, Math.sin(a) * 0.16);
        leaf.castShadow = true;
        group.add(leaf);
      }
      break;
    }

    case 'buckwheat': {
      // Crimson-stemmed cluster + triangular leaves + snowy white flower umbels
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const r = i === 0 ? 0 : 0.15;
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.028, 0.62, 6), stemMat);
        stalk.position.set(Math.cos(a) * r, 0.31, Math.sin(a) * r);
        stalk.castShadow = true;
        group.add(stalk);

        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.18, 3), leafMat);
        leaf.scale.set(1, 0.25, 1);
        leaf.position.set(Math.cos(a) * (r + 0.08), 0.34, Math.sin(a) * (r + 0.08));
        group.add(leaf);

        const cluster = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), flowerMat);
        cluster.scale.set(1.2, 0.55, 1.2);
        cluster.position.set(Math.cos(a) * r, 0.64, Math.sin(a) * r);
        group.add(cluster);
      }
      break;
    }

    case 'millet': {
      // Tall stalks + arching blades + drooping golden-amber millet panicles
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + 0.2;
        const r = i === 0 ? 0 : 0.14;
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.028, 0.78, 6), stemMat);
        stalk.position.set(Math.cos(a) * r, 0.39, Math.sin(a) * r);
        stalk.rotation.z = -Math.cos(a) * 0.12;
        stalk.castShadow = true;
        group.add(stalk);

        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.06), leafMat);
        blade.position.set(Math.cos(a) * (r + 0.12), 0.44, Math.sin(a) * (r + 0.12));
        blade.rotation.y = -a;
        blade.rotation.z = -0.35;
        group.add(blade);

        const panicle = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.18, 4, 8), flowerMat);
        panicle.position.set(Math.cos(a) * (r + 0.08), 0.76, Math.sin(a) * (r + 0.08));
        panicle.rotation.z = -Math.cos(a) * 0.45 - 0.25;
        panicle.castShadow = true;
        group.add(panicle);
      }
      break;
    }

    case 'shepherds_purse': {
      // Low basal rosette + slender flower stems + tiny white blossoms
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.03, 0.09), leafMat);
        leaf.position.set(Math.cos(a) * 0.15, 0.06, Math.sin(a) * 0.15);
        leaf.rotation.y = -a;
        leaf.rotation.z = 0.15;
        group.add(leaf);
      }
      for (let j = 0; j < 3; j++) {
        const a = (j / 3) * Math.PI * 2 + 0.5;
        const scape = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.44, 5), stemMat);
        scape.position.set(Math.cos(a) * 0.05, 0.24, Math.sin(a) * 0.05);
        group.add(scape);

        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.048, 7, 6), flowerMat);
        tip.position.set(Math.cos(a) * 0.05, 0.47, Math.sin(a) * 0.05);
        group.add(tip);
      }
      break;
    }

    case 'mugwort': {
      // Lush clump of deeply lobed sage-green shoots
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const r = i === 0 ? 0 : 0.17;
        const shoot = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.026, 0.48, 6), stemMat);
        shoot.position.set(Math.cos(a) * r, 0.24, Math.sin(a) * r);
        group.add(shoot);

        const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14, 0), leafMat);
        crown.scale.set(1.15, 0.85, 1.15);
        crown.position.set(Math.cos(a) * r, 0.42 + (i % 2) * 0.07, Math.sin(a) * r);
        crown.castShadow = true;
        group.add(crown);
      }
      break;
    }

    case 'jerusalem_artichoke': {
      // Tall sunflower-like stalks + bright golden blooms + knobby tubers at base
      [-0.13, 0.12].forEach((tx, idx) => {
        const tuber = new THREE.Mesh(new THREE.DodecahedronGeometry(0.09, 0), tuberMat);
        tuber.scale.set(1.3, 0.75, 0.9);
        tuber.position.set(tx, 0.05, idx === 0 ? 0.14 : -0.12);
        group.add(tuber);
      });

      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + 0.4;
        const r = 0.09;
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.036, 0.92, 6), stemMat);
        stalk.position.set(Math.cos(a) * r, 0.46, Math.sin(a) * r);
        stalk.castShadow = true;
        group.add(stalk);

        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.14, 7, 5), leafMat);
        leaf.scale.set(1.3, 0.22, 0.85);
        leaf.position.set(Math.cos(a) * (r + 0.14), 0.52, Math.sin(a) * (r + 0.14));
        group.add(leaf);

        // Bright golden flower head + brown center disc
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 12), flowerMat);
        head.position.set(Math.cos(a) * r, 0.94, Math.sin(a) * r);
        head.rotation.x = 0.65;
        head.rotation.z = -Math.cos(a) * 0.25;
        head.castShadow = true;
        group.add(head);

        const disc = new THREE.Mesh(
          new THREE.CylinderGeometry(0.055, 0.055, 0.04, 10),
          new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.85 }),
        );
        disc.position.copy(head.position);
        disc.rotation.copy(head.rotation);
        group.add(disc);
      }
      break;
    }

    case 'sorghum': {
      // Tall sturdy stalks + broad arching leaves + heavy crimson-rust panicle clusters
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.35;
        const r = i === 0 ? 0 : 0.14;
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.036, 0.96, 6), stemMat);
        stalk.position.set(Math.cos(a) * r, 0.48, Math.sin(a) * r);
        stalk.castShadow = true;
        group.add(stalk);

        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.075), leafMat);
        blade.position.set(Math.cos(a) * (r + 0.14), 0.52, Math.sin(a) * (r + 0.14));
        blade.rotation.y = -a;
        blade.rotation.z = -0.3;
        group.add(blade);

        const panicle = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11, 1), flowerMat);
        panicle.scale.set(0.85, 1.65, 0.85);
        panicle.position.set(Math.cos(a) * r, 0.98, Math.sin(a) * r);
        panicle.castShadow = true;
        group.add(panicle);
      }
      break;
    }

    case 'corn': {
      // Thick jointed stalks + golden tassels + side corn cobs in green husks
      const cobMat = new THREE.MeshStandardMaterial({ color: crop.tuberHex, roughness: 0.55 });
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + 0.25;
        const r = 0.14;
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.048, 1.06, 7), stemMat);
        stalk.position.set(Math.cos(a) * r, 0.53, Math.sin(a) * r);
        stalk.castShadow = true;
        group.add(stalk);

        const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.02, 0.08), leafMat);
        leaf.position.set(Math.cos(a) * (r + 0.16), 0.54, Math.sin(a) * (r + 0.16));
        leaf.rotation.y = -a;
        leaf.rotation.z = -0.35;
        group.add(leaf);

        // Golden corn cob protruding from stalk
        const cob = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.16, 4, 8), cobMat);
        cob.position.set(Math.cos(a + 0.6) * (r + 0.07), 0.62, Math.sin(a + 0.6) * (r + 0.07));
        cob.rotation.z = -0.45;
        cob.rotation.y = -a;
        cob.castShadow = true;
        group.add(cob);

        // Top tassel
        const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 5), flowerMat);
        tassel.position.set(Math.cos(a) * r, 1.12, Math.sin(a) * r);
        group.add(tassel);
      }
      break;
    }

    case 'barley': {
      // Dense golden-green grain culms with bearded spikes
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const r = i === 0 ? 0 : 0.16;
        const culm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.022, 0.7, 5), stemMat);
        culm.position.set(Math.cos(a) * r, 0.35, Math.sin(a) * r);
        culm.rotation.z = -Math.cos(a) * 0.1;
        culm.castShadow = true;
        group.add(culm);

        const spike = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.024, 0.22, 6), flowerMat);
        spike.position.set(Math.cos(a) * (r + 0.04), 0.74, Math.sin(a) * (r + 0.04));
        spike.rotation.z = -Math.cos(a) * 0.25;
        spike.castShadow = true;
        group.add(spike);
      }
      break;
    }

    case 'pumpkin': {
      // Sprawling broad leaves + golden trumpet blooms + ribbed warm-orange pumpkins
      const pumpkinMat = new THREE.MeshStandardMaterial({ color: crop.tuberHex, roughness: 0.62 });
      const peduncleMat = new THREE.MeshStandardMaterial({ color: 0x4b5e2e, roughness: 0.85 });

      [
        [-0.14, 0.16, 0.1, 0.22],
        [0.2, 0.12, -0.14, 0.16],
      ].forEach(([px, py, pz, r]) => {
        const body = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), pumpkinMat);
        body.scale.set(1.18, 0.78, 1.18);
        body.position.set(px, py, pz);
        body.castShadow = true;
        group.add(body);

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.09, 6), peduncleMat);
        stem.position.set(px, py + r * 0.78, pz);
        group.add(stem);
      });

      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + 0.3;
        const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), leafMat);
        leaf.scale.set(1.25, 0.22, 1.15);
        leaf.position.set(Math.cos(a) * 0.3, 0.26 + (i % 2) * 0.06, Math.sin(a) * 0.3);
        leaf.castShadow = true;
        group.add(leaf);
      }

      const blossom = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.12, 6, 1, true), flowerMat);
      blossom.material.side = THREE.DoubleSide;
      blossom.position.set(0.04, 0.34, 0.28);
      blossom.rotation.x = Math.PI;
      group.add(blossom);
      break;
    }
  }

  group.scale.setScalar(scaleFactor);
  return group;
}
