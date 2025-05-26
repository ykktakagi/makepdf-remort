// components/ChartWrapper.tsx
import React, { useEffect, useState } from 'react';
import Pie from './chart/Pie';
import PieWithLegend from './chart/PieWithLegend';
import Bar from './chart/Bar';
import HorizontalBar from './chart/HorizontalBar';
import StackedBar from './chart/StackedBar';
import GroupedBar from './chart/GroupedBar';
import HorizontalGroupedBar from './chart/HorizontalGroupedBar';
import Radar from './chart/Radar';
import { fetchDataDashboard } from '../lib/fetchData-dashboard';

import type { ChartRecord, ChartType, Source, AxisConfig } from '../types/chartTypes';

interface Props {
  chartTitle:      string;
  chartType:       ChartType;
  source:          Source;
  dataKey:         string;
  targetYear:      string;
  prefectureCode:  number;
  prefecture:      string;
  localGovCode:    number;
  localGov:        string;
  colorTheme?:     'default' | 'corporate' | 'casual' | 'pastel';
  colors?:         string[];
  axisConfig:      AxisConfig;
}

type ChartComponentProps = {
  chartTitle:   string;
  dataKey:      string;
  data:         ChartRecord[];
  targetYear:   string;
  localGov:     string;
  colorTheme?:  Props['colorTheme'];
  colors?:        string[];
  axisConfig:   AxisConfig;
  prefecture?:     string;
  prefectureCode?: number;
};

export default function ChartWrapper({
  chartTitle,
  chartType,
  source,
  dataKey,
  targetYear,
  prefectureCode,
  prefecture,
  localGovCode,
  localGov,
  colorTheme = 'default',
  colors,
  axisConfig,
}: Props) {
  const [data, setData] = useState<ChartRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDataDashboard(
      dataKey,
      localGovCode,
      localGov,
      prefectureCode,
      prefecture,
      '',
      ''
    )
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dataKey, localGovCode, localGov, prefectureCode, prefecture, source]);

  if (loading) return <p>Loading…</p>;

  const COMPONENT_MAP: Record<ChartType, React.FC<ChartComponentProps>> = {
    '円グラフ': Pie,
    '凡例付き円グラフ': PieWithLegend,
    '棒グラフ': Bar,
    '横向き棒グラフ': HorizontalBar,
    '積み上げ棒グラフ': StackedBar,
    'グループ化棒グラフ': GroupedBar,
    '横向きグループ化棒グラフ': HorizontalGroupedBar,
    'レーダーチャート': Radar,
  };

  const SelectedChart = COMPONENT_MAP[chartType];
  if (!SelectedChart) {
    return <p>対応していないチャートタイプです</p>;
  }

  const commonProps: ChartComponentProps = {
    chartTitle,
    dataKey,
    data,
    targetYear,
    localGov,
    colorTheme,
    colors,
    axisConfig,
    prefecture,
    prefectureCode,
  };

  return <SelectedChart {...commonProps} />;
}
