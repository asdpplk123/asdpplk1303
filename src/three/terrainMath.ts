import { HabitatCategory } from '../types/botany';

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Deterministic ground elevation at world (x, z).
 * Keeps the central farm terrace flat at y=0, dips gently along the southwest stream,
 * rises into hillside/highland habitats, and lifts naturally into distant mountain ridges.
 */
export function groundHeightAt(x: number, z: number): number {
  const distFromCenter = Math.hypot(x, z);

  // Flat central farmstead plateau (radius ~8.5)
  const plateauBlend = smoothstep(7.5, 13.5, distFromCenter);

  // Rolling organic hills outside the plateau
  let hill =
    Math.sin(x * 0.14 + 0.4) * Math.cos(z * 0.12 - 0.3) * 0.65 +
    Math.sin(x * 0.07 - z * 0.09) * 0.55;

  // Northwest / West hillside slope (고구마, 도라지, 칡)
  const westHill = smoothstep(-6, -22, x) * smoothstep(4, -14, z) * 3.4;

  // Northeast / East highland terrace (감자, 메밀, 조)
  const eastHighland = smoothstep(7, 22, x) * smoothstep(5, -14, z) * 3.1;

  // Southwest stream channel (runs near x = -2 to -18, z = 7 to 18)
  const streamCenterZ = 11.2 + Math.sin(x * 0.18) * 1.8;
  const distToStream = Math.abs(z - streamCenterZ);
  const inStreamZone = smoothstep(5, -2, x); // stronger toward west/southwest
  const streamCarve = (1 - smoothstep(0.8, 3.6, distToStream)) * 0.85 * (0.45 + 0.55 * inStreamZone);

  // Outer natural mountain ring (horizon backdrop)
  const outerRidge = smoothstep(23, 46, distFromCenter) * (7.5 + Math.sin(Math.atan2(z, x) * 5) * 2.2);

  const rawHeight = (hill + westHill + eastHighland) * plateauBlend + outerRidge - streamCarve;
  return rawHeight;
}

export function getStreamCenterZ(x: number): number {
  return 11.2 + Math.sin(x * 0.18) * 1.8;
}

export function getHabitatAt(x: number, z: number): HabitatCategory {
  if (z > 6.5 && x < 2) return 'streamside';
  if (z > 5.5 && x >= 2) return 'meadow';
  if (x < 0) return 'hillside';
  return 'highland';
}
