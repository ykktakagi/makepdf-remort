import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ImageS3URL } from '../../../config';
import styles from '../../../styles/remap.module.css';

export interface SpotMapProps {
  propertyName: string;
  latitude: number;
  longitude: number;
}

const surgeTileLayers: Record<string, string> = {
  '高潮浸水想定区域（想定最大規模）':
    'https://disaportaldata.gsi.go.jp/raster/03_hightide_l2_shinsuishin_data/{z}/{x}/{y}.png',
};

const surgeExplaines: Record<string, {
  explanation: string;
  hanrei?: string;
  urls: { label: string; href: string }[];
}> = {
  '高潮浸水想定区域（想定最大規模）': {
    explanation: '高潮による氾濫が発生した場合に浸水が想定される区域と水深',
    hanrei: 'shinsui_legend3.png',
    urls: [
      { label: 'データの掲載状況一覧', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/takashio_sinsui.html' },
      { label: 'データについて', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/copyright_data.html' }
    ]
  }
};

const SurgeMap: React.FC<SpotMapProps> = ({ propertyName, latitude, longitude }) => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>([
    Object.keys(surgeTileLayers)[0],
  ]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openExplanationKey, setOpenExplanationKey] = useState<string | null>(null);

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

map.on('load', () => {
      // 中央マーカー
      const el = document.createElement('img');
      el.src = '/icons/icon_mansion.png';
      el.style.width = '28px';
      el.style.height = '38px';
      el.style.cursor = 'pointer';

      const popup = new maplibregl.Popup({ offset: [0, -38] }).setText(propertyName);

      new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map);

      // 高潮レイヤー追加
      Object.entries(surgeTileLayers).forEach(([name, url], idx) => {
        const sourceId = `surge-${idx}`;
        const layerId = `layer-${idx}`;
        map.addSource(sourceId, { type: 'raster', tiles: [url], tileSize: 256 });
        map.addLayer({
          id: layerId,
          type: 'raster',
          source: sourceId,
          layout: { visibility: 'visible' },
          paint: { 'raster-opacity': 0.5 },
        });
      });
    });

    mapRef.current = map;
  }, [latitude, longitude]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handleLoad = () => {
      Object.entries(surgeTileLayers).forEach(([name, url], index) => {
        const sourceId = `surge-${index}`;
        const layerId = `layer-${index}`;
        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, { type: 'raster', tiles: [url], tileSize: 256 });
          map.addLayer({
            id: layerId,
            type: 'raster',
            source: sourceId,
            layout: {
              visibility: activeLayers.includes(name) ? 'visible' : 'none',
            },
            paint: { 'raster-opacity': 0.5 },
          });
        } else {
          const visibility = activeLayers.includes(name) ? 'visible' : 'none';
          map.setLayoutProperty(layerId, 'visibility', visibility);
        }
      });
    };
    if (map.isStyleLoaded()) {
      handleLoad();
    } else {
      map.once('load', handleLoad);
    }
  }, [activeLayers]);

  const toggleLayer = (layerName: string) => {
    setActiveLayers(prev =>
      prev.includes(layerName)
        ? prev.filter(name => name !== layerName)
        : [...prev, layerName]
    );
  };

  const toggleExplanation = (key: string) => {
    setOpenExplanationKey(prev => (prev === key ? null : key));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 3 }}>
        <div
          onClick={() => setMenuOpen(prev => !prev)}
          style={{
            width: 30,
            height: 24,
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '4px',
            boxShadow: '0 0 5px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '4px',
          }}
        >
          <div style={{ width: '20px', height: '2px', backgroundColor: '#333' }} />
          <div style={{ width: '20px', height: '2px', backgroundColor: '#333' }} />
          <div style={{ width: '20px', height: '2px', backgroundColor: '#333' }} />
        </div>

        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              marginTop: 8,
              right: 0,
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '14px',
              boxShadow: '0 0 5px rgba(0,0,0,0.3)',
              minWidth: '330px',
              maxWidth: '90vw',
            }}
          >
            {Object.keys(surgeTileLayers).map((name, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={activeLayers.includes(name)}
                      onChange={() => toggleLayer(name)}
                    />
                    {' '}{name}
                  </label>
                  <button
                    onClick={() => toggleExplanation(name)}
                    style={{
                      fontSize: '13px',
                      padding: '2px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    解説
                  </button>
                </div>
                {openExplanationKey === name && (
                  <div className={styles.explanationBox}>
                    <p>{surgeExplaines[name]?.explanation}</p>
                    {surgeExplaines[name]?.hanrei && (
                      <img
                        src={`${ImageS3URL}assets/bosai-legend/${surgeExplaines[name].hanrei}`}
                        alt="凡例"
                      />
                    )}
                    {surgeExplaines[name]?.urls.map((url, idx) => (
                      <p key={idx}>
                        <a href={url.href} target="_blank" rel="noopener noreferrer">
                          {url.label}
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
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default SurgeMap;
