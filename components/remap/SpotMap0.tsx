// components/remap/SpotMap.tsx
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// SSR 対策で動的インポート
const MapContainer = dynamic(
  () => import('react-leaflet').then(m => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(m => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(m => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then(m => m.Popup),
  { ssr: false }
);

export interface SpotMapProps {
  /** プロパティ自身の名前（常に表示するマーカー用） */
  propertyName: string;
  /** プロパティ自身の中心緯度 */
  latitude: number;
  /** プロパティ自身の中心経度 */
  longitude: number;
  /** 選択中カテゴリの施設一覧 */
  spots: { spot_name: string; spot_latitude: number; spot_longitude: number }[];
  /** タブに対応するカラーコード（"#D17D68" など） */
  iconColor: string;
}

// 常に表示するプロパティ用のマンションアイコン
const mansionIcon = L.icon({
  iconUrl: '/icons/icon_mansion.png',
  iconRetinaUrl: '/icons/icon_mansion.png',
  iconSize: [28, 38],
  iconAnchor: [14, 38],
  popupAnchor: [0, -33],
});

const SpotMap: React.FC<SpotMapProps> = ({
  propertyName,
  latitude,
  longitude,
  spots,
  iconColor,
}) => {
  // 色付き施設アイコン (icon_<カラーコード>.png)
  const facilityIcon = useMemo(() => {
    const filename = iconColor.replace('#', '');
    return L.icon({
      iconUrl: `/icons/icon_${filename}.png`,
      iconRetinaUrl: `/icons/icon_${filename}.png`,
      iconSize: [25, 38],
      iconAnchor: [12, 38],
      popupAnchor: [0, -33],
    });
  }, [iconColor]);

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      scrollWheelZoom={false}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 常に表示するプロパティマーカー */}
      <Marker position={[latitude, longitude]} icon={mansionIcon}>
        <Popup>{propertyName}</Popup>
      </Marker>

      {/* 選択中カテゴリの施設マーカー */}
      {spots.map(spot => (
        <Marker
          key={spot.spot_name}
          position={[spot.spot_latitude, spot.spot_longitude]}
          icon={facilityIcon}
        >
          <Popup>{spot.spot_name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default SpotMap;
