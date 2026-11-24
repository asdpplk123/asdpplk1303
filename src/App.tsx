import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { farmAudio } from './audio/farmAudio';
import { BagModal } from './components/BagModal';
import { CompendiumModal } from './components/CompendiumModal';
import { CropInspectorToast } from './components/CropInspectorToast';
import { FarmHud } from './components/FarmHud';
import {
  CROP_MAP,
  RELIEF_CROPS,
  SEASON_SHORT_LABELS,
  SUN_LABELS,
  WEATHER_LABELS,
} from './data/reliefCrops';
import {
  getCalendarInfo,
  getDayOfYearForSeason,
  getTimeHoursForSunPreset,
  normalizeDayOfYear,
  SEASON_LABELS,
} from './utils/calendar';
import { downloadProjectZip } from './utils/exportProjectZip';
import {
  CameraTargetCommand,
  FarmWorld,
  getPresetCameraCoords,
  ParticleBurstCommand,
} from './three/FarmWorld';
import {
  CameraFocusPreset,
  ConditionCheck,
  CropId,
  DiscoveryProgress,
  FarmPlotState,
  ReliefCropData,
  SelectionFeedback,
  SeasonType,
  SunPreset,
  TargetRef,
  ToolMode,
  WeatherType,
  WildSpecimenState,
} from './types/botany';

const STORAGE_KEY = 'relief_crops_farm_save_v1';
const HOLD_HARVEST_MS = 800;
const HOLD_INSPECT_MS = 400;
const COLD_HARDY_CROPS = new Set<CropId>([
  'barley',
  'shepherds_purse',
  'jerusalem_artichoke',
  'yam',
  'kudzu',
]);

function isSunlightMatching(
  sunPreset: SunPreset,
  weather: WeatherType,
  crop: ReliefCropData,
): boolean {
  if (weather === 'rain' || weather === 'snow') return false;
  if (sunPreset === 'night') return false;
  if (crop.cultivation.sunNeed === 'high' && weather !== 'clear') return false;
  return (
    sunPreset === crop.cultivation.optimalSun ||
    (crop.cultivation.sunNeed === 'high' && sunPreset === 'noon')
  );
}

function isPlotMoistureMet(plot: FarmPlotState, crop: ReliefCropData): boolean {
  const wateringsOk = plot.wateringsCount >= crop.cultivation.requiredWaterings;
  const drainOk = !crop.cultivation.drainRequiredBeforeHarvest || plot.waterLevel <= 0.72;
  return wateringsOk && drainOk;
}

function buildPlotConditions(
  plot: FarmPlotState,
  crop: ReliefCropData,
  weather: WeatherType,
): ConditionCheck[] {
  const req = crop.cultivation.requiredWaterings;
  const drain = crop.cultivation.drainRequiredBeforeHarvest;
  const waterCountLabel = `${Math.min(plot.wateringsCount, req)}/${req}`;
  const waterLabel = drain
    ? plot.wateringsCount < req
      ? `물 ${waterCountLabel} · 배수`
      : plot.waterLevel <= 0.72
        ? `물 ${waterCountLabel} · 배수됨`
        : weather === 'rain'
          ? `물 ${waterCountLabel} · 비(배수 대기)`
          : `물 ${waterCountLabel} · 배수중`
    : `물 주기 ${waterCountLabel}`;

  const sunLabel =
    crop.cultivation.sunNeed === 'high'
      ? `맑은 ${SUN_LABELS[crop.cultivation.optimalSun]}`
      : SUN_LABELS[crop.cultivation.optimalSun];

  return [
    {
      label: waterLabel,
      met: isPlotMoistureMet(plot, crop),
    },
    {
      label: sunLabel,
      met: plot.sunlightMet,
    },
    {
      label: `완전 성숙 ${Math.round(plot.growthProgress * 100)}%`,
      met: plot.mature,
    },
  ];
}

function buildWildConditions(
  specimen: WildSpecimenState,
  crop: ReliefCropData,
  season: SeasonType,
  sunPreset: SunPreset,
  weather: WeatherType,
): ConditionCheck[] {
  const seasonNames = crop.wildSpawn.allowedSeasons.map((s) => SEASON_LABELS[s]).join('·');
  const sunNames = crop.wildSpawn.allowedSuns.map((s) => SEASON_SHORT_LABELS[s]).join('·');
  const weatherLabels = crop.wildSpawn.allowedWeathers.map((w) => WEATHER_LABELS[w]).join('/');

  if (!specimen.emerged) {
    return [
      {
        label: `계절 ${seasonNames}`,
        met: crop.wildSpawn.allowedSeasons.includes(season),
      },
      {
        label: `${sunNames} · ${weatherLabels}`,
        met:
          crop.wildSpawn.allowedSuns.includes(sunPreset) &&
          crop.wildSpawn.allowedWeathers.includes(weather),
      },
      {
        label: `출현 확률 ${Math.round(crop.wildSpawn.spawnChance * 100)}%`,
        met: false,
      },
    ];
  }

  return [
    {
      label: `자생지 출현 완료`,
      met: true,
    },
    {
      label: `${seasonNames} · ${weatherLabels}`,
      met: specimen.sunlightMet,
    },
    {
      label: `완전 성숙 ${Math.round(specimen.growthProgress * 100)}%`,
      met: specimen.available,
    },
  ];
}

function buildPlotFeedback(plot: FarmPlotState, weather: WeatherType): SelectionFeedback {
  if (!plot.cropId) {
    return {
      title: `${plot.index + 1}번 밭`,
      subtitle:
        plot.soil === 'tilled'
          ? '잘 갈아둔 고랑입니다. [심기] 도구를 선택해 씨앗을 심어보세요.'
          : '아직 갈지 않은 땅입니다. [밭 갈기] 도구를 선택해 경작을 시작하세요.',
      compactTitle: `${plot.index + 1}번 밭`,
      compactSubtitle: plot.soil === 'tilled' ? '갈아둔 밭 (심기 가능)' : '빈 밭 (갈기 필요)',
    };
  }

  const crop = CROP_MAP[plot.cropId];
  const conditions = buildPlotConditions(plot, crop, weather);
  const allMet = plot.mature;
  const unmetLabels = conditions.filter((c) => !c.met).map((c) => c.label);
  const pct = Math.round(plot.growthProgress * 100);

  return {
    title: `${plot.index + 1}번 밭 · ${crop.nameKo} (${crop.cultivation.growthRateLabel})`,
    subtitle: allMet
      ? `모든 생육 조건 달성! 예상 수확량 ${crop.harvestYield}개 · 씨앗 +${crop.seedYield}`
      : `조건: ${crop.cultivation.conditionSummary}`,
    compactTitle: `${plot.index + 1}번 밭 · ${crop.nameKo}`,
    compactSubtitle: allMet ? '100% 성숙 · 수확 가능' : `생육 ${pct}% · 조건 확인 필요`,
    cropId: crop.id,
    canHarvest: allMet,
    conditions,
    actionHint: allMet
      ? undefined
      : `미충족 조건(${unmetLabels.join(', ')})을 맞추면 100% 성숙 후 [F] 키로 수확할 수 있습니다.`,
  };
}

function buildWildFeedback(
  specimen: WildSpecimenState,
  season: SeasonType,
  sunPreset: SunPreset,
  weather: WeatherType,
): SelectionFeedback {
  const crop = CROP_MAP[specimen.cropId];
  const conditions = buildWildConditions(specimen, crop, season, sunPreset, weather);

  if (!specimen.emerged) {
    const condOk =
      crop.wildSpawn.allowedSeasons.includes(season) &&
      crop.wildSpawn.allowedSuns.includes(sunPreset) &&
      crop.wildSpawn.allowedWeathers.includes(weather);
    return {
      title: `야생 ${crop.nameKo} 자생지 · ${crop.habitat.zoneName}`,
      subtitle: `아직 개체가 돋아나지 않았습니다. 출현 조건: ${crop.wildSpawn.conditionLabel}`,
      compactTitle: `야생 ${crop.nameKo} 자생지`,
      compactSubtitle: condOk ? '출현 조건 충족 · 대기 중' : '미출현 (계절·날씨 대기)',
      cropId: crop.id,
      canHarvest: false,
      conditions,
      actionHint:
        specimen.respawnTimer > 0
          ? `재출현 대기 중 (${Math.ceil(specimen.respawnTimer)}초 후 조건 충족 시 확률 판정)`
          : condOk
            ? `현재 계절과 날씨가 맞습니다! 시간이 지나면 ${Math.round(crop.wildSpawn.spawnChance * 100)}% 확률로 돋아납니다.`
            : '계절과 시간·날씨가 맞물릴 때 일정 확률로 자생지에 자연 발생합니다.',
    };
  }

  const allMet = specimen.available;
  const pct = Math.round(specimen.growthProgress * 100);
  return {
    title: `야생 ${crop.nameKo} · ${crop.habitat.zoneName}`,
    subtitle: allMet
      ? `자연 발생한 개체가 완전히 자랐습니다! 지금 바로 채집해 도감에 기록하세요.`
      : `자생지에서 성장 중 (${pct}%) · ${crop.wildSpawn.conditionLabel}`,
    compactTitle: `야생 ${crop.nameKo}`,
    compactSubtitle: allMet ? '100% 자람 · 채집 가능' : `자생지 생육 ${pct}%`,
    cropId: crop.id,
    canHarvest: allMet,
    conditions,
    actionHint: allMet
      ? undefined
      : '완전히 자랄 때까지 기다린 뒤 [F] 키를 꾹 눌러 채집하세요.',
  };
}

function createInitialPlots(): FarmPlotState[] {
  const coords: [number, number][] = [
    [-3.75, -0.5],
    [-1.25, -0.5],
    [1.25, -0.5],
    [3.75, -0.5],
    [-3.75, 2.3],
    [-1.25, 2.3],
    [1.25, 2.3],
    [3.75, 2.3],
  ];

  return coords.map(([x, z], index) => {
    if (index === 0) {
      return {
        id: `plot-${index}`,
        index,
        position: [x, 0, z],
        soil: 'tilled',
        watered: true,
        waterLevel: 0.45,
        wateringsCount: 1,
        sunlightMet: true,
        cropId: 'sweet_potato',
        growthProgress: 1,
        mature: true,
      };
    }
    if (index === 1) {
      return {
        id: `plot-${index}`,
        index,
        position: [x, 0, z],
        soil: 'tilled',
        watered: true,
        waterLevel: 0.7,
        wateringsCount: 1,
        sunlightMet: false,
        cropId: 'corn',
        growthProgress: 0.92,
        mature: false,
      };
    }
    if (index === 2) {
      return {
        id: `plot-${index}`,
        index,
        position: [x, 0, z],
        soil: 'tilled',
        watered: false,
        waterLevel: 0,
        wateringsCount: 1,
        sunlightMet: false,
        cropId: 'sorghum',
        growthProgress: 0.55,
        mature: false,
      };
    }
    if (index === 3) {
      return {
        id: `plot-${index}`,
        index,
        position: [x, 0, z],
        soil: 'tilled',
        watered: true,
        waterLevel: 0.4,
        wateringsCount: 1,
        sunlightMet: true,
        cropId: 'buckwheat',
        growthProgress: 1,
        mature: true,
      };
    }
    if (index === 4) {
      return {
        id: `plot-${index}`,
        index,
        position: [x, 0, z],
        soil: 'tilled',
        watered: false,
        waterLevel: 0,
        wateringsCount: 0,
        sunlightMet: false,
        cropId: null,
        growthProgress: 0,
        mature: false,
      };
    }
    return {
      id: `plot-${index}`,
      index,
      position: [x, 0, z],
      soil: 'fallow',
      watered: false,
      waterLevel: 0,
      wateringsCount: 0,
      sunlightMet: false,
      cropId: null,
      growthProgress: 0,
      mature: false,
    };
  });
}

const STARTER_EMERGED_WILD = new Set<CropId>(['shepherds_purse', 'barley', 'buckwheat']);

function createInitialWildSpecimens(): WildSpecimenState[] {
  return RELIEF_CROPS.map((crop) => {
    const startEmerged = STARTER_EMERGED_WILD.has(crop.id);
    return {
      id: `wild-${crop.id}`,
      cropId: crop.id,
      habitat: crop.habitat.category,
      position: crop.habitat.worldFocusPoint,
      emerged: startEmerged,
      growthProgress: startEmerged ? 1 : 0,
      sunlightMet: startEmerged,
      available: startEmerged,
      respawnTimer: 0,
      spawnCheckTimer: startEmerged ? 0 : 2 + Math.random() * 3,
    };
  });
}

function createInitialSeeds(): Record<CropId, number> {
  return {
    sweet_potato: 3,
    potato: 3,
    buckwheat: 3,
    sorghum: 3,
    corn: 3,
    barley: 3,
    pumpkin: 2,
    doraji: 2,
    kudzu: 2,
    yam: 2,
    millet: 3,
    shepherds_purse: 2,
    mugwort: 2,
    jerusalem_artichoke: 2,
  };
}

function createInitialBasket(): Record<CropId, number> {
  return {
    sweet_potato: 0,
    potato: 0,
    buckwheat: 0,
    sorghum: 0,
    corn: 0,
    barley: 0,
    pumpkin: 0,
    doraji: 0,
    kudzu: 0,
    yam: 0,
    millet: 0,
    shepherds_purse: 0,
    mugwort: 0,
    jerusalem_artichoke: 0,
  };
}

interface SavedState {
  discoveries?: Record<string, DiscoveryProgress>;
  basket?: Record<CropId, number>;
  seeds?: Record<CropId, number>;
  dayOfYear?: number;
  timeHours?: number;
}

function loadSavedState(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SavedState;
  } catch {
    return {};
  }
}

function targetsEqual(a: TargetRef | null, b: TargetRef | null): boolean {
  if (!a || !b) return false;
  return a.kind === b.kind && a.id === b.id;
}

function nextAutoWeather(current: WeatherType, season: SeasonType): WeatherType {
  const r = Math.random();
  if (season === 'winter') {
    if (current === 'snow') return r < 0.5 ? 'cloudy' : 'clear';
    if (current === 'cloudy') return r < 0.62 ? 'snow' : 'clear';
    return r < 0.55 ? 'snow' : 'cloudy';
  }
  if (season === 'summer') {
    if (current === 'clear') return r < 0.58 ? 'cloudy' : 'rain';
    if (current === 'cloudy') return r < 0.55 ? 'rain' : 'clear';
    return r < 0.68 ? 'clear' : 'cloudy';
  }
  // spring or autumn
  if (current === 'clear') return r < 0.62 ? 'cloudy' : r < 0.94 ? 'rain' : 'snow';
  if (current === 'cloudy') return r < 0.56 ? 'rain' : r < 0.94 ? 'clear' : 'snow';
  return r < 0.68 ? 'clear' : 'cloudy';
}

export default function App() {
  const initialSave = useMemo(() => loadSavedState(), []);

  const [plots, setPlots] = useState<FarmPlotState[]>(createInitialPlots);
  const [wildSpecimens, setWildSpecimens] = useState<WildSpecimenState[]>(createInitialWildSpecimens);
  const [seeds, setSeeds] = useState<Record<CropId, number>>(() => ({
    ...createInitialSeeds(),
    ...(initialSave.seeds ?? {}),
  }));
  const [basket, setBasket] = useState<Record<CropId, number>>(() => ({
    ...createInitialBasket(),
    ...(initialSave.basket ?? {}),
  }));
  const [discoveries, setDiscoveries] = useState<Record<string, DiscoveryProgress>>(
    () => initialSave.discoveries ?? {},
  );

  const [activeTool, setActiveTool] = useState<ToolMode>('harvest');
  const [selectedSeed, setSelectedSeed] = useState<CropId>('sweet_potato');
  const [focusedTarget, setFocusedTarget] = useState<TargetRef | null>(null);
  const [hoveredTarget, setHoveredTarget] = useState<TargetRef | null>(null);
  const [suppressedHoverTarget, setSuppressedHoverTarget] = useState<TargetRef | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [qHoldProgress, setQHoldProgress] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [growthSpeed, setGrowthSpeed] = useState<1 | 3 | 10>(1);
  const [worldClock, setWorldClock] = useState<{ dayOfYear: number; timeHours: number }>(() => ({
    dayOfYear:
      typeof initialSave.dayOfYear === 'number'
        ? normalizeDayOfYear(initialSave.dayOfYear)
        : 100, // 4월 10일 한봄
    timeHours:
      typeof initialSave.timeHours === 'number' && Number.isFinite(initialSave.timeHours)
        ? ((initialSave.timeHours % 24) + 24) % 24
        : 7.5, // 오전 7:30
  }));
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [autoCycle, setAutoCycle] = useState(true);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);

  const [bagOpen, setBagOpen] = useState(false);
  const [compendiumOpen, setCompendiumOpen] = useState(false);
  const [compendiumCropId, setCompendiumCropId] = useState<CropId>('sweet_potato');
  const [feedback, setFeedback] = useState<SelectionFeedback | null>(null);

  const [cameraCommand, setCameraCommand] = useState<CameraTargetCommand | null>(null);
  const [burstCommand, setBurstCommand] = useState<ParticleBurstCommand | null>(null);
  const nonceRef = useRef(1);

  const weatherTimerRef = useRef(0);

  const calendar = useMemo(
    () => getCalendarInfo(worldClock.dayOfYear, worldClock.timeHours),
    [worldClock.dayOfYear, worldClock.timeHours],
  );

  const growthSpeedRef = useRef(growthSpeed);
  growthSpeedRef.current = growthSpeed;
  const sunPresetRef = useRef<SunPreset>(calendar.sunPreset);
  sunPresetRef.current = calendar.sunPreset;
  const seasonRef = useRef<SeasonType>(calendar.season);
  seasonRef.current = calendar.season;
  const weatherRef = useRef(weather);
  weatherRef.current = weather;
  const autoCycleRef = useRef(autoCycle);
  autoCycleRef.current = autoCycle;

  const triggerBurst = useCallback((position: [number, number, number], colorHex: string) => {
    nonceRef.current += 1;
    setBurstCommand({ position, colorHex, nonce: nonceRef.current });
  }, []);

  const flyCameraTo = useCallback(
    (position: [number, number, number], target: [number, number, number]) => {
      nonceRef.current += 1;
      setCameraCommand({ position, target, nonce: nonceRef.current });
    },
    [],
  );

  // Clear suppressed hover once pointer leaves that target
  const handleHoverTarget = useCallback((target: TargetRef | null) => {
    setHoveredTarget(target);
    setSuppressedHoverTarget((prev) => {
      if (!prev) return null;
      if (!target || !targetsEqual(prev, target)) return null;
      return prev;
    });
  }, []);

  const handleManualSunPreset = useCallback((nextSun: SunPreset) => {
    const nextHours = getTimeHoursForSunPreset(nextSun);
    setWorldClock((prev) => ({ ...prev, timeHours: nextHours }));
  }, []);

  const handleManualSeason = useCallback((nextSeason: SeasonType) => {
    const nextDay = getDayOfYearForSeason(nextSeason);
    setWorldClock((prev) => ({ ...prev, dayOfYear: nextDay }));
  }, []);

  const handleManualWeather = useCallback((nextWeather: WeatherType) => {
    weatherTimerRef.current = 0;
    setWeather(nextWeather);
  }, []);

  const handleExportZip = useCallback(async () => {
    if (exportingZip) return;
    setExportingZip(true);
    try {
      const count = await downloadProjectZip();
      setFocusedTarget(null);
      setDetailsOpen(false);
      setFeedback({
        title: `프로젝트 소스코드 .zip 다운로드 완료 (${count}개 파일)`,
        subtitle: '압축을 해제한 뒤 GitHub에 올리고 Vercel에서 Vite 프로젝트로 바로 배포할 수 있습니다.',
        compactTitle: '소스코드 .zip 다운로드 완료',
        compactSubtitle: `${count}개 파일 (GitHub · Vercel 배포용)`,
      });
    } catch {
      setFeedback({
        title: 'ZIP 파일 생성에 실패했습니다',
        subtitle: '잠시 후 다시 시도해 주세요.',
        compactTitle: 'ZIP 다운로드 실패',
        compactSubtitle: '잠시 후 다시 시도해 주세요.',
      });
    } finally {
      setExportingZip(false);
    }
  }, [exportingZip]);

  // Persist discoveries, basket, seeds, and 365-day calendar
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          discoveries,
          basket,
          seeds,
          dayOfYear: worldClock.dayOfYear,
          timeHours: worldClock.timeHours,
        }),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [discoveries, basket, seeds, worldClock.dayOfYear, worldClock.timeHours]);

  // Simulation loop (200ms step): 1 in-game day = 1 real minute (60s) at 1x speed, 365-day cycle, seasonal/snow weather
  useEffect(() => {
    const interval = window.setInterval(() => {
      const dt = 0.2 * growthSpeedRef.current;
      const curSun = sunPresetRef.current;
      const curSeason = seasonRef.current;
      const curWeather = weatherRef.current;

      // Advance 24h clock (24 hours / 60 seconds = 0.4 hours per real second at 1x) & 365-day calendar
      if (autoCycleRef.current) {
        const deltaHours = dt * 0.4;
        setWorldClock((prev) => {
          const totalH = prev.timeHours + deltaHours;
          if (totalH >= 24) {
            const addDays = Math.floor(totalH / 24);
            return {
              dayOfYear: normalizeDayOfYear(prev.dayOfYear + addDays),
              timeHours: totalH % 24,
            };
          }
          return {
            dayOfYear: prev.dayOfYear,
            timeHours: totalH,
          };
        });

        weatherTimerRef.current += dt;
        if (weatherTimerRef.current >= 20) {
          weatherTimerRef.current = 0;
          setWeather((prev) => nextAutoWeather(prev, seasonRef.current));
        }
      }

      // Weather evaporation & hydration multipliers
      const evapMultiplier =
        curWeather === 'clear'
          ? 1.25
          : curWeather === 'cloudy'
            ? 0.55
            : curWeather === 'snow'
              ? 0.15
              : 0;

      setPlots((prev) =>
        prev.map((p) => {
          if (!p.cropId || p.mature) {
            if (curWeather === 'rain' && p.soil === 'tilled') {
              const nextWater = Math.min(1, p.waterLevel + dt * 0.085);
              return { ...p, waterLevel: nextWater, watered: nextWater > 0.05 };
            }
            if (p.watered && p.waterLevel > 0) {
              const nextWater = Math.max(0, p.waterLevel - dt * 0.022 * evapMultiplier);
              return { ...p, waterLevel: nextWater, watered: nextWater > 0.05 };
            }
            return p;
          }

          const crop = CROP_MAP[p.cropId];
          const {
            waterConsumptionPerSec,
            droughtPenaltyFactor,
            optimalSun,
            sunlightBonusFactor,
            sunNeed,
            requiredWaterings,
            drainRequiredBeforeHarvest,
          } = crop.cultivation;

          let nextWater = p.waterLevel;
          let nextWateringsCount = p.wateringsCount;

          if (curWeather === 'rain') {
            nextWater = Math.min(1, p.waterLevel + dt * 0.095);
            if (p.waterLevel < 0.8 && nextWater >= 0.8) {
              nextWateringsCount += 1;
            }
          } else if (curWeather === 'snow') {
            nextWater = Math.min(1, Math.max(p.waterLevel, 0.25) + dt * 0.015);
          } else if (p.watered) {
            const baseDrain =
              drainRequiredBeforeHarvest && p.waterLevel > 0.72
                ? Math.max(waterConsumptionPerSec, 0.032)
                : waterConsumptionPerSec;
            nextWater = Math.max(0, p.waterLevel - dt * baseDrain * evapMultiplier);
          } else {
            nextWater = 0;
          }

          const nextSunlightMet =
            p.sunlightMet || isSunlightMatching(curSun, curWeather, crop);

          const isWateredNow = nextWater > 0.05;
          const moistureFactor = isWateredNow ? 1.72 : droughtPenaltyFactor;

          let sunFactor = 1.0;
          if (curSun === optimalSun) {
            sunFactor = sunlightBonusFactor;
          } else if (curSun === 'noon' && sunNeed === 'high') {
            sunFactor = 1.2;
          } else if (curSun === 'sunset' && sunNeed === 'high') {
            sunFactor = 0.85;
          } else if (curSun === 'night') {
            sunFactor = 0.78;
          }

          let weatherGrowthFactor = 1.0;
          if (curWeather === 'rain') {
            weatherGrowthFactor = sunNeed === 'high' ? 0.68 : 0.88;
          } else if (curWeather === 'snow') {
            weatherGrowthFactor = COLD_HARDY_CROPS.has(p.cropId) ? 0.85 : 0.56;
          } else if (curWeather === 'cloudy') {
            weatherGrowthFactor = sunNeed === 'high' ? 0.8 : sunNeed === 'low' ? 1.08 : 0.95;
          } else if (sunNeed === 'high') {
            weatherGrowthFactor = 1.15;
          }

          const moistureMet =
            nextWateringsCount >= requiredWaterings &&
            (!drainRequiredBeforeHarvest || nextWater <= 0.72);
          const allConditionsMet = moistureMet && nextSunlightMet;

          const deltaProgress =
            (dt / crop.growthDurationSec) * moistureFactor * sunFactor * weatherGrowthFactor;
          const rawNext = p.growthProgress + deltaProgress;
          const nextProgress = allConditionsMet
            ? Math.min(1, rawNext)
            : Math.min(0.94, rawNext);

          return {
            ...p,
            wateringsCount: nextWateringsCount,
            sunlightMet: nextSunlightMet,
            growthProgress: nextProgress,
            mature: allConditionsMet && nextProgress >= 1,
            waterLevel: nextWater,
            watered: isWateredNow,
          };
        }),
      );

      // Probabilistic & seasonal/weather-gated wild specimen spawning + growth
      setWildSpecimens((prev) =>
        prev.map((w) => {
          if (w.available) return w;
          const crop = CROP_MAP[w.cropId];
          const condMatches =
            crop.wildSpawn.allowedSeasons.includes(curSeason) &&
            crop.wildSpawn.allowedSuns.includes(curSun) &&
            crop.wildSpawn.allowedWeathers.includes(curWeather);

          if (!w.emerged) {
            const nextRespawn = Math.max(0, w.respawnTimer - dt);
            if (nextRespawn > 0) {
              return { ...w, respawnTimer: nextRespawn };
            }

            if (!condMatches) {
              return {
                ...w,
                respawnTimer: 0,
                spawnCheckTimer: Math.min(w.spawnCheckTimer, 1.5),
              };
            }

            const nextCheck = w.spawnCheckTimer - dt;
            if (nextCheck > 0) {
              return { ...w, respawnTimer: 0, spawnCheckTimer: nextCheck };
            }

            if (Math.random() < crop.wildSpawn.spawnChance) {
              return {
                ...w,
                emerged: true,
                growthProgress: 0.25,
                sunlightMet: true,
                available: false,
                respawnTimer: 0,
                spawnCheckTimer: 4.5,
              };
            }

            return {
              ...w,
              respawnTimer: 0,
              spawnCheckTimer: 4.5,
            };
          }

          const nextSunlightMet =
            w.sunlightMet || condMatches || isSunlightMatching(curSun, curWeather, crop);
          const weatherBoost =
            (curWeather === 'rain' || curWeather === 'snow') &&
            crop.wildSpawn.allowedWeathers.includes(curWeather)
              ? 1.2
              : 1.0;
          const rawNext = w.growthProgress + (dt * weatherBoost) / (crop.growthDurationSec * 1.05);
          const nextProgress = nextSunlightMet
            ? Math.min(1, rawNext)
            : Math.min(0.94, rawNext);
          const ready = nextSunlightMet && nextProgress >= 1;

          return {
            ...w,
            sunlightMet: nextSunlightMet,
            growthProgress: nextProgress,
            available: ready,
          };
        }),
      );
    }, 200);

    return () => window.clearInterval(interval);
  }, []);

  const registerCropDiscovery = useCallback(
    (cropId: CropId, source: 'farm' | 'wild'): boolean => {
      const wasAlreadyDiscovered = Boolean(discoveries[cropId]);
      setDiscoveries((prev) => {
        const existing = prev[cropId];
        return {
          ...prev,
          [cropId]: {
            discoveredAt: existing?.discoveredAt ?? new Date().toISOString(),
            foragedCount: (existing?.foragedCount ?? 0) + (source === 'wild' ? 1 : 0),
            farmedCount: (existing?.farmedCount ?? 0) + (source === 'farm' ? 1 : 0),
          },
        };
      });
      return !wasAlreadyDiscovered;
    },
    [discoveries],
  );

  const harvestPlot = useCallback(
    (plotId: string) => {
      const plot = plots.find((p) => p.id === plotId);
      if (!plot || !plot.cropId || !plot.mature) return;
      const crop = CROP_MAP[plot.cropId];
      const isNew = registerCropDiscovery(crop.id, 'farm');
      farmAudio.playHarvest(isNew);
      triggerBurst(plot.position, crop.accentHex);

      setBasket((prev) => ({
        ...prev,
        [crop.id]: (prev[crop.id] ?? 0) + crop.harvestYield,
      }));
      setSeeds((prev) => ({
        ...prev,
        [crop.id]: (prev[crop.id] ?? 0) + crop.seedYield,
      }));
      setPlots((prev) =>
        prev.map((p) =>
          p.id === plotId
            ? {
                ...p,
                cropId: null,
                growthProgress: 0,
                mature: false,
                wateringsCount: 0,
                sunlightMet: false,
              }
            : p,
        ),
      );

      setFocusedTarget(null);
      setSuppressedHoverTarget({ kind: 'plot', id: plotId });
      setFeedback({
        title: `${crop.nameKo} 수확 완료 (+${crop.harvestYield}개 · 씨앗 +${crop.seedYield})`,
        subtitle: crop.summary,
        cropId: crop.id,
        isNewDiscovery: isNew,
        actionHint: '도감 보기 또는 [M] 가방에서 수확물과 상세 효능을 확인하세요.',
      });
    },
    [plots, registerCropDiscovery, triggerBurst],
  );

  const forageWild = useCallback(
    (wildId: string) => {
      const specimen = wildSpecimens.find((w) => w.id === wildId);
      if (!specimen || !specimen.emerged || !specimen.available) return;
      const crop = CROP_MAP[specimen.cropId];
      const isNew = registerCropDiscovery(crop.id, 'wild');
      farmAudio.playHarvest(isNew);
      triggerBurst(specimen.position, crop.accentHex);

      setBasket((prev) => ({
        ...prev,
        [crop.id]: (prev[crop.id] ?? 0) + 1,
      }));
      setSeeds((prev) => ({
        ...prev,
        [crop.id]: (prev[crop.id] ?? 0) + crop.seedYield,
      }));
      setWildSpecimens((prev) =>
        prev.map((w) =>
          w.id === wildId
            ? {
                ...w,
                emerged: false,
                growthProgress: 0,
                sunlightMet: false,
                available: false,
                respawnTimer: crop.wildSpawn.minRespawnSec,
                spawnCheckTimer: 4.5,
              }
            : w,
        ),
      );

      setFocusedTarget(null);
      setSuppressedHoverTarget({ kind: 'wild', id: wildId });
      setFeedback({
        title: `야생 ${crop.nameKo} 채집 성공! (씨앗 +${crop.seedYield})`,
        subtitle: `서식지: ${crop.habitat.zoneName} — ${crop.summary}`,
        cropId: crop.id,
        isNewDiscovery: isNew,
        actionHint: '도감 보기를 눌러 상세한 서식 환경·영양분·효능을 확인해 보세요.',
      });
    },
    [registerCropDiscovery, triggerBurst, wildSpecimens],
  );

  // Determine currently harvestable target (prioritize hovered target if valid, else focused target)
  const isTargetHarvestable = useCallback(
    (target: TargetRef | null): boolean => {
      if (!target) return false;
      if (target.kind === 'plot') {
        const p = plots.find((item) => item.id === target.id);
        return Boolean(p && p.cropId && p.mature);
      }
      const w = wildSpecimens.find((item) => item.id === target.id);
      return Boolean(w && w.emerged && w.available);
    },
    [plots, wildSpecimens],
  );

  const activeHarvestTarget = useMemo<TargetRef | null>(() => {
    if (isTargetHarvestable(hoveredTarget)) return hoveredTarget;
    if (isTargetHarvestable(focusedTarget)) return focusedTarget;
    return null;
  }, [focusedTarget, hoveredTarget, isTargetHarvestable]);

  const activeHarvestTargetRef = useRef<TargetRef | null>(null);
  activeHarvestTargetRef.current = activeHarvestTarget;

  const inspectTargetRef = useRef<TargetRef | null>(null);
  inspectTargetRef.current = hoveredTarget ?? focusedTarget;

  const harvestExecutorRef = useRef<(target: TargetRef) => void>(() => {});
  harvestExecutorRef.current = (target: TargetRef) => {
    if (target.kind === 'plot') {
      harvestPlot(target.id);
    } else {
      forageWild(target.id);
    }
  };

  const plotsRef = useRef(plots);
  plotsRef.current = plots;
  const wildRef = useRef(wildSpecimens);
  wildRef.current = wildSpecimens;
  const modalOpenRef = useRef(false);
  modalOpenRef.current = compendiumOpen || bagOpen;

  const holdRafRef = useRef<number | null>(null);
  const holdingTargetKeyRef = useRef<string | null>(null);
  const qHoldRafRef = useRef<number | null>(null);
  const holdingQRef = useRef<boolean>(false);

  const cancelHold = useCallback(() => {
    if (holdRafRef.current !== null) {
      cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = null;
    }
    holdingTargetKeyRef.current = null;
    setHoldProgress(0);
  }, []);

  const cancelQHold = useCallback(() => {
    if (qHoldRafRef.current !== null) {
      cancelAnimationFrame(qHoldRafRef.current);
      qHoldRafRef.current = null;
    }
    holdingQRef.current = false;
    setQHoldProgress(0);
  }, []);

  // Cancel active hold if target changes or disappears mid-hold
  useEffect(() => {
    if (!holdingTargetKeyRef.current) return;
    const currentKey = activeHarvestTarget
      ? `${activeHarvestTarget.kind}:${activeHarvestTarget.id}`
      : null;
    if (currentKey !== holdingTargetKeyRef.current) {
      cancelHold();
    }
  }, [activeHarvestTarget, cancelHold]);

  // Collapse details back to compact bar whenever user hovers/focuses a different target
  const activeInspectTarget = hoveredTarget && !targetsEqual(hoveredTarget, suppressedHoverTarget)
    ? hoveredTarget
    : focusedTarget;
  const activeInspectKey = activeInspectTarget
    ? `${activeInspectTarget.kind}:${activeInspectTarget.id}`
    : null;
  const activeInspectKeyRef = useRef<string | null>(activeInspectKey);
  activeInspectKeyRef.current = activeInspectKey;

  useEffect(() => {
    cancelQHold();
    setDetailsOpen(false);
  }, [activeInspectKey, cancelQHold]);

  // Keyboard shortcuts ('KeyF' hold to harvest/forage, 'KeyQ' hold to show conditions/habitat, 'KeyM' bag, 'KeyH' features, 'Escape' close)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'KeyM') {
        if (e.repeat) return;
        cancelHold();
        cancelQHold();
        setCompendiumOpen(false);
        setShowHelp(false);
        setFeaturesOpen(false);
        setBagOpen((prev) => !prev);
        farmAudio.playPageOpen();
        return;
      }

      if (e.code === 'KeyH') {
        if (e.repeat) return;
        setFeaturesOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        cancelHold();
        cancelQHold();
        setBagOpen(false);
        setCompendiumOpen(false);
        setShowHelp(false);
        setFeaturesOpen(false);
        setDetailsOpen(false);
        return;
      }

      if (e.code === 'KeyQ') {
        if (e.repeat || modalOpenRef.current) return;
        if (!inspectTargetRef.current) return;
        if (holdingQRef.current) return;

        holdingQRef.current = true;
        const startTime = performance.now();
        const startTargetKey = activeInspectKeyRef.current;

        const stepQ = (now: number) => {
          if (!holdingQRef.current || activeInspectKeyRef.current !== startTargetKey) {
            cancelQHold();
            return;
          }
          const progress = Math.min(1, (now - startTime) / HOLD_INSPECT_MS);
          setQHoldProgress(progress);

          if (progress >= 1) {
            qHoldRafRef.current = null;
            holdingQRef.current = false;
            setQHoldProgress(0);
            setDetailsOpen(true);
          } else {
            qHoldRafRef.current = requestAnimationFrame(stepQ);
          }
        };

        qHoldRafRef.current = requestAnimationFrame(stepQ);
        return;
      }

      if (e.code === 'KeyF') {
        if (e.repeat || modalOpenRef.current) return;

        const target = activeHarvestTargetRef.current;
        if (!target) {
          const inspect = inspectTargetRef.current;
          if (inspect?.kind === 'plot') {
            const p = plotsRef.current.find((item) => item.id === inspect.id);
            if (p?.cropId && !p.mature) {
              setFocusedTarget(inspect);
              setSuppressedHoverTarget(null);
              setFeedback(buildPlotFeedback(p, weatherRef.current));
            }
          } else if (inspect?.kind === 'wild') {
            const w = wildRef.current.find((item) => item.id === inspect.id);
            if (w && !w.available) {
              setFocusedTarget(inspect);
              setSuppressedHoverTarget(null);
              setFeedback(
                buildWildFeedback(w, seasonRef.current, sunPresetRef.current, weatherRef.current),
              );
            }
          }
          return;
        }

        const targetKey = `${target.kind}:${target.id}`;
        if (holdingTargetKeyRef.current === targetKey) return;

        holdingTargetKeyRef.current = targetKey;
        const startTime = performance.now();

        const step = (now: number) => {
          if (holdingTargetKeyRef.current !== targetKey) return;
          const currentActive = activeHarvestTargetRef.current;
          if (!currentActive || `${currentActive.kind}:${currentActive.id}` !== targetKey) {
            cancelHold();
            return;
          }

          const progress = Math.min(1, (now - startTime) / HOLD_HARVEST_MS);
          setHoldProgress(progress);

          if (progress >= 1) {
            holdRafRef.current = null;
            holdingTargetKeyRef.current = null;
            setHoldProgress(0);
            harvestExecutorRef.current(currentActive);
          } else {
            holdRafRef.current = requestAnimationFrame(step);
          }
        };

        holdRafRef.current = requestAnimationFrame(step);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyF') {
        cancelHold();
      } else if (e.code === 'KeyQ') {
        cancelQHold();
      }
    };

    const onBlur = () => {
      cancelHold();
      cancelQHold();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      cancelHold();
      cancelQHold();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [cancelHold, cancelQHold]);

  const handlePlotClick = useCallback(
    (plotId: string) => {
      const target: TargetRef = { kind: 'plot', id: plotId };
      setFocusedTarget(target);
      setSuppressedHoverTarget(null);

      const plot = plots.find((p) => p.id === plotId);
      if (!plot) return;

      if (activeTool === 'till') {
        if (plot.soil === 'fallow') {
          farmAudio.playTill();
          triggerBurst(plot.position, '#7a5c42');
          setPlots((prev) =>
            prev.map((p) => (p.id === plotId ? { ...p, soil: 'tilled' } : p)),
          );
          setFeedback({
            title: `${plot.index + 1}번 밭을 갈았습니다`,
            subtitle: '이제 [H] 기능 탭에서 [심기] 도구를 선택해 구황작물을 심을 수 있습니다.',
          });
        } else {
          setFeedback({
            title: `${plot.index + 1}번 밭은 이미 갈려 있습니다`,
            subtitle: plot.cropId
              ? `${CROP_MAP[plot.cropId].nameKo}이(가) 자라고 있습니다.`
              : '심기 도구를 선택해 씨앗을 심어보세요.',
            cropId: plot.cropId ?? undefined,
          });
        }
        return;
      }

      if (activeTool === 'plant') {
        if (plot.soil === 'fallow') {
          setFeedback({
            title: '먼저 밭을 갈아야 합니다',
            subtitle: '[H] 기능 탭에서 [밭 갈기]를 선택한 뒤 빈 밭을 클릭하세요.',
          });
          return;
        }
        if (plot.cropId) {
          setFeedback(buildPlotFeedback(plot, weather));
          return;
        }
        const seedCount = seeds[selectedSeed] ?? 0;
        if (seedCount <= 0) {
          setFeedback({
            title: `${CROP_MAP[selectedSeed].nameKo} 씨앗이 부족합니다`,
            subtitle: '주변 서식지에서 야생 개체를 채집하면 씨앗을 얻을 수 있습니다.',
          });
          return;
        }

        const crop = CROP_MAP[selectedSeed];
        farmAudio.playPlant();
        triggerBurst(plot.position, '#8fc46e');
        setSeeds((prev) => ({
          ...prev,
          [selectedSeed]: Math.max(0, (prev[selectedSeed] ?? 0) - 1),
        }));
        const nextSunMet = isSunlightMatching(calendar.sunPreset, weather, crop);
        setPlots((prev) =>
          prev.map((p) =>
            p.id === plotId
              ? {
                  ...p,
                  cropId: selectedSeed,
                  growthProgress: 0.05,
                  mature: false,
                  wateringsCount: p.watered ? 1 : 0,
                  sunlightMet: nextSunMet,
                }
              : p,
          ),
        );
        setFeedback({
          title: `${plot.index + 1}번 밭에 ${crop.nameKo} 씨앗을 심었습니다`,
          subtitle: `조건: ${crop.cultivation.conditionSummary}`,
          compactTitle: `${plot.index + 1}번 밭 · ${crop.nameKo} 파종`,
          compactSubtitle: '생육 시작 (5%)',
          cropId: crop.id,
          actionHint: '조건을 모두 달성하고 100% 자라면 [F] 키를 꾹 눌러 수확하세요.',
        });
        return;
      }

      if (activeTool === 'water') {
        if (plot.soil === 'fallow') {
          setFeedback({
            title: '빈 땅에는 물을 줄 수 없습니다',
            subtitle: '먼저 밭 갈기와 심기를 진행해 주세요.',
          });
          return;
        }
        farmAudio.playWater();
        triggerBurst(plot.position, '#5eb9d4');
        const nextPlot: FarmPlotState = {
          ...plot,
          watered: true,
          waterLevel: 1,
          wateringsCount: plot.wateringsCount + 1,
        };
        setPlots((prev) =>
          prev.map((p) => (p.id === plotId ? nextPlot : p)),
        );
        if (nextPlot.cropId) {
          setFeedback(buildPlotFeedback(nextPlot, weather));
        } else {
          setFeedback({
            title: `${plot.index + 1}번 밭에 물을 주었습니다`,
            subtitle: '촉촉한 토양에 씨앗을 심으면 빠르게 싹이 틉니다.',
          });
        }
        return;
      }

      // Inspect or Harvest tool click: select target and display conditions + [F] hold prompt
      setFeedback(buildPlotFeedback(plot, weather));
    },
    [activeTool, calendar.sunPreset, plots, seeds, selectedSeed, triggerBurst, weather],
  );

  const handleWildClick = useCallback(
    (wildId: string) => {
      const target: TargetRef = { kind: 'wild', id: wildId };
      setFocusedTarget(target);
      setSuppressedHoverTarget(null);

      const specimen = wildSpecimens.find((w) => w.id === wildId);
      if (!specimen) return;
      setFeedback(buildWildFeedback(specimen, calendar.season, calendar.sunPreset, weather));
    },
    [calendar.season, calendar.sunPreset, weather, wildSpecimens],
  );

  const handleLocateInWorld = useCallback(
    (crop: ReliefCropData) => {
      setCompendiumOpen(false);
      setBagOpen(false);
      const wildId = `wild-${crop.id}`;
      setFocusedTarget({ kind: 'wild', id: wildId });
      setSuppressedHoverTarget(null);
      const [wx, wy, wz] = crop.habitat.worldFocusPoint;
      const camPos: [number, number, number] = [
        wx * 0.55,
        wy + 5.6,
        wz + (wz >= 0 ? 7.5 : 8.5),
      ];
      flyCameraTo(camPos, [wx, wy + 0.4, wz]);
      const specimen = wildSpecimens.find((w) => w.id === wildId);
      if (specimen) {
        setFeedback(buildWildFeedback(specimen, calendar.season, calendar.sunPreset, weather));
      } else {
        setFeedback({
          title: `${crop.nameKo} 서식지 · ${crop.habitat.zoneName}`,
          subtitle: crop.habitat.soilType,
          cropId: crop.id,
          actionHint: '야생 개체가 완전히 자랐다면 [F] 키를 꾹 눌러 채집할 수 있습니다.',
        });
      }
    },
    [calendar.season, calendar.sunPreset, flyCameraTo, weather, wildSpecimens],
  );

  // Live inspector feedback driven by hovered/focused target so conditions & [F] prompt update in real time
  const displayedFeedback = useMemo<SelectionFeedback | null>(() => {
    const activeHover =
      hoveredTarget && !targetsEqual(hoveredTarget, suppressedHoverTarget)
        ? hoveredTarget
        : null;

    if (activeHover) {
      if (activeHover.kind === 'plot') {
        const p = plots.find((item) => item.id === activeHover.id);
        if (p?.cropId) {
          return buildPlotFeedback(p, weather);
        }
      } else {
        const w = wildSpecimens.find((item) => item.id === activeHover.id);
        if (w) {
          return buildWildFeedback(w, calendar.season, calendar.sunPreset, weather);
        }
      }
    }

    if (focusedTarget) {
      if (focusedTarget.kind === 'plot') {
        const p = plots.find((item) => item.id === focusedTarget.id);
        if (p?.cropId) {
          return buildPlotFeedback(p, weather);
        }
      } else {
        const w = wildSpecimens.find((item) => item.id === focusedTarget.id);
        if (w) {
          return buildWildFeedback(w, calendar.season, calendar.sunPreset, weather);
        }
      }
    }

    return feedback;
  }, [
    calendar.season,
    calendar.sunPreset,
    feedback,
    focusedTarget,
    hoveredTarget,
    plots,
    suppressedHoverTarget,
    weather,
    wildSpecimens,
  ]);

  const discoveredCount = useMemo(
    () => RELIEF_CROPS.filter((c) => Boolean(discoveries[c.id])).length,
    [discoveries],
  );

  const totalHarvests = useMemo(
    () => Object.values(basket).reduce((sum, count) => sum + count, 0),
    [basket],
  );

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#1a201b]">
      {/* Full-Bleed 3D Three.js World */}
      <FarmWorld
        plots={plots}
        wildSpecimens={wildSpecimens}
        timeHours={worldClock.timeHours}
        dayOfYear={worldClock.dayOfYear}
        season={calendar.season}
        weather={weather}
        freeCamPaused={bagOpen || compendiumOpen}
        cameraCommand={cameraCommand}
        burstCommand={burstCommand}
        focusedTarget={focusedTarget}
        onPlotClick={handlePlotClick}
        onWildClick={handleWildClick}
        onHoverChange={setHoverLabel}
        onHoverTarget={handleHoverTarget}
      />

      {/* Minimal Top Bar & Toggleable [H] Features Panel */}
      <FarmHud
        activeTool={activeTool}
        selectedSeed={selectedSeed}
        discoveredCount={discoveredCount}
        totalHarvests={totalHarvests}
        growthSpeed={growthSpeed}
        calendar={calendar}
        weather={weather}
        autoCycle={autoCycle}
        headerCollapsed={headerCollapsed}
        featuresOpen={featuresOpen}
        muted={muted}
        hoverLabel={hoverLabel}
        showHelp={showHelp}
        onSelectTool={setActiveTool}
        onChangeGrowthSpeed={setGrowthSpeed}
        onChangeSeason={handleManualSeason}
        onChangeSunPreset={handleManualSunPreset}
        onChangeWeather={handleManualWeather}
        onToggleAutoCycle={() => setAutoCycle((prev) => !prev)}
        onCameraPreset={(preset: CameraFocusPreset) => {
          const coords = getPresetCameraCoords(preset);
          flyCameraTo(coords.position, coords.target);
        }}
        onToggleHeader={() => setHeaderCollapsed((prev) => !prev)}
        onToggleFeatures={() => setFeaturesOpen((prev) => !prev)}
        onOpenBag={() => {
          farmAudio.playPageOpen();
          setShowHelp(false);
          setCompendiumOpen(false);
          setFeaturesOpen(false);
          setBagOpen(true);
        }}
        onOpenCompendium={() => {
          farmAudio.playPageOpen();
          setShowHelp(false);
          setBagOpen(false);
          setFeaturesOpen(false);
          setCompendiumOpen(true);
        }}
        onToggleMute={() => {
          const next = !muted;
          farmAudio.muted = next;
          setMuted(next);
        }}
        onToggleHelp={() => setShowHelp((prev) => !prev)}
      />

      {/* Compact-by-default Inspector Toast (Hold Q to reveal conditions & habitat) */}
      {!compendiumOpen && !bagOpen && !showHelp && (
        <CropInspectorToast
          feedback={displayedFeedback}
          holdProgress={holdProgress}
          qHoldProgress={qHoldProgress}
          detailsOpen={detailsOpen}
          headerCollapsed={headerCollapsed}
          onOpenDetails={() => setDetailsOpen(true)}
          onCollapseDetails={() => setDetailsOpen(false)}
          onOpenCropInCompendium={(cropId) => {
            farmAudio.playPageOpen();
            setCompendiumCropId(cropId);
            setCompendiumOpen(true);
          }}
          onDismiss={() => {
            setFeedback(null);
            setFocusedTarget(null);
            setDetailsOpen(false);
            if (hoveredTarget) {
              setSuppressedHoverTarget(hoveredTarget);
            }
          }}
        />
      )}

      {/* Farmer Bag Modal (Seeds & Harvested Crops) */}
      <BagModal
        isOpen={bagOpen}
        seeds={seeds}
        basket={basket}
        discoveries={discoveries}
        onSelectSeedToPlant={(cropId) => {
          setSelectedSeed(cropId);
          setActiveTool('plant');
          setBagOpen(false);
          const coords = getPresetCameraCoords('farm');
          flyCameraTo(coords.position, coords.target);
          setFocusedTarget(null);
          setFeedback({
            title: `${CROP_MAP[cropId].nameKo} 씨앗 선택됨`,
            subtitle: '갈아둔 농장 밭을 클릭해 심어보세요.',
            cropId,
          });
        }}
        onOpenCropInCompendium={(cropId) => {
          farmAudio.playPageOpen();
          setBagOpen(false);
          setCompendiumCropId(cropId);
          setCompendiumOpen(true);
        }}
        onClose={() => setBagOpen(false)}
      />

      {/* Botanical Compendium Modal */}
      <CompendiumModal
        isOpen={compendiumOpen}
        selectedCropId={compendiumCropId}
        discoveries={discoveries}
        basket={basket}
        onSelectCrop={(id) => {
          farmAudio.playPageOpen();
          setCompendiumCropId(id);
        }}
        onLocateInWorld={handleLocateInWorld}
        onSelectSeedAndClose={(cropId) => {
          setSelectedSeed(cropId);
          setActiveTool('plant');
          setCompendiumOpen(false);
          const coords = getPresetCameraCoords('farm');
          flyCameraTo(coords.position, coords.target);
          setFocusedTarget(null);
          setFeedback({
            title: `${CROP_MAP[cropId].nameKo} 씨앗 선택됨`,
            subtitle: '갈아둔 농장 밭을 클릭해 심어보세요.',
            cropId,
          });
        }}
        onClose={() => setCompendiumOpen(false)}
      />

      {/* Dev-only .zip exporter (excluded from Vercel/production builds) */}
      {import.meta.env.DEV && (
        <button
          type="button"
          onClick={handleExportZip}
          disabled={exportingZip}
          title="개발 환경(AI Studio)에서만 표시됩니다. 배포된 사이트에서는 자동으로 숨겨집니다."
          className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-[rgba(20,25,21,0.9)] text-xs font-medium text-[#dce5d9] hover:text-white hover:bg-[rgba(32,42,34,0.95)] disabled:opacity-50 shadow-lg transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#8fd19c]" />
          <span>{exportingZip ? '압축 중...' : '배포용 .zip 다운로드 (개발 전용)'}</span>
        </button>
      )}
    </main>
  );
}
