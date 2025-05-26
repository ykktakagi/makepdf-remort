// components/chart/BarUnique.tsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from 'recharts';
import type { ChartRecord, AxisConfig } from '../../types/chartTypes';
import styles from '../../styles/Chart.module.css';
import colorThemes from '../../data/colorThemes';
import { getSelectedTimes } from './utils/getSelectedYears';

export interface Props {
  chartTitle?: string;
  dataKey:     string;
  data:        ChartRecord[];
  targetYear:  string;   // "最新", "過去10年", "2003年" など
  localGov:    string;
  axisConfig:  AxisConfig; // { xKey?: string; yKey?: string; unit?: string }
  colorTheme?: keyof typeof colorThemes;
  colors?:     string[];
}

const BarUnique: React.FC<Props> = ({
  chartTitle,
  data,
  targetYear,
  localGov,
  axisConfig,
  colorTheme = 'default',
  colors,
}) => {
  // カラー設定
  const COLORS = (colors && colors.length > 0)
    ? colors
    : (colorThemes[colorTheme] ?? colorThemes['default']);
  const {
    xKey = 'time',
    yKey = 'value',
    unit: unitLabel = '',
  } = axisConfig;

  // 地域データ抽出
  const regionData = data.filter(r => r.region === localGov);

  // --- タイトル用の「年」ラベル計算 ---
  const allTimes      = Array.from(new Set(regionData.map(r => r[xKey as keyof ChartRecord] as string))).sort();
  const selectedTimes = getSelectedTimes(allTimes, targetYear);
  let displayYear = targetYear;
  if (targetYear === '最新' && selectedTimes.length > 0) {
    displayYear = selectedTimes[0];  // ex. "2023"
  }
  let displayYearLabel: string | undefined;
  if (targetYear === '最新') {
    displayYearLabel = `${displayYear}年`;
  } else if (/^\d+年$/.test(targetYear)) {
    displayYearLabel = targetYear;
  }

  // --- pivotData 作成 (時系列バー) ---
  const pivotData: { [key: string]: any }[] = selectedTimes.map(timeVal => {
    const sum = regionData
      .filter(r => (r[xKey as keyof ChartRecord] as string) === timeVal)
      .reduce((s, r) => s + (r[yKey as keyof ChartRecord] as number), 0);
    return {
      [xKey]: timeVal,
      [yKey]: sum,
    };
  });

  if (!pivotData.length) {
    return <p>データがありません</p>;
  }

  // ラベルを一つ置きに描画（右端＝最新から）
  const dataLen = pivotData.length;
  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, value, index } = props;
    // 右most(index dataLen-1), 左に向かって一つ置き
    if ((dataLen - 1 - index) % 2 !== 0) return null;
    const cx = x + width / 2;
    const cy = y - 6;
    return (
      <text
        x={cx}
        y={cy}
        fill="#000"
        fontSize={12}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {`${(value as number).toLocaleString()}`}
      </text>
    );
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        {chartTitle ?? localGov}
        {displayYearLabel && `（${displayYearLabel}）`}
      </h3>
      <div className={styles.chartWrapper}>
        <div className={styles.uniqueChart}>
          <div className={styles.subTitle}>{localGov}</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={pivotData}
              margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
            >
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v: number) => v.toLocaleString()}
                label={{
                  value: `[${unitLabel}]`,
                  angle: -90,
                  position: 'insideLeft',
                  dx: -10,
                  style: { fontSize: 12 },
                }}
              />
              <Tooltip
                formatter={(v: number) => `${v.toLocaleString()}[${unitLabel}]`}
              />
              <Bar dataKey={yKey} fill={COLORS[0]}>
                <LabelList dataKey={yKey} content={renderCustomizedLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BarUnique;
