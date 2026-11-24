import React, { useMemo, useState } from 'react';
import { Backpack, BookOpen, Package, Search, Sprout, X } from 'lucide-react';
import { NEED_LABELS, RELIEF_CROPS, SUN_LABELS } from '../data/reliefCrops';
import { CropId, DiscoveryProgress } from '../types/botany';

interface BagModalProps {
  isOpen: boolean;
  seeds: Record<CropId, number>;
  basket: Record<CropId, number>;
  discoveries: Record<string, DiscoveryProgress>;
  onSelectSeedToPlant: (cropId: CropId) => void;
  onOpenCropInCompendium: (cropId: CropId) => void;
  onClose: () => void;
}

type BagTab = 'all' | 'seeds' | 'harvest';

export const BagModal: React.FC<BagModalProps> = ({
  isOpen,
  seeds,
  basket,
  discoveries,
  onSelectSeedToPlant,
  onOpenCropInCompendium,
  onClose,
}) => {
  const [tab, setTab] = useState<BagTab>('all');
  const [query, setQuery] = useState('');

  const totalSeedCount = useMemo(
    () => Object.values(seeds).reduce((sum, n) => sum + n, 0),
    [seeds],
  );
  const totalHarvestCount = useMemo(
    () => Object.values(basket).reduce((sum, n) => sum + n, 0),
    [basket],
  );

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RELIEF_CROPS.filter((crop) => {
      const sCount = seeds[crop.id] ?? 0;
      const hCount = basket[crop.id] ?? 0;
      if (tab === 'seeds' && sCount <= 0) return false;
      if (tab === 'harvest' && hCount <= 0) return false;
      if (tab === 'all' && sCount <= 0 && hCount <= 0) return false;
      if (!q) return true;
      return (
        crop.nameKo.toLowerCase().includes(q) ||
        crop.ediblePart.toLowerCase().includes(q) ||
        crop.categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [basket, query, seeds, tab]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-3 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bag-modal-title"
    >
      <div className="flex flex-col w-full max-w-3xl max-h-[84vh] rounded-xl border border-[#2c362e]/20 bg-[#faf8f4] text-[#1c231e] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#2c362e]/12 bg-[#f4f0e6]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Backpack className="w-5 h-5 text-[#2f5d3a] shrink-0" />
            <h2
              id="bag-modal-title"
              className="font-editorial text-xl font-semibold tracking-tight text-[#1c231e] whitespace-nowrap"
            >
              농부 가방 · 씨앗과 수확물
            </h2>
            <span className="hidden sm:inline text-xs text-[#556157] font-data whitespace-nowrap">
              씨앗 {totalSeedCount}개 · 수확·채집 {totalHarvestCount}개
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[#2c362e] hover:bg-[#e7e1d3] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>닫기 (M)</span>
          </button>
        </div>

        {/* Filter & Summary Strip */}
        <div className="px-5 py-3 border-b border-[#2c362e]/10 bg-[#f5f2ea] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#e9e4d8]">
            {(
              [
                ['all', `전체 (${totalSeedCount + totalHarvestCount})`],
                ['seeds', `씨앗 (${totalSeedCount})`],
                ['harvest', `수확·채집물 (${totalHarvestCount})`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  tab === key
                    ? 'bg-white text-[#1c231e] shadow-sm'
                    : 'text-[#556157] hover:text-[#1c231e]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-[#6c776e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="작물명 또는 부위 검색"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#2c362e]/15 bg-white text-[#1c231e] placeholder-[#7f8a81] focus:outline-none focus:border-[#2f5d3a]"
            />
          </div>
        </div>

        {/* Item Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="py-14 text-center space-y-2 text-[#5f6b61]">
              <Package className="w-8 h-8 mx-auto opacity-45" />
              <p className="text-sm font-medium text-[#2c362e]">
                해당 분류에 보관 중인 씨앗이나 수확물이 없습니다.
              </p>
              <p className="text-xs">
                텃밭에서 작물을 기르거나 계절·날씨에 맞춰 야생 개체를 채집해 보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((crop) => {
                const seedCount = seeds[crop.id] ?? 0;
                const harvestCount = basket[crop.id] ?? 0;
                const isDiscovered = Boolean(discoveries[crop.id]);

                return (
                  <div
                    key={crop.id}
                    className="rounded-lg border border-[#2c362e]/12 bg-white p-3.5 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-sm shrink-0"
                            style={{ backgroundColor: crop.accentHex }}
                          />
                          <h3 className="text-sm font-semibold text-[#1c231e] truncate">
                            {crop.nameKo}
                          </h3>
                          <span className="text-[11px] text-[#6a756b] truncate">
                            {crop.ediblePart}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-[#556157] leading-relaxed">
                          생육 {crop.cultivation.growthRateLabel} · 물 {NEED_LABELS[crop.cultivation.waterNeed]} ·{' '}
                          {SUN_LABELS[crop.cultivation.optimalSun]}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#758077]">
                          야생 출현: {crop.wildSpawn.conditionLabel}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0 font-data text-xs">
                        <span className="px-2 py-0.5 rounded bg-[#edf3ed] text-[#285334] font-medium">
                          씨앗 {seedCount}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#f5eee0] text-[#7a541d] font-medium">
                          열매·작물 {harvestCount}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-[#2c362e]/10 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenCropInCompendium(crop.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-[#3b473d] hover:bg-[#efebe1] transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{isDiscovered ? '도감 보기' : '도감 확인'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={seedCount <= 0}
                        onClick={() => onSelectSeedToPlant(crop.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          seedCount > 0
                            ? 'bg-[#2f5d3a] hover:bg-[#244a2d] text-white cursor-pointer'
                            : 'bg-[#e9e7e0] text-[#9aa29b] cursor-not-allowed'
                        }`}
                      >
                        <Sprout className="w-3.5 h-3.5" />
                        <span>밭에 심기</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
