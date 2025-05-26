// types/mapTypes.ts

/**
 * LayerInfo は、マップの各レイヤー設定を表します。
 */
export interface LayerInfo {
  /** タイル URL や API エンドポイント */
  url: string;
  /** オーバーレイ／レイヤーの種別 */
  layerType: '色付き画像タイル'
            | '色付き画像API'
            | '色付き画像重ね'
            | 'ポリゴン描画'
            | 'ピンやマーカー';
  /** ズームレベルの範囲 */
  zoomLevel: { min: number; max: number };
  /** 凡例画像のパス */
  hanrei: string;
  /** 任意の追加フィールドを許容 */
  [key: string]: any;
}

/**
 * MapRegistry で扱う mapType。
 * marker→OneMap, route→RootMap, raster→RasterImageMap など
 */
export type MapType =
  | 'marker'
  | 'route'
  | 'raster'
  | 'rasterApi'
  | 'polygon'
  | 'point';

/**
 * MapWrapper に渡す共通 Props。
 * mapType に応じて必要なフィールドだけ使われます。
 */
export interface MapProps {
  /** 使用するマップの種類 */
  mapType: MapType;

  /** ポップアップに表示する物件名など */
  propertyName: string;
  propertyLatitude:     number;
  propertyLongitude:    number;

  /** ルート用オプション */
  destName?:      string;
  destLatitude?:  number;
  destLongitude?: number;

  /** オーバーレイ系用オプション */
  layerConfig?: {
    source:       '国土地理院' | '不動産ライブラリ';
    mapLayerType: string;
  };
}
