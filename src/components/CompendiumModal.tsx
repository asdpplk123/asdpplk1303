import React, { useMemo, useState } from 'react';
import {
  Compass,
  Droplets,
  HeartPulse,
  MapPin,
  Mountain,
  Search,
  Sprout,
  Sun,
  Utensils,
  X,
  AlertTriangle,
} from 'lucide-react';
import { HABITAT_LABELS, NEED_LABELS, RELIEF_CROPS, SUN_LABELS } from '../data/reliefCrops';
import {
  CropId,
  DiscoveryProgress,
  HabitatCategory,
  ReliefCropData,
} from '../types/botany';
import { BasketRadialChart } from './BasketRadialChart';
import { BotanicalIllustration } from './BotanicalIllustration';

interface CompendiumModalProps {
  isOpen: boolean;
  selectedCropId: CropId;
  discoveries: Record<string, DiscoveryProgress>;
  basket: Record<CropId, number>;
  onSelectCrop: (cropId: CropId) => void;
  onLocateInWorld: (crop: ReliefCropData) => void;
  onSelectSeedAndClose: (cropId: CropId) => void;
  onClose: () => void;
}

export const CompendiumModal: React.FC<CompendiumModalProps> = ({
  isOpen,
  selectedCropId,
  discoveries,
  basket,
  onSelectCrop,
  onLocateInWorld,
  onSelectSeedAndClose,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [habitatFilter, setHabitatFilter] = useState<'all' | HabitatCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'discovered' | 'undiscovered'>('all');

  const discoveredCount = useMemo(
    () => RELIEF_CROPS.filter((c) => Boolean(discoveries[c.id])).length,
    [discoveries],
  );

  const filteredCrops = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return RELIEF_CROPS.filter((crop) => {
      const isDiscovered = Boolean(discoveries[crop.id]);
      if (statusFilter === 'discovered' && !isDiscovered) return false;
      if (statusFilter === 'undiscovered' && isDiscovered) return false;
      if (habitatFilter !== 'all' && crop.habitat.category !== habitatFilter) return false;
      if (!q) return true;
      return (
        crop.nameKo.toLowerCase().includes(q) ||
        crop.scientificName.toLowerCase().includes(q) ||
        crop.habitat.zoneName.toLowerCase().includes(q) ||
        crop.benefits.some((b) => b.title.toLowerCase().includes(q) || b.compound.toLowerCase().includes(q))
      );
    });
  }, [discoveries, habitatFilter, searchQuery, statusFilter]);

  if (!isOpen) return null;

  const activeCrop = RELIEF_CROPS.find((c) => c.id === selectedCropId) ?? RELIEF_CROPS[0];
  const activeDiscovery = discoveries[activeCrop.id];
  const isUnlocked = Boolean(activeDiscovery);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-3 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compendium-title"
    >
      <div className="flex flex-col w-full max-w-6xl h-[90vh] max-h-[860px] rounded-xl border border-[#2c362e]/20 bg-[#faf8f4] text-[#1c231e] shadow-2xl overflow-hidden">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#2c362e]/12 bg-[#f4f0e6]">
          <div className="flex items-baseline gap-3 min-w-0">
            <h2
              id="compendium-title"
              className="font-editorial text-xl md:text-2xl font-semibold tracking-tight text-[#1c231e] whitespace-nowrap"
            >
              구황작물 · 산야초 도감
            </h2>
            <span className="hidden sm:inline text-xs text-[#556157] font-data whitespace-nowrap">
              기록 {discoveredCount} / {RELIEF_CROPS.length}종
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[#2c362e] hover:bg-[#e7e1d3] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>닫기</span>
          </button>
        </div>

        {/* Body Split: Left Index + Right Botanical Monograph */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left Index Column */}
          <aside className="md:col-span-4 lg:col-span-4 border-b md:border-b-0 md:border-r border-[#2c362e]/12 bg-[#f5f2ea] flex flex-col min-h-0 max-h-64 md:max-h-none">
            <div className="p-3.5 space-y-2.5 border-b border-[#2c362e]/10">
              <div className="relative">
                <Search className="w-4 h-4 text-[#6c776e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="식물명, 서식지, 효능 검색"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#2c362e]/15 bg-white text-[#1c231e] placeholder-[#7f8a81] focus:outline-none focus:border-[#2f5d3a]"
                />
              </div>

              {/* Discovery Status Filter */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-[#e9e4d8]">
                {(
                  [
                    ['all', '전체'],
                    ['discovered', '발견됨'],
                    ['undiscovered', '미발견'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatusFilter(key)}
                    className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      statusFilter === key
                        ? 'bg-white text-[#1c231e] shadow-sm'
                        : 'text-[#556157] hover:text-[#1c231e]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Habitat Filter */}
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setHabitatFilter('all')}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    habitatFilter === 'all'
                      ? 'bg-[#2f5d3a] text-white font-medium'
                      : 'bg-white/80 text-[#4c584e] hover:bg-white'
                  }`}
                >
                  모든 서식지
                </button>
                {(Object.keys(HABITAT_LABELS) as HabitatCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setHabitatFilter(cat)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      habitatFilter === cat
                        ? 'bg-[#2f5d3a] text-white font-medium'
                        : 'bg-white/80 text-[#4c584e] hover:bg-white'
                    }`}
                  >
                    {HABITAT_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Crop List */}
            <div className="flex-1 overflow-y-auto botanical-scroll divide-y divide-[#2c362e]/8">
              {filteredCrops.length === 0 ? (
                <div className="p-6 text-center text-sm text-[#6b766d]">
                  조건에 맞는 식물이 없습니다.
                </div>
              ) : (
                filteredCrops.map((crop) => {
                  const unlocked = Boolean(discoveries[crop.id]);
                  const selected = crop.id === activeCrop.id;
                  return (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => onSelectCrop(crop.id)}
                      className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                        selected
                          ? 'bg-[#eae4d5]'
                          : 'hover:bg-[#efebe1]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-sm shrink-0"
                            style={{
                              backgroundColor: unlocked ? crop.accentHex : '#b9b5aa',
                            }}
                          />
                          <span className="font-semibold text-sm text-[#1c231e] truncate">
                            {crop.nameKo}
                          </span>
                          <span className="text-xs text-[#69746b] truncate">
                            {crop.hanja}
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-[#636e65] truncate">
                          {HABITAT_LABELS[crop.habitat.category]} · {crop.scientificName}
                        </div>
                      </div>
                      <span className="text-xs font-data text-[#556157] shrink-0 whitespace-nowrap">
                        {unlocked ? '기록됨' : '미발견'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right Botanical Detail Sheet */}
          <section className="md:col-span-8 lg:col-span-8 overflow-y-auto botanical-scroll p-5 md:p-8 space-y-7 bg-[#faf8f4]">
            {/* Harvested Basket Radial Bar Chart Section */}
            <BasketRadialChart basket={basket} onSelectCrop={onSelectCrop} />

            {/* Top Specimen Header & Plate */}
            <div className="pt-2 border-t border-[#2c362e]/12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5">
                <BotanicalIllustration cropId={activeCrop.id} unlocked={isUnlocked} />
              </div>

              <div className="lg:col-span-7 space-y-3">
                <div className="text-xs text-[#5b675d]">
                  <span>{activeCrop.categoryLabel}</span>
                  <span aria-hidden="true" className="mx-1.5">·</span>
                  <span>{activeCrop.familyKo}</span>
                </div>

                <div>
                  <h3 className="font-editorial text-2xl md:text-3xl font-bold text-[#1c231e] tracking-tight">
                    {activeCrop.nameKo}{' '}
                    <span className="font-normal text-lg text-[#5b675d]">
                      ({activeCrop.hanja})
                    </span>
                  </h3>
                  <p className="text-sm italic text-[#4e5b50] mt-0.5">
                    {activeCrop.scientificName}
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-[#2d362f]">
                  {activeCrop.summary}
                </p>

                <div className="pt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-xs border-t border-[#2c362e]/12">
                  <div>
                    <span className="text-[#69746b]">이용 부위</span>
                    <p className="font-medium text-[#1c231e] mt-0.5">{activeCrop.ediblePart}</p>
                  </div>
                  <div>
                    <span className="text-[#69746b]">생육 · 채집 시기</span>
                    <p className="font-medium text-[#1c231e] mt-0.5">{activeCrop.seasonLabel}</p>
                  </div>
                  <div>
                    <span className="text-[#69746b]">보유 수확물</span>
                    <p className="font-data font-semibold text-[#2f5d3a] mt-0.5">
                      {basket[activeCrop.id] ?? 0}개
                    </p>
                  </div>
                  <div>
                    <span className="text-[#69746b]">누적 채집 · 수확</span>
                    <p className="font-data font-medium text-[#1c231e] mt-0.5">
                      {activeDiscovery
                        ? `채집 ${activeDiscovery.foragedCount} · 수확 ${activeDiscovery.farmedCount}`
                        : '아직 미채집'}
                    </p>
                  </div>
                </div>

                {/* Unique Crop Cultivation Traits */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#2c362e]/10 text-xs">
                  <div className="rounded-md bg-[#f4f0e6] px-2.5 py-1.5">
                    <span className="text-[11px] text-[#637065]">성장 속도</span>
                    <p className="font-data font-semibold text-[#1c231e]">
                      {activeCrop.cultivation.growthRateLabel} ({activeCrop.growthDurationSec}초)
                    </p>
                  </div>
                  <div className="rounded-md bg-[#f4f0e6] px-2.5 py-1.5">
                    <span className="text-[11px] text-[#637065]">물 필요량</span>
                    <p className="font-semibold text-[#236578]">
                      {NEED_LABELS[activeCrop.cultivation.waterNeed]}
                    </p>
                  </div>
                  <div className="rounded-md bg-[#f4f0e6] px-2.5 py-1.5">
                    <span className="text-[11px] text-[#637065]">햇빛 조건</span>
                    <p className="font-semibold text-[#8c5a18]">
                      {NEED_LABELS[activeCrop.cultivation.sunNeed]} · {SUN_LABELS[activeCrop.cultivation.optimalSun]}
                    </p>
                  </div>
                  <div className="rounded-md bg-[#f4f0e6] px-2.5 py-1.5">
                    <span className="text-[11px] text-[#637065]">수확 · 씨앗</span>
                    <p className="font-data font-semibold text-[#2f5d3a]">
                      +{activeCrop.harvestYield}개 · +{activeCrop.seedYield}씨
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onLocateInWorld(activeCrop)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#2f5d3a] text-white hover:bg-[#254b2e] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>3D 서식지 위치 보기</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectSeedAndClose(activeCrop.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border border-[#2c362e]/20 bg-white text-[#1c231e] hover:bg-[#f2ede2] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Sprout className="w-3.5 h-3.5 text-[#2f5d3a]" />
                    <span>밭에 심을 씨앗으로 선택</span>
                  </button>
                </div>
              </div>
            </div>

            {!isUnlocked ? (
              /* Undiscovered Guidance + Habitat Clue */
              <div className="rounded-xl border border-[#2c362e]/15 bg-[#f4f0e6] p-6 space-y-3">
                <h4 className="font-editorial text-lg font-semibold text-[#1c231e]">
                  아직 도감에 정식 등재되지 않은 식물입니다
                </h4>
                <p className="text-sm text-[#3c473e] leading-relaxed">
                  이 식물은 <strong>{activeCrop.habitat.zoneName}</strong> 환경에서 주로 자랍니다.
                  위의 <strong>3D 서식지 위치 보기</strong> 버튼을 눌러 야생 개체를 직접 찾아 채집하거나,
                  농장 밭에서 재배하여 수확하면 상세 형태·영양 성분·효능 정보가 모두 해금됩니다.
                </p>
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#4f5c51]">
                  <div>
                    <span className="font-semibold text-[#1c231e]">서식 구역: </span>
                    {HABITAT_LABELS[activeCrop.habitat.category]}
                  </div>
                  <div>
                    <span className="font-semibold text-[#1c231e]">선호 토양: </span>
                    {activeCrop.habitat.soilType}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* 1. Botanical Morphology & Relief History */}
                <div className="pt-6 border-t border-[#2c362e]/12 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-editorial text-base font-semibold text-[#1c231e]">
                      01. 식물 형태 및 특징
                    </h4>
                    <p className="text-sm leading-relaxed text-[#323c34]">
                      {activeCrop.morphology}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-editorial text-base font-semibold text-[#1c231e]">
                      02. 구황 역사 및 활용 배경
                    </h4>
                    <p className="text-sm leading-relaxed text-[#323c34]">
                      {activeCrop.reliefHistory}
                    </p>
                  </div>
                </div>

                {/* 2. Habitat & Ecological Conditions */}
                <div className="pt-6 border-t border-[#2c362e]/12 space-y-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="font-editorial text-base font-semibold text-[#1c231e]">
                      03. 서식지 및 생육 환경
                    </h4>
                    <span className="text-xs font-medium text-[#2f5d3a]">
                      {activeCrop.habitat.zoneName}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[#2c362e]/12 bg-white p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3c4a3e]">
                        <MapPin className="w-3.5 h-3.5 text-[#2f5d3a]" />
                        <span>토양 조건</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#455247]">
                        {activeCrop.habitat.soilType}
                      </p>
                    </div>

                    <div className="rounded-lg border border-[#2c362e]/12 bg-white p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3c4a3e]">
                        <Sun className="w-3.5 h-3.5 text-[#b57a28]" />
                        <span>일조 조건</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#455247]">
                        {activeCrop.habitat.sunlight}
                      </p>
                    </div>

                    <div className="rounded-lg border border-[#2c362e]/12 bg-white p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3c4a3e]">
                        <Droplets className="w-3.5 h-3.5 text-[#2e7488]" />
                        <span>수분 요구도</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#455247]">
                        {activeCrop.habitat.moisture}
                      </p>
                    </div>

                    <div className="rounded-lg border border-[#2c362e]/12 bg-white p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3c4a3e]">
                        <Mountain className="w-3.5 h-3.5 text-[#5b695d]" />
                        <span>고도 및 분포지</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#455247]">
                        {activeCrop.habitat.altitude} · {activeCrop.habitat.distribution}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Nutrition Profile per 100g */}
                <div className="pt-6 border-t border-[#2c362e]/12 space-y-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="font-editorial text-base font-semibold text-[#1c231e]">
                      04. 영양 성분 (가식부 100g 기준)
                    </h4>
                    <span className="font-data text-xs text-[#556157]">
                      열량 {activeCrop.nutritionPer100g.caloriesKcal} kcal
                    </span>
                  </div>

                  {/* Macro Summary Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-[#2c362e]/12 bg-white px-3.5 py-2.5">
                      <div className="text-xs text-[#637065]">탄수화물</div>
                      <div className="font-data text-base font-semibold text-[#1c231e] mt-0.5">
                        {activeCrop.nutritionPer100g.carbsG} g
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#2c362e]/12 bg-white px-3.5 py-2.5">
                      <div className="text-xs text-[#637065]">식이섬유</div>
                      <div className="font-data text-base font-semibold text-[#2f5d3a] mt-0.5">
                        {activeCrop.nutritionPer100g.fiberG} g
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#2c362e]/12 bg-white px-3.5 py-2.5">
                      <div className="text-xs text-[#637065]">단백질</div>
                      <div className="font-data text-base font-semibold text-[#1c231e] mt-0.5">
                        {activeCrop.nutritionPer100g.proteinG} g
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#2c362e]/12 bg-white px-3.5 py-2.5">
                      <div className="text-xs text-[#637065]">지방</div>
                      <div className="font-data text-base font-semibold text-[#1c231e] mt-0.5">
                        {activeCrop.nutritionPer100g.fatG} g
                      </div>
                    </div>
                  </div>

                  {/* Key Micronutrients & Phytochemicals */}
                  <div className="rounded-lg border border-[#2c362e]/12 bg-white divide-y divide-[#2c362e]/8">
                    {activeCrop.nutritionPer100g.keyNutrients.map((nut) => (
                      <div key={nut.name} className="p-3.5 space-y-1.5">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-sm font-medium text-[#1c231e]">
                            {nut.name}
                          </span>
                          <span className="font-data text-xs font-semibold text-[#2f5d3a]">
                            {nut.amount} {nut.unit} ({nut.dailyPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#eae6da] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(8, nut.dailyPercent))}%`,
                              backgroundColor: activeCrop.accentHex,
                            }}
                          />
                        </div>
                        {nut.highlight && (
                          <p className="text-xs text-[#59655b]">{nut.highlight}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Health Benefits & Culinary Preparation */}
                <div className="pt-6 border-t border-[#2c362e]/12 space-y-4">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-[#2f5d3a]" />
                    <h4 className="font-editorial text-base font-semibold text-[#1c231e]">
                      05. 주요 효능 및 섭취 방법
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {activeCrop.benefits.map((b) => (
                      <div
                        key={b.title}
                        className="rounded-lg border border-[#2c362e]/12 bg-white p-4 space-y-2"
                      >
                        <div className="text-sm font-semibold text-[#1c231e]">
                          {b.title}
                        </div>
                        <div className="text-xs font-medium text-[#2f5d3a]">
                          {b.compound}
                        </div>
                        <p className="text-xs leading-relaxed text-[#455247]">
                          {b.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    <div className="rounded-lg border border-[#2c362e]/12 bg-[#f3efe5] p-4 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1c231e]">
                        <Utensils className="w-3.5 h-3.5 text-[#2f5d3a]" />
                        <span>손질 및 조리 활용법</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#38433a]">
                        {activeCrop.preparation}
                      </p>
                    </div>

                    <div className="rounded-lg border border-[#a16b22]/25 bg-[#f7f1e3] p-4 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7a4b10]">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#a16b22]" />
                        <span>섭취 시 주의사항</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#5c4727]">
                        {activeCrop.caution}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
