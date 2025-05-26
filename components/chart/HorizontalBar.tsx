// components/chart/Bar/HorizontalBar.tsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LabelList,            // 追加
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
  axisConfig:  AxisConfig;  // { xKey?, yKey?, unit? }
  colorTheme?: keyof typeof colorThemes;
  colors?:     string[];
}

const HorizontalBar: React.FC<Props> = ({
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
  
  // xKey, yKey に加えて unit を取得
  const {
    xKey = 'time',
    yKey = 'value',
    unit: unitLabel = '',
  } = axisConfig;

  // 指定地域のデータを抽出
  const regionData = data.filter(r => r.region === localGov);

  // 時系列一覧と最新時選択
  const allTimes      = Array.from(new Set(regionData.map(r => r.time))).sort();
  const selectedTimes = getSelectedTimes(allTimes, targetYear);
  const selectedTime  = selectedTimes[0] ?? '';

  const pivotData = regionData
    .filter(r => r.time === selectedTime)
    .map((r, idx) => ({
      [xKey]: r.category,
      [yKey]: r.value,
      color:  COLORS[idx % COLORS.length],
    }));

  if (!pivotData.length) {
    return <p>データがありません</p>;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{`${chartTitle}（${selectedTime}年）`}</h3>
      <div className={styles.chartWrapper}>
        <div className={styles.uniqueChartWithLegend}>
          <div className={styles.subTitle}>{localGov}</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={pivotData}
              layout="vertical"
              margin={{ top: 0, right: 80, left: 50, bottom: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                // 千区切り＆単位を付与
                tickFormatter={(value: number) =>
                  `${value.toLocaleString()}${unitLabel}`
                }
              />
              <YAxis
                dataKey={xKey}
                type="category"
                tick={{ fontSize: 12 }}
                width={100}
                interval={0}
              />
              <Tooltip
                // ツールチップにも千区切り＋単位
                formatter={(value: number) =>
                  `${value.toLocaleString()}${unitLabel}`
                }
              />
              <Bar dataKey={yKey} fill={COLORS[0]}>
                {/* 棒の上に値を一つ置きに表示せず、すべて表示 */}
                <LabelList
                  dataKey={yKey}
                  position="right"
                  formatter={(value: number) =>
                    `${value.toLocaleString()}${unitLabel}`
                  }
                  style={{ fontSize: 12 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HorizontalBar;
