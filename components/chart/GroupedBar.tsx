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
import type { ChartRecord, AxisConfig } from '../../types/chartTypes';
import styles from '../../styles/Chart.module.css';
import colorThemes from '../../data/colorThemes';
import { getSelectedTimes } from './utils/getSelectedYears';

export interface Props {
  chartTitle?: string;
  dataKey:     string;
  data:        ChartRecord[];
  targetYear:  string;
  localGov:    string;
  axisConfig:  { xKey?: string; categoryLabel?: string; yKey?: string; unit?: string };
  colorTheme?: keyof typeof colorThemes;
  colors?:     string[];
}

const GroupedBar: React.FC<Props> = ({
  chartTitle,
  data,
  targetYear,
  localGov,
  axisConfig: { xKey, categoryLabel, yKey, unit },
  colorTheme = 'default',
  colors,
}) => {
  // カラー設定
  const COLORS = (colors && colors.length > 0)
    ? colors
    : (colorThemes[colorTheme] ?? colorThemes['default']);

  // x軸キー（時系列フィールド名）
  const xKeyRaw = xKey;

  // 対象自治体データ
  const regionData = data.filter(r => r.region === localGov);

  // --- 最新年を決定するロジック ---
  // 1) 全時系列をソート取得
  const allTimes = Array.from(
    new Set(regionData.map(r => r[xKeyRaw as keyof ChartRecord] as string))
  ).sort();

  // 2) getSelectedTimes で対象年リストを取得
  const selectedTimes = getSelectedTimes(allTimes, targetYear);

  // 3) rawYear: 年ラベル("2020年")なら数字部分を、そうでなければ selectedTimes の末尾を採用
  const yearMatch = /^\s*(\d+)年\s*$/.exec(targetYear);
  const rawYear = yearMatch
    ? yearMatch[1]
    : (selectedTimes.length > 0
        ? selectedTimes[selectedTimes.length - 1]
        : allTimes[allTimes.length - 1] ?? ''
      );

  // 4) 表示用ラベルを「YYYY年」に統一
  const displayYearLabel = `${rawYear}年`;

  // --- カテゴリ一覧を取得 ---
  const seriesValues = Array.from(
    new Set(
      regionData
        .map(r => r[categoryLabel as keyof ChartRecord])
        .filter((v): v is string => typeof v === 'string')
    )
  ).sort();

  // --- pivotData を作成 ---
  let pivotData: Record<string, any>[];
  if (xKeyRaw) {
    pivotData = selectedTimes.map(timeVal => {
      const row: Record<string, any> = { [xKeyRaw]: timeVal };
      seriesValues.forEach(cat => {
        row[cat] = regionData
          .filter(r =>
            (r[xKeyRaw as keyof ChartRecord] as string) === timeVal &&
            (r[categoryLabel as keyof ChartRecord] as string) === cat
          )
          .reduce((sum, r) => sum + (r[yKey as keyof ChartRecord] as number), 0);
      });
      return row;
    });
  } else {
    // 時系列なし（単一棒）の場合
    const row: Record<string, any> = { name: localGov };
    seriesValues.forEach(cat => {
      row[cat] = regionData
        .filter(r => (r[categoryLabel as keyof ChartRecord] as string) === cat)
        .reduce((sum, r) => sum + (r[yKey as keyof ChartRecord] as number), 0);
    });
    pivotData = [row];
  }

  if (!pivotData.length) {
    return <p>データがありません</p>;
  }

  // --- 最新年行を取得 ---
  const latestRow = xKeyRaw
    ? pivotData.find(r => r[xKeyRaw] === rawYear) ?? pivotData[pivotData.length - 1]
    : pivotData[pivotData.length - 1];

  // --- valueMap: 各カテゴリの最新年値だけを格納 ---
  const valueMap: Record<string, number> = seriesValues.reduce((acc, cat) => {
    acc[cat] = (latestRow[cat] as number) ?? 0;
    return acc;
  }, {} as Record<string, number>);

  // 単位ラベル
  const unitLabel = unit ?? '';

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        {chartTitle ?? localGov}
        {displayYearLabel && `（${displayYearLabel}）`}
      </h3>
      <div className={styles.chartWrapper}>
        <div className={styles.uniqueChartWithLegend}>
          <div className={styles.subTitle}>{localGov}</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={pivotData}
              margin={{ top: 10, right: 100, left: 10, bottom: 0 }}
              barCategoryGap="10%"
              barGap={0}
            >
              <XAxis
                dataKey={xKeyRaw ?? 'name'}
                hide={!xKeyRaw}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v: number) => v.toLocaleString()}
              />
              <Tooltip />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{
                  width: 150,
                  fontSize: '14px',
                  paddingLeft: '10px',
                }}
                formatter={(value: string) =>
                  `${value}：${(valueMap[value] ?? 0).toLocaleString()}${unitLabel}（${displayYearLabel}）`
                }
              />
              {seriesValues.map((sVal, idx) => (
                <Bar
                  key={sVal}
                  dataKey={sVal}
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

export default GroupedBar;
