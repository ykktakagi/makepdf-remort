// components/OneMap.tsx
import dynamic from 'next/dynamic';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
import mapStyles from '../styles/PropertyMap.module.css';

// Leaflet コンポーネントをクライアント読み込み
const MapContainer = dynamic(
  () => import('react-leaflet').then(m => m.MapContainer),
  { ssr: false }
);
const TileLayer  = dynamic(
  () => import('react-leaflet').then(m => m.TileLayer),
  { ssr: false }
);
const Marker    = dynamic(
  () => import('react-leaflet').then(m => m.Marker),
  { ssr: false }
);
const Popup     = dynamic(
  () => import('react-leaflet').then(m => m.Popup),
  { ssr: false }
);

type StageData = {
  propertyName: string;
  propertyLatitude: number;
  propertyLongitude: number;
};

const OneMap: React.FC = () => {
  const [data, setData] = useState<StageData | null>(null);
  const [icon, setIcon] = useState<any>(null);

  useEffect(() => {
    // データ読み込み
    import('../data/fujisawaHighStage.json').then(mod => {
      setData(mod.default.top);
    });
    // アイコン生成
    import('leaflet').then(L => {
      const mansionIcon = L.icon({
        iconUrl: '/icons/icon_mansion.png',
        iconRetinaUrl: '/icons/icon_mansion.png',
        iconSize: [28, 38],
        iconAnchor: [14, 38],
        popupAnchor: [0, -33],
      });
      setIcon(mansionIcon);
    });
  }, []);

  if (!data || !icon) return null; // 読み込み完了まで何も描画しない

  const position: LatLngExpression = [
    data.propertyLatitude,
    data.propertyLongitude,
  ];

  return (
    <div className={mapStyles.mapWrapper}>
      <MapContainer
        center={position}
        zoom={15}
        className={mapStyles.mapContainer}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={position} icon={icon}>
          <Popup>{data.propertyName}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default OneMap;
