import React, { useMemo } from 'react';
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { RELIEF_CROPS } from '../data/reliefCrops';
import { CropId } from '../types/botany';

interface BasketRadialChartProps {
  basket: Record<CropId, number>;
  onSelectCrop: (cropId: CropId) => void;
}

interface ChartDatum {
  cropId: CropId;
  name: string;
  count: number;
  percent: number;
  fill: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
}

const CustomRadialTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-[#2c362e]/20 bg-[#faf8f4] px-3 py-2 shadow-md text-xs text-[#1c231e]">
      <div className="flex items-center gap-2 font-semibold">
        <span
          className="w-2.5 h-2.5 rounded-sm shrink-0"
          style={{ backgroundColor: item.fill }}
        />
        <span>{item.name}</span>
      </div>
      <div className="mt-1 font-data text-[#2f5d3a]">
        {item.count}개 · 비중 {item.percent}%
      </div>
    </div>
  );
};

export const BasketRadialChart: React.FC<BasketRadialChartProps> = ({
  basket,
  onSelectCrop,
}) => {
  const { chartData, totalHarvested, maxCount } = useMemo(() => {
    const total = RELIEF_CROPS.reduce((acc, crop) => acc + (basket[crop.id] ?? 0), 0);
    const items: ChartDatum[] = RELIEF_CROPS.map((crop) => {
      const count = basket[crop.id] ?? 0;
      return {
        cropId: crop.id,
        name: crop.nameKo,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
        fill: crop.accentHex,
      };
    })
      .filter((d) => d.count > 0)
      .sort((a, b) => a.count - b.count);

    const max = items.reduce((m, item) => Math.max(m, item.count), 1);
    return { chartData: items, totalHarvested: total, maxCount: max };
  }, [basket]);

  const sortedDesc = useMemo(
    () => [...chartData].sort((a, b) => b.count - a.count),
    [chartData],
  );

  return (
    <section className="rounded-xl border border-[#2c362e]/14 bg-[#f4f0e6] p-4 md:p-5 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h4 className="font-editorial text-base font-semibold text-[#1c231e]">
            수확 바구니 분포 현황
          </h4>
          <p className="text-xs text-[#59655b] mt-0.5">
            농장 수확 및 야생 채집으로 모은 작물 비중을 방사형 막대 그래프로 보여줍니다
          </p>
        </div>
        <span className="font-data text-xs font-semibold text-[#2f5d3a]">
          총 {totalHarvested}개 · {chartData.length}종 보유
        </span>
      </div>

      {totalHarvested === 0 ? (
        <div className="rounded-lg border border-[#2c362e]/10 bg-white/80 py-8 px-4 text-center space-y-1.5">
          <p className="text-sm font-medium text-[#2c362e]">
            아직 수확 바구니에 담긴 작물이 없습니다
          </p>
          <p className="text-xs text-[#647066]">
            농장 밭에서 익은 작물을 수확하거나 야생 서식지의 구황작물을 채집하면 수확 분포 차트가 실시간으로 채워집니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Recharts Radial Bar Chart */}
          <div className="lg:col-span-6 h-60 w-full rounded-lg border border-[#2c362e]/10 bg-white p-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="22%"
                outerRadius="95%"
                barSize={12}
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, maxCount]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background={{ fill: '#eee9dc' }}
                  dataKey="count"
                  cornerRadius={6}
                />
                <Tooltip content={<CustomRadialTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabular Distribution Breakdown */}
          <div className="lg:col-span-6 rounded-lg border border-[#2c362e]/10 bg-white divide-y divide-[#2c362e]/8 max-h-60 overflow-y-auto botanical-scroll">
            {sortedDesc.map((item) => (
              <button
                key={item.cropId}
                type="button"
                onClick={() => onSelectCrop(item.cropId)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-[#f7f4ec] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-xs font-semibold text-[#1c231e] truncate">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-data text-xs">
                  <span className="text-[#2f5d3a] font-semibold">{item.count}개</span>
                  <span className="text-[#69746b] w-10 text-right">{item.percent}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
