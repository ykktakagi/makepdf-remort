import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import styles from '../../styles/Chart.module.css';
import colorThemes from '../../data/colorThemes';
import type { ChartRecord } from '../../types/chartTypes';
import { getSelectedTimes } from './utils/getSelectedYears';

export interface Props {
  chartTitle?: string;
  dataKey: string;
  data: ChartRecord[];
  targetYear: string;
  localGov: string;
  axisConfig: { xKey?: string; categoryLabel?: string; yKey?: string };
  colorTheme?: keyof typeof colorThemes;
  colors?:     string[];
}

const HorizontalGroupedBar: React.FC<Props> = ({
  chartTitle,
  data,
  targetYear,
  localGov,
  axisConfig,
  colorTheme = 'default',
  colors,
}) => {
  const COLORS = (colors && colors.length > 0)
    ? colors
    : (colorThemes[colorTheme] ?? colorThemes['default']);
  const xKeyRaw = axisConfig.xKey;
  const yKey = axisConfig.yKey!;
  const categoryLabel = axisConfig.categoryLabel!;

  const regionData = data.filter(r => r.region === localGov);

  const seriesValues = Array.from(
    new Set(
      regionData
        .map(r => r[categoryLabel as keyof ChartRecord])
        .filter((v): v is string => typeof v === 'string')
    )
  ).sort();

  let pivotData: Record<string, any>[];

  if (xKeyRaw) {
    const allTimes = Array.from(new Set(regionData.map(r => r[xKeyRaw as keyof ChartRecord] as string))).sort();
    const selectedTimes = getSelectedTimes(allTimes, targetYear);

    pivotData = selectedTimes.map(xVal => {
      const row: Record<string, any> = { [xKeyRaw]: xVal };
      seriesValues.forEach(sVal => {
        row[sVal] = regionData
          .filter(
            r =>
              (r[xKeyRaw as keyof ChartRecord] as string) === xVal &&
              (r[categoryLabel as keyof ChartRecord] as string) === sVal
          )
          .reduce((sum, r) => sum + (r[yKey as keyof ChartRecord] as number), 0);
      });
      return row;
    });
  } else {
    const row: Record<string, any> = { name: localGov };
    seriesValues.forEach(sVal => {
      row[sVal] = regionData
        .filter(r => (r[categoryLabel as keyof ChartRecord] as string) === sVal)
        .reduce((sum, r) => sum + (r[yKey as keyof ChartRecord] as number), 0);
    });
    pivotData = [row];
  }

  if (!pivotData.length) {
    return <p>データがありません</p>;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{chartTitle ?? localGov}</h3>
      <div className={styles.chartWrapper}>
        <div className={styles.uniqueChartWithLabel}>
          <div className={styles.subTitle}>{localGov}</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={pivotData}
              margin={{ top: 10, right: 80, left: 10, bottom: 10 }}
              barCategoryGap="10%"
              barGap={0}
            >
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                dataKey={xKeyRaw ?? 'name'}
                type="category"
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ fontSize: '14px' }}
              />
              {seriesValues.map((sVal, idx) => (
                <Bar key={sVal} dataKey={sVal} fill={COLORS[idx % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HorizontalGroupedBar;
