import * as THREE from 'three';

export interface ProceduralTextureSet {
  meadowMap: THREE.CanvasTexture;
  tilledDryMap: THREE.CanvasTexture;
  tilledWetMap: THREE.CanvasTexture;
  woodMap: THREE.CanvasTexture;
  stoneMap: THREE.CanvasTexture;
  roofTileMap: THREE.CanvasTexture;
  plasterMap: THREE.CanvasTexture;
  soilBumpMap: THREE.CanvasTexture;
  contactShadowMap: THREE.CanvasTexture;
  dispose: () => void;
}

function createCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function pseudoRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  const rand = pseudoRandom(4219);

  // 1. Meadow grass + subtle earth texture
  const [meadowCanvas, mCtx] = createCanvas(512);
  mCtx.fillStyle = '#567542';
  mCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4800; i++) {
    const x = rand() * 512;
    const y = rand() * 512;
    const shade = rand();
    mCtx.fillStyle =
      shade < 0.35
        ? 'rgba(72, 102, 52, 0.45)'
        : shade < 0.72
          ? 'rgba(104, 134, 68, 0.38)'
          : 'rgba(126, 118, 72, 0.25)';
    mCtx.fillRect(x, y, 2 + rand() * 4, 4 + rand() * 7);
  }
  const meadowMap = new THREE.CanvasTexture(meadowCanvas);
  meadowMap.colorSpace = THREE.SRGBColorSpace;
  meadowMap.wrapS = THREE.RepeatWrapping;
  meadowMap.wrapT = THREE.RepeatWrapping;
  meadowMap.repeat.set(16, 16);
  meadowMap.anisotropy = maxAnisotropy;

  // 2. Tilled dry soil (furrowed ridges)
  const [dryCanvas, dCtx] = createCanvas(256);
  dCtx.fillStyle = '#6c5038';
  dCtx.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 8; row++) {
    const y = row * 32;
    const grad = dCtx.createLinearGradient(0, y, 0, y + 32);
    grad.addColorStop(0, '#4f3927');
    grad.addColorStop(0.5, '#7c5d43');
    grad.addColorStop(1, '#4a3423');
    dCtx.fillStyle = grad;
    dCtx.fillRect(0, y, 256, 32);
  }
  for (let i = 0; i < 1600; i++) {
    dCtx.fillStyle = rand() > 0.5 ? 'rgba(45,30,18,0.35)' : 'rgba(145,115,82,0.28)';
    dCtx.fillRect(rand() * 256, rand() * 256, 2 + rand() * 3, 2 + rand() * 2);
  }
  const tilledDryMap = new THREE.CanvasTexture(dryCanvas);
  tilledDryMap.colorSpace = THREE.SRGBColorSpace;
  tilledDryMap.anisotropy = maxAnisotropy;

  // 3. Tilled wet soil (rich dark moist earth)
  const [wetCanvas, wCtx] = createCanvas(256);
  wCtx.fillStyle = '#362417';
  wCtx.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 8; row++) {
    const y = row * 32;
    const grad = wCtx.createLinearGradient(0, y, 0, y + 32);
    grad.addColorStop(0, '#24170e');
    grad.addColorStop(0.5, '#432e1e');
    grad.addColorStop(1, '#20140c');
    wCtx.fillStyle = grad;
    wCtx.fillRect(0, y, 256, 32);
  }
  for (let i = 0; i < 1400; i++) {
    wCtx.fillStyle = rand() > 0.5 ? 'rgba(18,10,6,0.4)' : 'rgba(92,66,44,0.28)';
    wCtx.fillRect(rand() * 256, rand() * 256, 2 + rand() * 3, 2);
  }
  const tilledWetMap = new THREE.CanvasTexture(wetCanvas);
  tilledWetMap.colorSpace = THREE.SRGBColorSpace;
  tilledWetMap.anisotropy = maxAnisotropy;

  // 4. Soil bump map (linear space)
  const [bumpCanvas, bCtx] = createCanvas(256);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 8; row++) {
    const y = row * 32;
    const grad = bCtx.createLinearGradient(0, y, 0, y + 32);
    grad.addColorStop(0, '#303030');
    grad.addColorStop(0.5, '#dcdcdc');
    grad.addColorStop(1, '#282828');
    bCtx.fillStyle = grad;
    bCtx.fillRect(0, y, 256, 32);
  }
  for (let i = 0; i < 900; i++) {
    const v = Math.floor(80 + rand() * 140);
    bCtx.fillStyle = `rgb(${v},${v},${v})`;
    bCtx.fillRect(rand() * 256, rand() * 256, 2, 2);
  }
  const soilBumpMap = new THREE.CanvasTexture(bumpCanvas);

  // 5. Weathered timber grain
  const [woodCanvas, wdCtx] = createCanvas(256);
  wdCtx.fillStyle = '#704f35';
  wdCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 2) {
    wdCtx.fillStyle = rand() > 0.5 ? 'rgba(54,35,20,0.25)' : 'rgba(135,98,66,0.18)';
    wdCtx.fillRect(0, y, 256, 1 + rand() * 2);
  }
  const woodMap = new THREE.CanvasTexture(woodCanvas);
  woodMap.colorSpace = THREE.SRGBColorSpace;
  woodMap.wrapS = THREE.RepeatWrapping;
  woodMap.wrapT = THREE.RepeatWrapping;
  woodMap.anisotropy = maxAnisotropy;

  // 6. Stone masonry texture
  const [stoneCanvas, stCtx] = createCanvas(256);
  stCtx.fillStyle = '#757570';
  stCtx.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 6; r++) {
    const y = r * 42;
    const offset = (r % 2) * 24;
    for (let c = -1; c < 5; c++) {
      const x = c * 64 + offset;
      const tone = Math.floor(118 + rand() * 38);
      stCtx.fillStyle = `rgb(${tone},${tone - 2},${tone - 6})`;
      stCtx.fillRect(x + 2, y + 2, 60, 38);
    }
  }
  const stoneMap = new THREE.CanvasTexture(stoneCanvas);
  stoneMap.colorSpace = THREE.SRGBColorSpace;
  stoneMap.wrapS = THREE.RepeatWrapping;
  stoneMap.wrapT = THREE.RepeatWrapping;
  stoneMap.anisotropy = maxAnisotropy;

  // 7. Korean dark roof tile (Giwa) texture
  const [tileCanvas, tCtx] = createCanvas(256);
  tCtx.fillStyle = '#33383d';
  tCtx.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 24) {
    const grad = tCtx.createLinearGradient(x, 0, x + 24, 0);
    grad.addColorStop(0, '#23272b');
    grad.addColorStop(0.5, '#464d54');
    grad.addColorStop(1, '#212529');
    tCtx.fillStyle = grad;
    tCtx.fillRect(x, 0, 24, 256);
  }
  for (let y = 0; y < 256; y += 28) {
    tCtx.fillStyle = 'rgba(15, 18, 22, 0.42)';
    tCtx.fillRect(0, y, 256, 3);
  }
  const roofTileMap = new THREE.CanvasTexture(tileCanvas);
  roofTileMap.colorSpace = THREE.SRGBColorSpace;
  roofTileMap.wrapS = THREE.RepeatWrapping;
  roofTileMap.wrapT = THREE.RepeatWrapping;
  roofTileMap.repeat.set(3, 2);
  roofTileMap.anisotropy = maxAnisotropy;

  // 8. Warm earthen plaster wall texture
  const [plasterCanvas, pCtx] = createCanvas(256);
  pCtx.fillStyle = '#dfd5c0';
  pCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1500; i++) {
    pCtx.fillStyle = rand() > 0.5 ? 'rgba(180,165,138,0.22)' : 'rgba(246,240,226,0.22)';
    pCtx.fillRect(rand() * 256, rand() * 256, 3, 3);
  }
  const plasterMap = new THREE.CanvasTexture(plasterCanvas);
  plasterMap.colorSpace = THREE.SRGBColorSpace;
  plasterMap.anisotropy = maxAnisotropy;

  // 9. Soft radial contact shadow
  const [shadowCanvas, shCtx] = createCanvas(128);
  const rad = shCtx.createRadialGradient(64, 64, 8, 64, 64, 62);
  rad.addColorStop(0, 'rgba(16, 20, 14, 0.55)');
  rad.addColorStop(0.6, 'rgba(16, 20, 14, 0.22)');
  rad.addColorStop(1, 'rgba(16, 20, 14, 0)');
  shCtx.fillStyle = rad;
  shCtx.fillRect(0, 0, 128, 128);
  const contactShadowMap = new THREE.CanvasTexture(shadowCanvas);

  return {
    meadowMap,
    tilledDryMap,
    tilledWetMap,
    woodMap,
    stoneMap,
    roofTileMap,
    plasterMap,
    soilBumpMap,
    contactShadowMap,
    dispose: () => {
      meadowMap.dispose();
      tilledDryMap.dispose();
      tilledWetMap.dispose();
      woodMap.dispose();
      stoneMap.dispose();
      roofTileMap.dispose();
      plasterMap.dispose();
      soilBumpMap.dispose();
      contactShadowMap.dispose();
    },
  };
}
