// components/chart/Pie.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
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

const PieUnique: React.FC<Props> = ({
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
  const yKey          = axisConfig.yKey!;           // 必須
  const categoryLabel = axisConfig.categoryLabel!;  // 必須

  const regionData = data.filter(r => r.region === localGov);
  const allTimes = Array.from(new Set(regionData.map(r => r.time))).sort();
  const selectedTimes = getSelectedTimes(allTimes, targetYear);
  const selectedTime = selectedTimes[0] ?? '';

  const latestData = regionData
    .filter(r => r.time === selectedTime)
    .map(r => ({
      name: r[categoryLabel as keyof ChartRecord] as string,
      value: r[yKey as keyof ChartRecord] as number,
    }));

  const latestYear = selectedTime + '年';

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const r = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + r * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + r * Math.sin(-midAngle * Math.PI / 180);
    return (
      <text x={x} y={y} fill="#000" textAnchor="middle" dominantBaseline="central" fontSize={12}>
        <tspan x={x} dy="-1em">{name}</tspan>
        <tspan x={x} dy="1.2em">{`${(percent * 100).toFixed(1)}%`}</tspan>
      </text>
    );
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{`${chartTitle}（${latestYear}）`}</h3>
      <div className={styles.chartWrapper}>
        <div className={styles.uniqueChart}>
          <div className={styles.subTitle}>{localGov}</div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={latestData}
                dataKey={yKey}
                cx="50%"
                cy="44%"
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
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PieUnique;
