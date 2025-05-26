// components/MapWrapper.tsx
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { LayerInfo } from '../types/mapTypes';
import { gsiHazardmapportal } from '../data/dataKey-gsiHazardmapportal';
import { dataKeyReinfolib }       from '../data/dataKey-reinfolib';

// 動的読み込み
const OneMap         = dynamic(() => import('./map/OneMap'),              { ssr: false });
const RootMap        = dynamic(() => import('./map/RootMap'),        { ssr: false });
const RasterImageMap = dynamic(() => import('./map/RasterImageMap'),     { ssr: false });
// （他のオーバーレイ系マップも同様に dynamic）

interface Props {
  mapType:         'marker' | 'route' | 'raster' /* | ...他の mapType */;
  propertyName:    string;
  propertyLatitude:        number;
  propertyLongitude:       number;
  destName?:       string;
  destLatitude?:   number;
  destLongitude?:  number;
  layerConfig?: {
    source:       '国土地理院' | '不動産ライブラリ';
    mapLayerType: string;
  };
}

const MapWrapper: React.FC<Props> = props => {
  const {
    mapType,
    propertyName,
    propertyLatitude,
    propertyLongitude,
    destName,
    destLatitude,
    destLongitude,
    layerConfig,
  } = props;

  // ─── 1) marker / route ─────────────────────────────
  if (mapType === 'marker') {
    return (
      <OneMap
        propertyName={propertyName}
        propertyLatitude={propertyLatitude}
        propertyLongitude={propertyLongitude}
      />
    );
  }
  if (mapType === 'route') {
    if (!destName || destLatitude == null || destLongitude == null) {
      return <p>ルート表示に必要な宛先情報が不足しています。</p>;
    }
    return (
      <RootMap
        propertyName={propertyName}
        propertyLatitude={propertyLatitude}
        propertyLongitude={propertyLongitude}
        destName={destName}
        destLatitude={destLatitude}
        destLongitude={destLongitude}
      />
    );
  }

  // ─── 2) raster（オーバーレイ系）───────────────────
  if (mapType === 'raster') {
    if (!layerConfig) {
      return <p>オーバーレイ情報がありません。</p>;
    }
    // config を解決
    const cfgSource = layerConfig.source === '国土地理院'
      ? gsiHazardmapportal
      : (dataKeyReinfolib as Record<string,LayerInfo>);
    const info = cfgSource[layerConfig.mapLayerType];
    if (!info) {
      return <p>地図レイヤー `{layerConfig.mapLayerType}` が見つかりません。</p>;
    }
    return (
      <RasterImageMap
        mapLayerType={layerConfig.mapLayerType}
        config={info}
        propertyName={propertyName}
        propertyLatitude={propertyLatitude}
        propertyLongitude={propertyLongitude}
      />
    );
  }

  // 必要に応じて他の mapType もここでハンドル

  return <p>不明な mapType: {mapType}</p>;
};

export default MapWrapper;
