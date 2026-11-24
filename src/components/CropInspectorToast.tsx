import React from 'react';
import { BookOpen, Check, ChevronUp, Circle, X } from 'lucide-react';
import { CROP_MAP } from '../data/reliefCrops';
import { CropId, SelectionFeedback } from '../types/botany';

interface CropInspectorToastProps {
  feedback: SelectionFeedback | null;
  holdProgress: number; // 0 to 1 while holding F
  qHoldProgress: number; // 0 to 1 while holding Q
  detailsOpen: boolean;
  headerCollapsed?: boolean;
  onOpenDetails: () => void;
  onCollapseDetails: () => void;
  onOpenCropInCompendium: (cropId: CropId) => void;
  onDismiss: () => void;
}

export const CropInspectorToast: React.FC<CropInspectorToastProps> = ({
  feedback,
  holdProgress,
  qHoldProgress,
  detailsOpen,
  headerCollapsed = false,
  onOpenDetails,
  onCollapseDetails,
  onOpenCropInCompendium,
  onDismiss,
}) => {
  if (!feedback) return null;

  const crop = feedback.cropId ? CROP_MAP[feedback.cropId] : null;
  const fPct = Math.round(holdProgress * 100);
  const qPct = Math.round(qHoldProgress * 100);
  const hasDetails = Boolean(crop || (feedback.conditions && feedback.conditions.length > 0));

  if (!detailsOpen) {
    return (
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-20 w-fit min-w-[220px] max-w-[320px] rounded-xl border border-white/15 bg-[rgba(20,25,21,0.92)] px-3 py-2 text-[#f3f1ea] shadow-lg transition-[top] duration-200 ${
          headerCollapsed ? 'top-12' : 'top-20'
        }`}
      >
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {crop && (
              <span
                className="w-2 h-2 rounded-sm shrink-0"
                style={{ backgroundColor: crop.accentHex }}
              />
            )}
            <span className="text-xs font-semibold text-white truncate">
              {feedback.compactTitle ?? feedback.title}
            </span>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="알림 닫기"
            className="p-0.5 rounded text-[#9fa99d] hover:text-white hover:bg-white/10 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {feedback.canHarvest ? (
          <div className="mt-1.5 space-y-1">
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="font-medium text-[#f5df96] flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[#f5df96] text-[#171a15] font-data font-bold text-[10px]">
                  F
                </kbd>
                <span>꾹 눌러 채집·수확</span>
              </span>
              {fPct > 0 && <span className="font-data text-[10px] text-[#e6c26e]">{fPct}%</span>}
            </div>
            {fPct > 0 && (
              <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#e6c26e] transition-[width] duration-75"
                  style={{ width: `${fPct}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="mt-0.5 text-[11px] text-[#c2cac0] truncate">
            {feedback.compactSubtitle ?? feedback.subtitle}
          </p>
        )}

        {hasDetails && (
          <div className="mt-1.5 pt-1.5 border-t border-white/10 space-y-1">
            <button
              type="button"
              onClick={onOpenDetails}
              className="w-full flex items-center justify-between gap-2 text-[11px] text-[#9ed0a8] hover:text-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/14 text-[#f2f4ef] font-data font-semibold text-[10px]">
                  Q
                </kbd>
                <span>꾹 눌러 조건·서식지</span>
              </span>
              {qPct > 0 && <span className="font-data text-[10px] text-[#9ed0a8]">{qPct}%</span>}
            </button>
            {qPct > 0 && (
              <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#7ed18f] transition-[width] duration-75"
                  style={{ width: `${qPct}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-20 w-[min(440px,92vw)] rounded-xl border border-white/15 bg-[rgba(20,25,21,0.95)] p-3.5 text-[#f3f1ea] shadow-xl transition-[top] duration-200 ${
        headerCollapsed ? 'top-12' : 'top-20'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {feedback.isNewDiscovery && (
            <div className="text-[11px] font-semibold text-[#f0cf65] mb-1">
              새로운 구황작물 도감 등록
            </div>
          )}
          <div className="flex items-center gap-2">
            {crop && (
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: crop.accentHex }}
              />
            )}
            <h3 className="text-sm font-semibold text-white truncate">
              {feedback.title}
            </h3>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[#cbd3c9]">
            {feedback.subtitle}
          </p>

          {/* Agronomic Condition Checklist */}
          {feedback.conditions && feedback.conditions.length > 0 && (
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {feedback.conditions.map((cond) => (
                <div
                  key={cond.label}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] border ${
                    cond.met
                      ? 'border-[#4b8a58]/50 bg-[#2f5d3a]/35 text-[#cde8d1]'
                      : 'border-white/10 bg-white/5 text-[#b5bdb2]'
                  }`}
                >
                  {cond.met ? (
                    <Check className="w-3 h-3 text-[#7ed18f] shrink-0" />
                  ) : (
                    <Circle className="w-3 h-3 text-[#8a9487] shrink-0" />
                  )}
                  <span className="truncate">{cond.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Hold F Progress Bar when Harvestable */}
          {feedback.canHarvest && (
            <div className="mt-2.5 rounded-lg border border-[#e6c26e]/35 bg-[#2a2c22] px-3 py-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#f5df96] flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#f5df96] text-[#171a15] font-data font-bold text-[11px]">
                    F
                  </kbd>
                  <span>키를 꾹 눌러 수확 · 채집</span>
                </span>
                <span className="font-data text-[11px] text-[#e6c26e]">{fPct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#e6c26e] transition-[width] duration-75"
                  style={{ width: `${fPct}%` }}
                />
              </div>
            </div>
          )}

          {feedback.actionHint && !feedback.canHarvest && (
            <p className="mt-1.5 text-[11px] text-[#9eb09b]">
              {feedback.actionHint}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onCollapseDetails}
            aria-label="간략히 보기"
            title="간략히 보기"
            className="p-1 rounded text-[#9fa99d] hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="알림 닫기"
            className="p-1 rounded text-[#9fa99d] hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {crop && (
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
          <span className="text-[11px] text-[#b8c2b6] truncate">
            서식지: {crop.habitat.zoneName}
          </span>
          <button
            type="button"
            onClick={() => onOpenCropInCompendium(crop.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#4b8a58] hover:bg-[#3f774b] text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookOpen className="w-3 h-3" />
            <span>도감 보기</span>
          </button>
        </div>
      )}
    </div>
  );
};
