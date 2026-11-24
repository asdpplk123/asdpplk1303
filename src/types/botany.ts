export type CropId =
  | 'sweet_potato'
  | 'potato'
  | 'doraji'
  | 'kudzu'
  | 'yam'
  | 'buckwheat'
  | 'millet'
  | 'sorghum'
  | 'corn'
  | 'barley'
  | 'pumpkin'
  | 'shepherds_purse'
  | 'mugwort'
  | 'jerusalem_artichoke';

export type HabitatCategory = 'hillside' | 'highland' | 'meadow' | 'streamside';

export type ToolMode = 'inspect' | 'till' | 'plant' | 'water' | 'harvest';

export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

export type SunPreset = 'morning' | 'noon' | 'sunset' | 'night';

export type WeatherType = 'clear' | 'cloudy' | 'rain' | 'snow';

export type NeedLevel = 'low' | 'medium' | 'high';

export type CameraFocusPreset =
  | 'farm'
  | 'wild_overview'
  | 'hillside'
  | 'highland'
  | 'meadow'
  | 'streamside';

export interface CultivationTraits {
  growthRateLabel: '빠름' | '보통' | '느림';
  waterNeed: NeedLevel;
  requiredWaterings: number;
  drainRequiredBeforeHarvest: boolean;
  waterConsumptionPerSec: number;
  sunNeed: NeedLevel;
  optimalSun: SunPreset;
  sunlightBonusFactor: number;
  droughtPenaltyFactor: number;
  conditionSummary: string;
}

export interface WildSpawnTraits {
  allowedSeasons: SeasonType[];
  allowedSuns: SunPreset[];
  allowedWeathers: WeatherType[];
  spawnChance: number; // 0 to 1 per check cycle
  minRespawnSec: number;
  conditionLabel: string;
}

export interface NutrientItem {
  name: string;
  amount: string;
  unit: string;
  dailyPercent: number;
  highlight?: string;
}

export interface CropBenefit {
  title: string;
  compound: string;
  description: string;
}

export interface ReliefCropData {
  id: CropId;
  nameKo: string;
  hanja: string;
  scientificName: string;
  familyKo: string;
  categoryLabel: string;
  ediblePart: string;
  seasonLabel: string;
  growthDurationSec: number;
  harvestYield: number;
  seedYield: number;
  cultivation: CultivationTraits;
  wildSpawn: WildSpawnTraits;
  accentHex: string;
  foliageHex: string;
  flowerHex: string;
  tuberHex: string;
  summary: string;
  morphology: string;
  reliefHistory: string;
  habitat: {
    category: HabitatCategory;
    zoneName: string;
    soilType: string;
    sunlight: string;
    moisture: string;
    altitude: string;
    distribution: string;
    worldFocusPoint: [number, number, number];
  };
  nutritionPer100g: {
    caloriesKcal: number;
    carbsG: number;
    fiberG: number;
    proteinG: number;
    fatG: number;
    keyNutrients: NutrientItem[];
  };
  benefits: CropBenefit[];
  preparation: string;
  caution: string;
}

export type PlotSoilState = 'fallow' | 'tilled';

export interface FarmPlotState {
  id: string;
  index: number;
  position: [number, number, number];
  soil: PlotSoilState;
  watered: boolean;
  waterLevel: number; // 0 to 1
  wateringsCount: number;
  sunlightMet: boolean;
  cropId: CropId | null;
  growthProgress: number; // 0 to 1
  mature: boolean;
}

export interface WildSpecimenState {
  id: string;
  cropId: CropId;
  habitat: HabitatCategory;
  position: [number, number, number];
  emerged: boolean;
  growthProgress: number; // 0 to 1 (1 = fully grown & forageable)
  sunlightMet: boolean;
  available: boolean; // true when emerged && mature
  respawnTimer: number;
  spawnCheckTimer: number;
}

export interface DiscoveryProgress {
  discoveredAt: string;
  foragedCount: number;
  farmedCount: number;
}

export interface TargetRef {
  kind: 'plot' | 'wild';
  id: string;
}

export interface ConditionCheck {
  label: string;
  met: boolean;
}

export interface SelectionFeedback {
  title: string;
  subtitle: string;
  compactTitle?: string;
  compactSubtitle?: string;
  cropId?: CropId;
  isNewDiscovery?: boolean;
  actionHint?: string;
  canHarvest?: boolean;
  conditions?: ConditionCheck[];
}
