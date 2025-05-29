// src/components/remap/Hazard/TsunamiMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ImageS3URL } from '../../../config';
import styles from '../../../styles/remap.module.css';

export interface TsunamiMapProps {
  propertyName: string;
  latitude: number;
  longitude: number;
}

// 津波タイル定義
const tsunamiTileLayers: Record<string, string> = {
  '津波浸水想定': 'https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png',
};

// 解説データ
const tsunamiExplaines: Record<string, {
  explanation: string;
  hanrei?: string;
  urls: { label: string; href: string }[];
}> = {
  '津波浸水想定': {
    explanation: '津波が発生した際に浸水が想定される区域と水深',
    hanrei: 'shinsui_legend3.png',
    urls: [
      { label: 'データの掲載状況一覧', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/tsunami_sinsui.html' },
      { label: 'データについて',         href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/copyright_data.html' },
    ],
  },
};

const TsunamiMap: React.FC<TsunamiMapProps> = ({ propertyName, latitude, longitude }) => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 初期では全レイヤーON
  const [activeLayers, setActiveLayers] = useState<string[]>(Object.keys(tsunamiTileLayers));
  const [menuOpen, setMenuOpen] = useState(false);
  const [openExplanationKey, setOpenExplanationKey] = useState<string | null>(null);

  // 地図初期化 & レイヤー追加
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
        layers: [
          { id: 'osm', type: 'raster', source: 'osm' },
        ],
      },
      center: [longitude, latitude],
      zoom: 15,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-left');

    map.on('load', () => {
      // 中心マーカー
      const el = document.createElement('img');
      el.src = '/icons/icon_mansion.png';
      el.style.width = '28px';
      el.style.height = '38px';
      el.style.cursor = 'pointer';
      new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([longitude, latitude])
        .setPopup(new maplibregl.Popup({ offset: [0, -38] }).setText(propertyName))
        .addTo(map);

      // 津波レイヤーを一度だけ追加
      Object.entries(tsunamiTileLayers).forEach(([name, url], idx) => {
        const sourceId = `tsunami-source-${idx}`;
        const layerId  = `tsunami-layer-${idx}`;

        map.addSource(sourceId, {
          type: 'raster',
          tiles: [url],
          tileSize: 256,
        });

        map.addLayer({
          id: layerId,
          type: 'raster',
          source: sourceId,
          layout: {
            visibility: activeLayers.includes(name) ? 'visible' : 'none',
          },
          paint: {
            'raster-opacity': 0.5,
          },
        });
      });
    });

    mapRef.current = map;
  }, [latitude, longitude, propertyName, activeLayers]);

  // activeLayers が変化したら visibility を更新
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    Object.keys(tsunamiTileLayers).forEach((name, idx) => {
      const layerId = `tsunami-layer-${idx}`;
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(
          layerId,
          'visibility',
          activeLayers.includes(name) ? 'visible' : 'none'
        );
      }
    });
  }, [activeLayers]);

  const toggleLayer = (layerName: string) => {
    setActiveLayers(prev =>
      prev.includes(layerName)
        ? prev.filter(n => n !== layerName)
        : [...prev, layerName]
    );
  };

  const toggleExplanation = (key: string) => {
    setOpenExplanationKey(prev => (prev === key ? null : key));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* ハンバーガー + メニュー */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 3 }}>
        <div
          onClick={() => setMenuOpen(o => !o)}
          style={{
            width: 30, height: 24, cursor: 'pointer',
            background: 'rgba(255,255,255,0.9)', borderRadius: 4,
            boxShadow: '0 0 5px rgba(0,0,0,0.3)',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'space-around', alignItems: 'center',
            padding: 4,
          }}
        >
          <div style={{ width: 20, height: 2, backgroundColor: '#333' }} />
          <div style={{ width: 20, height: 2, backgroundColor: '#333' }} />
          <div style={{ width: 20, height: 2, backgroundColor: '#333' }} />
        </div>

        {menuOpen && (
          <div
            style={{
              position: 'absolute', top: '100%', marginTop: 8, right: 0,
              background: 'rgba(255,255,255,0.95)', padding: 10,
              borderRadius: 4, fontSize: 14,
              boxShadow: '0 0 5px rgba(0,0,0,0.3)',
              minWidth: 330, maxWidth: '90vw',
            }}
          >
            {Object.keys(tsunamiTileLayers).map((name, i) => (
              <div key={name} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={activeLayers.includes(name)}
                      onChange={() => toggleLayer(name)}
                    />{' '}
                    {name}
                  </label>
                  <button
                    onClick={() => toggleExplanation(name)}
                    style={{ fontSize: 13, padding: '2px 8px', cursor: 'pointer' }}
                  >
                    解説
                  </button>
                </div>
                {openExplanationKey === name && (
                  <div className={styles.explanationBox}>
                    <p>{tsunamiExplaines[name].explanation}</p>
                    {tsunamiExplaines[name].hanrei && (
                      <img
                        src={`${ImageS3URL}assets/bosai-legend/${tsunamiExplaines[name].hanrei}`}
                        alt="凡例"
                        style={{ width: 100 }}
                      />
                    )}
                    {tsunamiExplaines[name].urls.map((u, idx) => (
                      <p key={idx}>
                        <a href={u.href} target="_blank" rel="noopener noreferrer">
                          {u.label}
                        </a>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 地図本体 */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default TsunamiMap;
