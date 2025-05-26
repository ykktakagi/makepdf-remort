import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { ChartRecord, AxisConfig } from '../../types/chartTypes';
import styles from '../../styles/Chart.module.css';
import colorThemes from '../../data/colorThemes';
import { getSelectedTimes } from './utils/getSelectedYears';

export interface Props {
  chartTitle?: string;
  dataKey: string;
  data: ChartRecord[];
  targetYear: string;
  localGov: string;
  colorTheme?: keyof typeof colorThemes;
  colors?:     string[];
  axisConfig?: AxisConfig;
}

const PieWithLegend: React.FC<Props> = ({
  chartTitle,
  data,
  targetYear,
  localGov,
  colorTheme = 'default',
  colors,
  axisConfig = {},
}) => {
  const COLORS = (colors && colors.length > 0)
    ? colors
    : (colorThemes[colorTheme] ?? colorThemes['default']);
  const yKey = axisConfig.yKey!;
  const categoryLabel = axisConfig.categoryLabel!;

  // データ整形
  const regionData = data.filter(r => r.region === localGov);
  const allTimes = Array.from(new Set(regionData.map(r => r.time))).sort();
  const selectedTimes = getSelectedTimes(allTimes, targetYear);
  const selectedTime = selectedTimes[0] ?? '';

  const rawData = regionData
    .filter(r => r.time === selectedTime)
    .map(r => ({
      name: r[categoryLabel as keyof ChartRecord] as string,
      value: r[yKey as keyof ChartRecord] as number,
    }));
  const total = rawData.reduce((sum, d) => sum + d.value, 0);
  const latestData = rawData.map(d => ({ ...d, percent: d.value / total }));
  const latestYear = selectedTime + '年';

  // ラベル描画: 10%以上のみ内部に名前+%を表示
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    if (percent < 0.1) return null;
    const { name } = latestData[index];
    const percentText = `${(percent * 100).toFixed(1)}%`;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    return (
      <text x={x} y={y} fill="#000" textAnchor="middle" dominantBaseline="central" fontSize={12}>
        <tspan x={x} dy="-0.6em">{name}</tspan>
        <tspan x={x} dy="1em">{percentText}</tspan>
      </text>
    );
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{`${chartTitle}（${latestYear}）`}</h3>
      <div className={styles.chartWrapper}>
        <div className={styles.uniqueChartWithLegend}>
          <div className={styles.subTitle}>{localGov}</div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={latestData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={90}
                startAngle={90}
                endAngle={-270}
                label={renderLabel}
                labelLine={false}
              >
                {latestData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: '14px' }}
                formatter={(value: string, entry: any) =>
                  `${value} ${(entry.payload.percent * 100).toFixed(1)}%`
                }
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PieWithLegend;
