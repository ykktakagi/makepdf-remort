// typess/chartTypes.ts
import colorThemes from '@/data/colorThemes';
import type { DashboardDataKey } from '@/data/dataKey-dashboard';
import type { ReinfolibDataKey } from '@/data/dataKey-reinfolib';

/** 統計チャートで使用されるデータレコード型 */
export type ChartRecord = {
  time:     string;
  region:   string;
  category: string;
  value:    number;
};

export type AxisField = keyof ChartRecord | ''; // "time" | "region" | "category" | "value" | ''

/** グラフの軸設定 */
export interface AxisConfig {
  xKey?: AxisField;
  yKey?: AxisField;
  categoryLabel?: AxisField;
  xLabel?: string;
  yLabel?: string;
  unit?: string;
}


/** チャートの種類 */
export type ChartType =
  | '円グラフ'
  | '凡例付き円グラフ'
  | '棒グラフ'
  | '横向き棒グラフ'
  | '積み上げ棒グラフ'
  | 'グループ化棒グラフ'
  | '横向きグループ化棒グラフ'
  | 'レーダーチャート';

/** グラフのレイアウト（比較方法） */
export type Layout = '比較' | '単独';

/** データの提供元（ソース） */
export type Source = '統計ダッシュボード' | '国土地理院';

/** データキー（source に応じて切り替え） */
export type DataKey =
  | { source: '統計ダッシュボード'; dataKey: DashboardDataKey }
  | { source: '国土地理院'; dataKey: ReinfolibDataKey };

/** カラースキーム名 */
export type ColorThemeName = keyof typeof colorThemes;

/** グラフ用のProps */
export interface ChartComponentProps {
    chartTitle:        string;
    chartType:         ChartType;
    source:            '統計ダッシュボード' | '国土交通省' | 'e-Stat'; // 今後追加される想定
    dataKey:           string; // 各 source に応じた key（DashboardDataKey など）
    targetYear:        string;
    prefectureCode:    number;
    prefecture:        string;
    localGovCode:      number;
    localGov:          string;
    colorTheme?:       ColorThemeName;
    colors?:           string[];
    axisConfig:        AxisConfig;
    indicatorCodes?:   string[];
    indicatorLabels?:  string[];
  }
  

/** 地図表示用のProps */
export interface MapComponentProps {
    source:            '国土地理院';
    dataKey:           ReinfolibDataKey;
    prefectureCode:    number;
    prefecture:        string;
    localGovCode:      number;
    localGov:          string;
    localGovName:      string; // 表示用など
    layerUrl?:         string;
    colorMap?:         any[];  // 必要に応じて詳細定義
    hanreiUrl?:        string;
  }
  
/** どちらのPropsかを受け取るためのUnion型（切り替え用） */
export type ComponentProps = ChartComponentProps | MapComponentProps;

