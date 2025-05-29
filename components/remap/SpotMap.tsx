// components/remap/SpotMap.tsx
import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from '../../styles/remap.module.css';

export interface SpotMapProps {
  propertyName: string;
  latitude: number;
  longitude: number;
  spots: Array<{
    spot_name: string;
    spot_cat: string;
    spot_latitude: number;
    spot_longitude: number;
  }>;
}

const SpotMap: React.FC<SpotMapProps> = ({
  propertyName,
  latitude,
  longitude,
  spots,
}) => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: [longitude, latitude],
      zoom: 15,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-left');
    mapRef.current = map;
  }, [latitude, longitude]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 古いマーカーを削除
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // 物件マーカー
    const mansionEl = document.createElement('img');
    mansionEl.src = '/icons/icon_mansion.png';
    mansionEl.style.width = '28px';
    mansionEl.style.height = '38px';
    mansionEl.style.cursor = 'pointer';

    const mansionPopup = new maplibregl.Popup({ offset: [0, -38] }).setText(propertyName);
    const mansionMarker = new maplibregl.Marker({ element: mansionEl, anchor: 'bottom' })
      .setLngLat([longitude, latitude])
      .setPopup(mansionPopup)
      .addTo(map);
    markersRef.current.push(mansionMarker);

    // 施設マーカー群
spots.forEach(spot => {
  const wrapper = document.createElement('div');
  wrapper.className = styles.spotWrapper;

  const label = document.createElement('div');
  label.className = styles.spotLabel;
  label.innerText = spot.spot_name;

  const icon = document.createElement('div');
  icon.className = styles.spotMarker;
  icon.style.backgroundImage = `url(/icons/icon_${spot.spot_cat}.png)`;
  icon.style.backgroundSize = 'contain';
  icon.style.backgroundRepeat = 'no-repeat';
  icon.style.backgroundPosition = 'center';

  wrapper.appendChild(label);
  wrapper.appendChild(icon);

  const marker = new maplibregl.Marker({
    element: wrapper,
    anchor: 'bottom',
  })
    .setLngLat([spot.spot_longitude, spot.spot_latitude])
    .addTo(map);

  markersRef.current.push(marker);
});

  }, [spots, propertyName, latitude, longitude]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  );
};

export default SpotMap;
