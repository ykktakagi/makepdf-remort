import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { ChartRecord, AxisConfig } from '../../types/chartTypes';
import styles from '../../styles/Chart.module.css';
import colorThemes from '../../data/colorThemes';
import { getSelectedTimes } from './utils/getSelectedYears';

export interface Props {
  chartTitle?:  string;
  dataKey:      string;
  data:         ChartRecord[];
  targetYear:   string;
  localGov:     string;
  axisConfig:   AxisConfig;
  colorTheme?:  keyof typeof colorThemes;
  colors?:     string[];
}

const StackedBar: React.FC<Props> = ({
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
  const xKeyRaw       = axisConfig.xKey;
  const yKey          = axisConfig.yKey!;
  const categoryLabel = axisConfig.categoryLabel!;
  const unitLabel     = axisConfig.unit ?? '';

  // 地域データ
  const regionData = data.filter(r => r.region === localGov);

  // 時系列データの取得と displayYear の算出
  const allTimes = Array.from(new Set(regionData.map(r => r.time))).sort();
  const selectedTimes = getSelectedTimes(allTimes, targetYear);

  // 2) targetYear が「YYYY年」ならその数字部分を使い、それ以外は最終年を使う
  const yearMatch = /^\s*(\d+)年\s*$/.exec(targetYear);
  let rawYear: string;

  if (yearMatch) {
    rawYear = yearMatch[1];
  } else {
    rawYear = (
      selectedTimes.length > 0
        ? selectedTimes[selectedTimes.length - 1]
       : allTimes[allTimes.length - 1] ?? ''
    );
  }

// 3) 表示用には必ず「YYYY年」の形にする
const displayYearLabel = `${rawYear}年`;

  // シリーズ（カテゴリ）一覧
  const seriesValues = Array.from(
    new Set(
      regionData
        .map(r => r[categoryLabel as keyof ChartRecord])
        .filter((v): v is string => typeof v === 'string')
    )
  );

  // ピボットデータ作成
  let pivotData: Record<string, any>[] = [];
  if (xKeyRaw) {
    pivotData = selectedTimes.map(xVal => {
      const row: Record<string, any> = { [xKeyRaw]: xVal };
      seriesValues.forEach(sVal => {
        row[sVal] = regionData
          .filter(r =>
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

  // 単年モード時の値マップ
  const valueMap: Record<string, number> = pivotData[pivotData.length - 1];

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        {chartTitle ?? localGov}
        {displayYearLabel && `（${displayYearLabel}）`}
      </h3>
      <div className={styles.chartWrapper}>
        <div className={styles.uniqueChartWithLegend}>
          <div className={styles.subTitle}>{localGov}</div>
          <ResponsiveContainer width="100%" height="100%" >
            <BarChart
              data={pivotData}
              margin={{ top: 10, right: 100, left: 10, bottom: 10 }}
            >
              <XAxis
                dataKey={xKeyRaw ?? 'name'}
                hide={!xKeyRaw}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value: number) => value.toLocaleString()}
              />
              <Tooltip />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ width: 150, fontSize: '14px', paddingLeft: '10px' }}
                formatter={(value: string) => {
                  const num = valueMap[value] ?? 0;
                  return `${value} ${num.toLocaleString()}${unitLabel}（${displayYearLabel}）`;
                }}
              />
              {seriesValues.map((sVal, idx) => (
                <Bar
                  key={sVal}
                  dataKey={sVal}
                  stackId="a"
                  fill={COLORS[idx % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StackedBar;
