// components/chart/Radar.tsx
import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import type { ChartRecord, AxisConfig } from '../../types/chartTypes';
import styles from '../../styles/Chart.module.css';
import colorThemes from '../../data/colorThemes';
import { getSelectedTimes } from './utils/getSelectedYears';

export interface Props {
  chartTitle: string;
  data: ChartRecord[];
  targetYear: string;
  localGov: string;
  colorTheme?: keyof typeof colorThemes;
  colors?:     string[];
  axisConfig?: AxisConfig;
}

const RadarUnique: React.FC<Props> = ({
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
  const { categoryLabel = 'category', yKey = 'value' } = axisConfig;

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

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{`${chartTitle}（${latestYear}）`}</h3>
      <div className={styles.chartWrapper}>
        <div className={styles.uniqueChart}>
          <div className={styles.subTitle}>{localGov}</div>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={latestData} cx="50%" cy="50%" outerRadius="65%">
              <PolarGrid />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} />
              <Radar
                name={localGov}
                dataKey="value"
                stroke={COLORS[0]}
                fill={COLORS[0]}
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RadarUnique;
