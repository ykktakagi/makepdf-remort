// components/map/MapRegistry.ts
import OneMap              from './OneMap';
import RootMap             from './RootMap';
import RasterImageMap      from './RasterImageMap';
import RasterApiMap        from './RasterApiMap';
import PolygonAreaMap      from './PolygonAreaMap';
import PointMarkerMap      from './PointMarkerMap';

export const MapRegistry = {
  /** 単一ポイント */
  marker:       OneMap,
  /** 出発地→目的地ルート */
  route:        RootMap,
  /** タイル画像を重ねる */
  raster:       RasterImageMap,
  /** API で取得する画像を重ねる */
  rasterApi:    RasterApiMap,
  /** GeoJSON 等のポリゴンを描画 */
  polygon:      PolygonAreaMap,
  /** ピン／マーカー群 */
  point:        PointMarkerMap,
} as const;

/** MapRegistry のキー一覧 */
export type MapType = keyof typeof MapRegistry;

/**
 * 各マップコンポーネントは以下の Props を受け取ります。
 * 必要に応じて拡張してください。
 */
export interface MapProps {
  /** 物件名などポップアップに表示する文字列 */
  propertyName: string;
  /** 緯度 */
  propertyLatitude:     number;
  /** 経度 */
  propertyLongitude:    number;
  /** ルートマップ用：目的地名称 */
  destName?:    string;
  /** ルートマップ用：目的地緯度 */
  destLatitude?:  number;
  /** ルートマップ用：目的地経度 */
  destLongitude?: number;
  /** オーバーレイ系マップ用の設定オブジェクト */
  layerConfig?: any;
}
