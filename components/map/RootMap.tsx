// components/chart/Bar/RootMap.tsx
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { LatLngExpression } from 'leaflet';
import { useMap } from 'react-leaflet';
import mapStyles from '../../styles/PropertyMap.module.css';

// 地図のサイズを修正するコンポーネント
function FixMapSize({ origin, dest }: { origin: [number, number]; dest: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => {
      map.invalidateSize();
      map.fitBounds([origin, dest], { padding: [50, 50] });
    }, 300); // 少し遅らせることで、描画後に強制サイズ調整
    return () => clearTimeout(id);
  }, [map, origin, dest]);

  return null;
}

// react-leaflet components loaded only on client
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
const Polyline = dynamic(
  () => import('react-leaflet').then(m => m.Polyline),
  { ssr: false }
);

interface Props {
  propertyName:      string;
  propertyLatitude:  number;
  propertyLongitude: number;
  destName:          string;
  destLatitude:      number;
  destLongitude:     number;
}

export default function RootMap({
  propertyName,
  propertyLatitude,
  propertyLongitude,
  destName,
  destLatitude,
  destLongitude,
}: Props) {
  const [originIcon, setOriginIcon]   = useState<any>(null);
  const [destIcon,   setDestIcon]     = useState<any>(null);
  const [routeCoords, setRouteCoords] = useState<LatLngExpression[]>([]);

  // load custom icons
  useEffect(() => {
    import('leaflet').then(L => {
      setOriginIcon(L.icon({
        iconUrl: '/icons/icon_mansion.png',
        iconSize: [28, 38],
        iconAnchor: [14, 38],
      }));
      setDestIcon(L.icon({
        iconUrl: '/icons/icon_C39676.png',
        iconSize: [25, 38],
        iconAnchor: [14, 38],
      }));
    });
  }, []);

  // fetch route from OSRM
  useEffect(() => {
    const o = `${propertyLongitude},${propertyLatitude}`;
    const d = `${destLongitude},${destLatitude}`;
    fetch(`https://router.project-osrm.org/route/v1/driving/${o};${d}?overview=full&geometries=geojson`)
      .then(res => res.json())
      .then(json => {
        const coords = json.routes?.[0]?.geometry?.coordinates;
        if (coords) {
          setRouteCoords(
            coords.map(
              ([lng, lat]: [number, number]) => [lat, lng] as LatLngExpression
            )
          );
        }
      })
      .catch(console.error);
  }, [propertyLatitude, propertyLongitude, destLatitude, destLongitude]);

  if (!originIcon || !destIcon) return null;

  const origin: [number, number] = [propertyLatitude, propertyLongitude];
  const dest: [number, number] = [destLatitude, destLongitude];

  return (
    <div className={mapStyles.mapWrapper}>
      <MapContainer
        bounds={[origin, dest]}
        boundsOptions={{ padding: [50, 50] }}
        className={mapStyles.mapContainer}
        style={{ width: '100%', height: '300px' }}
      >
        <FixMapSize origin={origin} dest={dest} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <Marker position={origin} icon={originIcon}>
          <Popup>{propertyName}</Popup>
        </Marker>
        <Marker position={dest} icon={destIcon}>
          <Popup>{destName}</Popup>
        </Marker>

        {routeCoords.length > 0 && (
          <Polyline
            pathOptions={{ color: 'blue', opacity: 0.6, weight: 5 }}
            positions={routeCoords}
          />
        )}
      </MapContainer>
    </div>
  );
}
