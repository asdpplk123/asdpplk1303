import { SeasonType, SunPreset } from '../types/botany';

export const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

export const SEASON_LABELS: Record<SeasonType, string> = {
  spring: '봄',
  summer: '여름',
  autumn: '가을',
  winter: '겨울',
};

const MONTH_SUBSEASON_LABELS: Record<number, { season: SeasonType; detail: string }> = {
  1: { season: 'winter', detail: '한겨울' },
  2: { season: 'winter', detail: '늦겨울' },
  3: { season: 'spring', detail: '초봄' },
  4: { season: 'spring', detail: '한봄' },
  5: { season: 'spring', detail: '늦봄' },
  6: { season: 'summer', detail: '초여름' },
  7: { season: 'summer', detail: '한여름' },
  8: { season: 'summer', detail: '늦여름' },
  9: { season: 'autumn', detail: '초가을' },
  10: { season: 'autumn', detail: '한가을' },
  11: { season: 'autumn', detail: '늦가을' },
  12: { season: 'winter', detail: '초겨울' },
};

export interface CalendarInfo {
  dayOfYear: number; // 1..365
  month: number; // 1..12
  dayOfMonth: number; // 1..31
  season: SeasonType;
  seasonLabel: string;
  seasonDetailLabel: string; // e.g., '한봄'
  sunPreset: SunPreset;
  periodLabel: '오전' | '오후';
  hour12: number; // 1..12
  minute: number; // 0..59
  formattedTime: string; // e.g., '오전 7:30'
  formattedDate: string; // e.g., '4월 10일'
}

export function normalizeDayOfYear(day: number): number {
  const rounded = Math.floor(day);
  const mod = ((rounded - 1) % 365 + 365) % 365;
  return mod + 1;
}

export function getSunPresetFromHours(timeHours: number): SunPreset {
  const h = ((timeHours % 24) + 24) % 24;
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'noon';
  if (h >= 17 && h < 20.5) return 'sunset';
  return 'night';
}

export function getCalendarInfo(dayOfYear: number, timeHours: number): CalendarInfo {
  const safeDay = normalizeDayOfYear(dayOfYear);
  let remaining = safeDay;
  let month = 1;
  for (let i = 0; i < MONTH_DAYS.length; i++) {
    if (remaining <= MONTH_DAYS[i]) {
      month = i + 1;
      break;
    }
    remaining -= MONTH_DAYS[i];
  }
  const dayOfMonth = remaining;
  const meta = MONTH_SUBSEASON_LABELS[month] ?? { season: 'spring' as SeasonType, detail: '봄' };

  const wrappedHours = ((timeHours % 24) + 24) % 24;
  const totalMinutes = Math.floor(wrappedHours * 60);
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const minute = totalMinutes % 60;
  const periodLabel: '오전' | '오후' = h24 < 12 ? '오전' : '오후';
  const hour12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const formattedTime = `${periodLabel} ${hour12}:${String(minute).padStart(2, '0')}`;

  return {
    dayOfYear: safeDay,
    month,
    dayOfMonth,
    season: meta.season,
    seasonLabel: SEASON_LABELS[meta.season],
    seasonDetailLabel: meta.detail,
    sunPreset: getSunPresetFromHours(wrappedHours),
    periodLabel,
    hour12,
    minute,
    formattedTime,
    formattedDate: `${month}월 ${dayOfMonth}일`,
  };
}

export function getDayOfYearForSeason(season: SeasonType): number {
  switch (season) {
    case 'spring':
      return 100; // 4월 10일 (한봄)
    case 'summer':
      return 196; // 7월 15일 (한여름)
    case 'autumn':
      return 288; // 10월 15일 (한가을)
    case 'winter':
      return 15; // 1월 15일 (한겨울)
  }
}

export function getTimeHoursForSunPreset(preset: SunPreset): number {
  switch (preset) {
    case 'morning':
      return 7.5; // 오전 7:30
    case 'noon':
      return 13.0; // 오후 1:00
    case 'sunset':
      return 18.0; // 오후 6:00
    case 'night':
      return 22.0; // 오후 10:00
  }
}
