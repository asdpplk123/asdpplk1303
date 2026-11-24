import React from 'react';
import {
  Backpack,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  Cloud,
  CloudRain,
  Droplets,
  Eye,
  Hand,
  HelpCircle,
  Moon,
  Shovel,
  SlidersHorizontal,
  Snowflake,
  Sprout,
  Sun,
  Sunrise,
  Sunset,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  CROP_MAP,
  RELIEF_CROPS,
  WEATHER_LABELS,
} from '../data/reliefCrops';
import {
  CameraFocusPreset,
  CropId,
  SeasonType,
  SunPreset,
  ToolMode,
  WeatherType,
} from '../types/botany';
import { CalendarInfo } from '../utils/calendar';

interface FarmHudProps {
  activeTool: ToolMode;
  selectedSeed: CropId;
  discoveredCount: number;
  totalHarvests: number;
  growthSpeed: 1 | 3 | 10;
  calendar: CalendarInfo;
  weather: WeatherType;
  autoCycle: boolean;
  headerCollapsed: boolean;
  featuresOpen: boolean;
  muted: boolean;
  hoverLabel: string | null;
  showHelp: boolean;
  onSelectTool: (tool: ToolMode) => void;
  onChangeGrowthSpeed: (speed: 1 | 3 | 10) => void;
  onChangeSeason: (season: SeasonType) => void;
  onChangeSunPreset: (preset: SunPreset) => void;
  onChangeWeather: (weather: WeatherType) => void;
  onToggleAutoCycle: () => void;
  onCameraPreset: (preset: CameraFocusPreset) => void;
  onToggleHeader: () => void;
  onToggleFeatures: () => void;
  onOpenBag: () => void;
  onOpenCompendium: () => void;
  onToggleMute: () => void;
  onToggleHelp: () => void;
}

const TOOL_LABELS: Record<ToolMode, string> = {
  inspect: '관찰',
  till: '밭 갈기',
  plant: '심기',
  water: '물 주기',
  harvest: '수확·채집',
};

export const FarmHud: React.FC<FarmHudProps> = ({
  activeTool,
  selectedSeed,
  discoveredCount,
  totalHarvests,
  growthSpeed,
  calendar,
  weather,
  autoCycle,
  headerCollapsed,
  featuresOpen,
  muted,
  hoverLabel,
  showHelp,
  onSelectTool,
  onChangeGrowthSpeed,
  onChangeSeason,
  onChangeSunPreset,
  onChangeWeather,
  onToggleAutoCycle,
  onCameraPreset,
  onToggleHeader,
  onToggleFeatures,
  onOpenBag,
  onOpenCompendium,
  onToggleMute,
  onToggleHelp,
}) => {
  const tools: { id: ToolMode; label: string; icon: React.ReactNode }[] = [
    { id: 'inspect', label: '관찰', icon: <Eye className="w-3.5 h-3.5" /> },
    { id: 'till', label: '밭 갈기', icon: <Shovel className="w-3.5 h-3.5" /> },
    { id: 'plant', label: '심기', icon: <Sprout className="w-3.5 h-3.5" /> },
    { id: 'water', label: '물 주기', icon: <Droplets className="w-3.5 h-3.5" /> },
    { id: 'harvest', label: '수확·채집', icon: <Hand className="w-3.5 h-3.5" /> },
  ];

  const timeIcon =
    calendar.sunPreset === 'morning' ? (
      <Sunrise className="w-4 h-4 text-[#f2ca78] shrink-0" />
    ) : calendar.sunPreset === 'noon' ? (
      <Sun className="w-4 h-4 text-[#f6d96f] shrink-0" />
    ) : calendar.sunPreset === 'sunset' ? (
      <Sunset className="w-4 h-4 text-[#ea9b6b] shrink-0" />
    ) : (
      <Moon className="w-4 h-4 text-[#9dbbf0] shrink-0" />
    );

  const weatherStatus =
    weather === 'clear'
      ? { icon: <Sun className="w-3.5 h-3.5 text-[#f4d476] shrink-0" />, label: WEATHER_LABELS.clear }
      : weather === 'cloudy'
        ? { icon: <Cloud className="w-3.5 h-3.5 text-[#c7d3d9] shrink-0" />, label: WEATHER_LABELS.cloudy }
        : weather === 'rain'
          ? { icon: <CloudRain className="w-3.5 h-3.5 text-[#7cc2e6] shrink-0" />, label: WEATHER_LABELS.rain }
          : { icon: <Snowflake className="w-3.5 h-3.5 text-[#dff2ff] shrink-0" />, label: WEATHER_LABELS.snow };

  return (
    <>
      {/* Top Single-Row Minimal Bar (Collapsible via small arrow icon) */}
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-20 w-[min(1020px,95vw)] flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-white/12 bg-[rgba(20,25,21,0.90)] shadow-lg transition-all duration-250 ease-out ${
          headerCollapsed
            ? '-translate-y-24 opacity-0 pointer-events-none'
            : 'translate-y-0 opacity-100'
        }`}
      >
        {/* Zone 1: 12-Hour Clock, 365-Day Detailed Season & Weather */}
        <div className="flex items-center gap-2 text-xs md:text-sm text-[#f5f1e6] whitespace-nowrap shrink-0">
          {timeIcon}
          <span className="font-data font-medium tabular-nums">{calendar.formattedTime}</span>
          <span aria-hidden="true" className="text-[#8f998d]">·</span>
          <span className="font-medium text-[#d8e0d5]">
            {calendar.seasonDetailLabel} ({calendar.formattedDate})
          </span>
          <span className="hidden lg:inline font-data text-[11px] text-[#9aa498]">
            {calendar.dayOfYear}/365일
          </span>
          <span aria-hidden="true" className="text-[#8f998d]">·</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#dce6de]">
            {weatherStatus.icon}
            <span>{weatherStatus.label}</span>
          </span>
        </div>

        {/* Zone 2: Clean Unboxed Metadata */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#c8cfc6] truncate">
          <span className="text-[#a9d4b1] font-medium whitespace-nowrap">
            {TOOL_LABELS[activeTool]}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-data whitespace-nowrap">
            도감 {discoveredCount}/{RELIEF_CROPS.length}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-data whitespace-nowrap">수확 {totalHarvests}</span>
          {hoverLabel && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#f0d47c] font-medium truncate max-w-[170px]">
                {hoverLabel}
              </span>
            </>
          )}
        </div>

        {/* Zone 3: Features(H) + Bag(M) + Audio + Help + Compendium + Collapse Arrow */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onToggleFeatures}
            aria-label="기능 탭 열기/닫기 (H)"
            title="기능 (H)"
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              featuresOpen
                ? 'bg-white/18 text-white'
                : 'text-[#d9e0d7] hover:text-white hover:bg-white/10'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">기능</span>
          </button>

          <button
            type="button"
            onClick={onOpenBag}
            aria-label="가방 열기 (M)"
            title="가방 열기 (M)"
            className="p-2 rounded-lg text-[#dfd8c4] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Backpack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? '소리 켜기' : '소리 끄기'}
            title={muted ? '소리 켜기' : '소리 끄기'}
            className="p-2 rounded-lg text-[#cfd6ce] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onToggleHelp}
            aria-label="조작 안내"
            title="조작 안내"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              showHelp
                ? 'bg-white/15 text-white'
                : 'text-[#cfd6ce] hover:text-white hover:bg-white/10'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenCompendium}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#4b8a58] hover:bg-[#3f774b] text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>도감 열기</span>
          </button>

          <button
            type="button"
            onClick={onToggleHeader}
            aria-label="상단 바 숨기기"
            title="상단 바 숨기기"
            className="p-1.5 rounded-lg text-[#aeb8ab] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Restore Header Arrow Button when Header is Collapsed */}
      {headerCollapsed && (
        <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleHeader}
            aria-label="상단 바 펼치기"
            title="상단 바 펼치기"
            className="inline-flex items-center justify-center px-3 py-1 rounded-lg border border-white/15 bg-[rgba(20,25,21,0.9)] text-[#d7ded5] hover:text-white shadow-lg transition-colors cursor-pointer"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleFeatures}
            aria-label="기능 (H)"
            title="기능 (H)"
            className="inline-flex items-center justify-center p-1.5 rounded-lg border border-white/15 bg-[rgba(20,25,21,0.9)] text-[#d7ded5] hover:text-white shadow-lg transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onOpenBag}
            aria-label="가방 열기 (M)"
            title="가방 열기 (M)"
            className="inline-flex items-center justify-center p-1.5 rounded-lg border border-white/15 bg-[rgba(20,25,21,0.9)] text-[#dfd8c4] hover:text-white shadow-lg transition-colors cursor-pointer"
          >
            <Backpack className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Compact Help Popover anchored below top bar */}
      {showHelp && (
        <div
          className={`fixed left-1/2 -translate-x-1/2 z-20 w-[min(560px,92vw)] rounded-xl border border-white/15 bg-[rgba(20,25,21,0.95)] p-4 text-xs text-[#dde3da] shadow-xl space-y-2 ${
            headerCollapsed ? 'top-12' : 'top-20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-[#f5f1e6]">농사 · 계절(365일) · 자유 시점 안내</span>
            <button
              type="button"
              onClick={onToggleHelp}
              className="text-[#aeb8ab] hover:text-white cursor-pointer"
            >
              닫기
            </button>
          </div>
          <p className="leading-relaxed text-[#c6cec4]">
            1. <strong>시점 &amp; 조작</strong>: 마우스 드래그(회전), 우클릭/Shift+드래그(이동), 휠(확대/축소)과 <strong>WASD · 방향키</strong>로 3D 세계를 자유롭게 둘러보세요.
          </p>
          <p className="leading-relaxed text-[#c6cec4]">
            2. <strong>채집 [F] &amp; 상세 조건 [Q]</strong>: 작물에 다가가면 작은 창이 뜨며, <strong>[F]를 꾹 눌러</strong> 채집하고 <strong>[Q]를 꾹 눌러</strong> 성장 조건·서식지 설명을 펼쳐볼 수 있습니다.
          </p>
          <p className="leading-relaxed text-[#c6cec4]">
            3. <strong>시간(1일=1분) · 기능 [H] · 가방 [M]</strong>: 1시~12시(오전/오후)와 365일 4계절(봄·여름·가을·겨울) 및 맑음·흐림·비·눈이 흐르며, <strong>[H]</strong> 기능 탭과 <strong>[M]</strong> 가방으로 모든 설정을 다룹니다.
          </p>
        </div>
      )}

      {/* Toggleable '기능' Tab Panel (Opened/Closed via 'H' key or 기능 button) */}
      {featuresOpen && (
        <section
          aria-label="기능 설정"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-[min(680px,94vw)] rounded-xl border border-white/15 bg-[rgba(20,25,21,0.95)] p-4 text-[#f3f1ea] shadow-2xl space-y-3.5"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#8fd19c]" />
              <h2 className="text-sm font-semibold text-white">기능</h2>
              <span className="text-[11px] font-data text-[#9da79b]">(H 키로 끄고 켜기)</span>
            </div>
            <button
              type="button"
              onClick={onToggleFeatures}
              aria-label="기능 탭 닫기"
              className="p-1 rounded text-[#aeb8ab] hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. Farm Tools */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-[#aeb8ab]">
              <span>작업 도구</span>
              <span className="text-[#d7dfd5]">
                선택 작물: <strong className="text-[#f0d47c]">{CROP_MAP[selectedSeed].nameKo}</strong>{' '}
                <button
                  type="button"
                  onClick={() => {
                    onToggleFeatures();
                    onOpenBag();
                  }}
                  className="ml-1 underline text-[#96d1a2] hover:text-white cursor-pointer"
                >
                  가방(M)에서 변경
                </button>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {tools.map((t) => {
                const active = activeTool === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelectTool(t.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-[#4b8a58] text-white'
                        : 'bg-white/7 text-[#cfd6ce] hover:text-white hover:bg-white/12'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Camera Presets & Speed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#aeb8ab]">
                <span>카메라 시점</span>
                <span className="text-[10px] text-[#8d978b]">WASD·드래그 자유 이동</span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {(
                  [
                    ['farm', '농장'],
                    ['wild_overview', '전경'],
                    ['hillside', '산기슭'],
                    ['highland', '고지대'],
                    ['meadow', '들판'],
                    ['streamside', '개울가'],
                  ] as const
                ).map(([preset, label]) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onCameraPreset(preset)}
                    className="px-2.5 py-1 rounded-md text-xs bg-white/7 text-[#d6dcd4] hover:text-white hover:bg-white/14 whitespace-nowrap cursor-pointer"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#aeb8ab]">
                <span>생육 · 시간 배속</span>
                <span className="text-[10px] font-data text-[#8d978b]">기본 1일 = 1분</span>
              </div>
              <div className="flex items-center gap-1.5">
                {([1, 3, 10] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => onChangeGrowthSpeed(spd)}
                    className={`px-3 py-1 rounded-md text-xs font-data transition-colors whitespace-nowrap cursor-pointer ${
                      growthSpeed === spd
                        ? 'bg-[#c79942] text-[#151814] font-semibold'
                        : 'bg-white/7 text-[#cfd6ce] hover:text-white hover:bg-white/14'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Season (365-Day), Time & Weather */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="block text-[11px] text-[#aeb8ab]">
                계절 · 시간대 ({calendar.formattedDate})
              </span>
              <div className="flex flex-wrap items-center gap-1">
                {(
                  [
                    ['spring', '봄'],
                    ['summer', '여름'],
                    ['autumn', '가을'],
                    ['winter', '겨울'],
                  ] as const
                ).map(([sKey, sLabel]) => (
                  <button
                    key={sKey}
                    type="button"
                    onClick={() => onChangeSeason(sKey)}
                    className={`px-2 py-1 rounded-md text-xs transition-colors whitespace-nowrap cursor-pointer ${
                      calendar.season === sKey
                        ? 'bg-[#4b8a58] text-white font-medium'
                        : 'bg-white/7 text-[#c2c9c0] hover:text-white hover:bg-white/14'
                    }`}
                  >
                    {sLabel}
                  </button>
                ))}
                <span className="text-[#697268] mx-0.5">|</span>
                {(
                  [
                    ['morning', '아침'],
                    ['noon', '낮'],
                    ['sunset', '노을'],
                    ['night', '밤'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChangeSunPreset(key)}
                    className={`px-2 py-1 rounded-md text-xs transition-colors whitespace-nowrap cursor-pointer ${
                      calendar.sunPreset === key
                        ? 'bg-white/22 text-white font-medium'
                        : 'bg-white/7 text-[#c2c9c0] hover:text-white hover:bg-white/14'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="block text-[11px] text-[#aeb8ab]">날씨 · 자동 흐름</span>
              <div className="flex flex-wrap items-center gap-1">
                {(
                  [
                    ['clear', '맑음', <Sun key="s" className="w-3 h-3" />],
                    ['cloudy', '흐림', <Cloud key="c" className="w-3 h-3" />],
                    ['rain', '비', <CloudRain key="r" className="w-3 h-3" />],
                    ['snow', '눈', <Snowflake key="sn" className="w-3 h-3" />],
                  ] as const
                ).map(([key, label, icon]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChangeWeather(key)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors whitespace-nowrap cursor-pointer ${
                      weather === key
                        ? 'bg-[#3f6f87] text-white font-medium'
                        : 'bg-white/7 text-[#c2c9c0] hover:text-white hover:bg-white/14'
                    }`}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={onToggleAutoCycle}
                  title="시간·날씨 자동 순환 전환"
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors whitespace-nowrap cursor-pointer ${
                    autoCycle
                      ? 'bg-[#4b8a58]/60 text-[#ddf2df] font-medium'
                      : 'bg-white/7 text-[#9aa398] hover:text-white hover:bg-white/14'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>자동</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};
