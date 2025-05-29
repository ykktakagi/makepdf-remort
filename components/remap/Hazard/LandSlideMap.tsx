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

const landslideTileLayers: Record<string, string> = {
  "土砂災害警戒区域（土石流）": "https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki/{z}/{x}/{y}.png",
  "土砂災害警戒区域（急傾斜地の崩壊）": "https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png",
  "土砂災害警戒区域（地すべり）": "https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png"
};

const landslideExplaines: Record<string, {
  explanation: string;
  hanrei?: string;
  urls: { label: string; href: string }[];
}> = {
  "土砂災害警戒区域（土石流）": {
    explanation: "土石流とは、山腹が崩壊して生じた土石等又は渓流の土石等が一体となって流下する自然現象",
    hanrei: "keikai_dosekiryu.png",
    urls: [
      { label: "土石流の詳細", href: "https://www.mlit.go.jp/mizukokudo/sabo/dosekiryuu_taisaku.html" },
      { label: "土砂災害警戒区域の詳細", href: "https://www.mlit.go.jp/river/sabo/sinpoupdf/gaiyou.pdf" },
      { label: "国土数値情報", href: "https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-A33-2023.html" },
      { label: "データについて", href: "https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/copyright_data.html" }
    ]
  },
  "土砂災害警戒区域（急傾斜地の崩壊）": {
    explanation: "急傾斜地の崩壊とは、傾斜度が三十度以上である土地が崩壊する自然現象",
    hanrei: "keikai_kyukeisya.png",
    urls: [
      { label: "がけ崩れの詳細", href: "https://www.mlit.go.jp/mizukokudo/sabo/gakekuzure_taisaku.html" },
      { label: "土砂災害警戒区域の詳細", href: "https://www.mlit.go.jp/river/sabo/sinpoupdf/gaiyou.pdf" },
      { label: "国土数値情報", href: "https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-A33-2023.html" },
      { label: "データについて", href: "https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/copyright_data.html" }
    ]
  },
  "土砂災害警戒区域（地すべり）": {
    explanation: "地すべりとは、土地の一部が地下水等に起因して滑る自然現象又はこれに伴って移動する自然現象",
    hanrei: "keikai_jisuberi.png",
    urls: [
      { label: "地すべりの詳細", href: "https://www.mlit.go.jp/mizukokudo/sabo/jisuberi_taisaku.html" },
      { label: "土砂災害警戒区域の詳細", href: "https://www.mlit.go.jp/river/sabo/sinpoupdf/gaiyou.pdf" },
      { label: "国土数値情報", href: "https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-A33-2023.html" },
      { label: "データについて", href: "https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/copyright_data.html" }
    ]
  }
};

const LandslideMap: React.FC<SpotMapProps> = ({ propertyName, latitude, longitude }) => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>([
    Object.keys(landslideTileLayers)[0],
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
      // ① 中央マーカーとポップアップ追加
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

      // ② 土砂災害レイヤー追加
      Object.entries(landslideTileLayers).forEach(([name, url], idx) => {
        const srcId = `gsi-${idx}`;
        const lyrId = `layer-${idx}`;
        map.addSource(srcId, { type: 'raster', tiles: [url], tileSize: 256 });
        map.addLayer({
          id: lyrId,
          type: 'raster',
          source: srcId,
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
      Object.entries(landslideTileLayers).forEach(([name, url], index) => {
        const sourceId = `gsi-${index}`;
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
            {Object.keys(landslideTileLayers).map((name, i) => (
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
                    <p>{landslideExplaines[name]?.explanation}</p>
                    {landslideExplaines[name]?.hanrei && (
                      <img
                        src={`${ImageS3URL}assets/bosai-legend/${landslideExplaines[name].hanrei}`}
                        alt="凡例"
                      />
                    )}
                    {landslideExplaines[name]?.urls.map((url, idx) => (
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

export default LandslideMap;
