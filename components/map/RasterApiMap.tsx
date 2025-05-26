// components/map/RasterApiMap.tsx
// 不動産ライブラリのラスター画像？？をレイヤーに置くものです。ある位置での情報は地図に乗せられたtgb情報から取得します
// APIキーが必要です
import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, ImageOverlay } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from '../../styles/mapText.module.css'
import { LatLngBounds } from 'leaflet'

interface ColorMapEntry {
  [key: string]: any
}

interface ApiResponse {
  imageUrl: string;
  bounds: [[number, number], [number, number]]; // [southWest, northEast]
  colorMap: ColorMapEntry[];
}

interface Props {
  mapLayerType: string;
  config: {
    url: string;
    hanrei: string;
    zoomLevel: { min: number; max: number };
    colorMap: ColorMapEntry[];
  };
  propertyName: string;
  propertyLatitude: number;
  propertyLongitude: number;
}

const mansionIcon = L.icon({
  iconUrl: '/icons/icon_mansion.png',
  iconRetinaUrl: '/icons/icon_mansion.png',
  iconSize: [28, 38],
  iconAnchor: [14, 38],
  popupAnchor: [0, -33],
})

export default function RasterApiMap({
  mapLayerType,
  config,
  propertyName,
  propertyLatitude,
  propertyLongitude,
}: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [bounds, setBounds] = useState<LatLngBounds | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiKey = process.env.REACT_APP_REINFOLIB_API_KEY;

        const fullUrl = apiKey
          ? `${config.url}?key=${apiKey}`
          : config.url;

        const res = await fetch(fullUrl);
        const data: ApiResponse = await res.json();

        if (data.imageUrl && data.bounds) {
          setImageUrl(data.imageUrl);
          setBounds(L.latLngBounds(data.bounds[0], data.bounds[1]));
        } else {
          setError('画像データが取得できませんでした。');
        }
      } catch (err) {
        setError('APIデータの取得に失敗しました。');
        console.error(err);
      }
    };

    fetchData();
  }, [config]);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{mapLayerType}</h3>

      <div className={styles.map}>
        <MapContainer
          center={[propertyLatitude, propertyLongitude]}
          zoom={15}
          minZoom={config.zoomLevel.min}
          maxZoom={config.zoomLevel.max}
          className={styles.map}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />

          {imageUrl && bounds && (
            <ImageOverlay url={imageUrl} bounds={bounds} opacity={0.6} />
          )}

          <Marker position={[propertyLatitude, propertyLongitude]} icon={mansionIcon} />
        </MapContainer>
      </div>

      <div className={styles.info}>
        {error ? (
          <p>{error}</p>
        ) : (
          <p>この地点の画像データを表示しています。</p>
        )}
        <div className={styles.legend}>
          凡例
          <img src={config.hanrei} alt="凡例" className={styles.legend} />
        </div>
      </div>
    </div>
  );
}
