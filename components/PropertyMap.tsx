// components/PropertyMap.tsx
import dynamic from 'next/dynamic';
// 型のみをインポート。実行時には Leaflet 本体はここでは読まれない
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
import styles from '../styles/PropertyMap.module.css';

// React-Leaflet コンポーネントはすでに動的読み込み済みなので SSR 安心
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

type Props = {
  propertyName: string;
  latitude: number;
  longitude: number;
};

const PropertyMap: React.FC<Props> = ({ propertyName, latitude, longitude }) => {
  const position: LatLngExpression = [latitude, longitude];
  // クライアントでのみ L.icon() を生成
  const [mansionIcon, setMansionIcon] = useState<any>(null);

  useEffect(() => {
    // 動的に leaflet 本体を読み込む
    import('leaflet').then(L => {
      const icon = L.icon({
        iconUrl: '/icons/icon_mansion.png',
        iconRetinaUrl: '/icon/mansion.png',
        iconSize: [28, 38],
        iconAnchor: [14, 38],
        popupAnchor: [0, -32],
      });
      setMansionIcon(icon);
    });
  }, []);

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        center={position}
        zoom={15}
        className={styles.mapContainer}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {/* アイコンが準備できたら Marker を描画 */}
        {mansionIcon && (
          <Marker position={position} icon={mansionIcon}>
            <Popup>{propertyName}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
