import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ImageS3URL } from '../../../config'
import styles from '../../../styles/remap.module.css';

export interface SpotMapProps {
  propertyName: string;
  latitude: number;
  longitude: number;
}

const floodTileLayers: Record<string, string> = {
  '洪水浸水想定区域（想定最大規模）':
    'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png',
  '洪水浸水想定区域（計画規模）':
    'https://disaportaldata.gsi.go.jp/raster/01_flood_l1_shinsuishin_newlegend_data/{z}/{x}/{y}.png',
  '浸水継続時間（想定最大規模）':
    'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_keizoku_data/{z}/{x}/{y}.png',
  '家屋倒壊等氾濫想定区域（氾濫流）':
    'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_kaokutoukai_hanran_data/{z}/{x}/{y}.png',
  '家屋倒壊等氾濫想定区域（河岸侵食）':
    'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_kaokutoukai_kagan_data/{z}/{x}/{y}.png',
};

const floodExplains: Record<string, {
  explanation: string;
  hanrei?: string;
  urls: { label: string; href: string }[];
}> = {
  '洪水浸水想定区域（想定最大規模）': {
    explanation: '河川が氾濫した際に浸水が想定される区域と水深（想定し得る最大規模の降雨（計画規模を上回るもの））',
    hanrei: 'shinsui_legend3.png',
    urls: [
      { label: 'データの掲載状況一覧（国管理河川）', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/kasen_kuni_sinsuiL2.html' },
      { label: 'データの掲載状況一覧（都道府県管理河川）', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/kasen_pref_sinsuiL2.html' },
      { label: 'データの掲載状況一覧（その他河川）', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/kasen_sonota_sinsuiL2.html' },
      { label: 'データについて', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/copyright_data.html' },
    ],
  },
  '洪水浸水想定区域（計画規模）': {
    explanation: '河川が氾濫した際に浸水が想定される区域と水深（10年～100年に1回程度の降雨規模）',
    hanrei: 'shinsui_legend3.png',
    urls: [
      { label: 'データの掲載状況一覧（国管理河川）', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/kasen_kuni_sinsuiL2.html' },
      { label: 'データの掲載状況一覧（都道府県管理河川）', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/kasen_pref_sinsuiL2.html' },
      { label: 'データの掲載状況一覧（その他河川）', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/kasen_sonota_sinsuiL2.html' },
      { label: 'データについて', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/copyright_data.html' },
    ],
  },
  '浸水継続時間（想定最大規模）': {
    explanation: '氾濫水到達後、浸水深 が0.5ｍに達してからその浸水深を下回るまでの時間',
    hanrei: 'shinsui_legend_l2_keizoku.png',
    urls: [
      { label: 'データの掲載状況一覧（国管理河川）', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/kasen_kuni_sinsuiL2.html' },
      { label: 'データの掲載状況一覧（都道府県管理河川）', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/kasen_pref_sinsuiL2.html' },
      { label: 'データの掲載状況一覧（その他河川）', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/kasen_sonota_sinsuiL2.html' },
      { label: 'データについて', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/copyright_data.html' },
    ],
  },
  '家屋倒壊等氾濫想定区域（氾濫流）': {
    explanation: '家屋の流失・倒壊をもたらすような洪水の氾濫流が発生するおそれがある範囲',
    hanrei: 'kaokutoukai_hanran.png',
    urls: [
      { label: 'データの掲載状況一覧（国管理河川）', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/kasen_kuni_sinsuiL2.html' },
      { label: 'データの掲載状況一覧（都道府県管理河川）', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/kasen_pref_sinsuiL2.html' },
      { label: 'データの掲載状況一覧（その他河川）', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/kasen_sonota_sinsuiL2.html' },
      { label: 'データについて', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/copyright_data.html' },
    ],
  },
  '家屋倒壊等氾濫想定区域（河岸侵食）': {
    explanation: '家屋の流失・倒壊をもたらすような洪水時の河岸侵食が発生するおそれがある範囲',
    hanrei: 'kaokutoukai_kagan.png',
    urls: [
      { label: 'データの掲載状況一覧（国管理河川）', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/kasen_kuni_sinsuiL2.html' },
      { label: 'データの掲載状況一覧（都道府県管理河川）', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/kasen_pref_sinsuiL2.html' },
      { label: 'データの掲載状況一覧（その他河川）', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/kasen_sonota_sinsuiL2.html' },
      { label: 'データについて', href: 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/copyright/copyright_data.html' },
    ],
  },
};

const FloodMap: React.FC<SpotMapProps> = ({ propertyName, latitude, longitude }) => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>([
    Object.keys(floodTileLayers)[0],
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
      // ① カスタムマーカーを中央に置く
      const el = document.createElement('img')
      el.src = '/icons/icon_mansion.png'
      el.style.width = '28px'
      el.style.height = '38px'
      el.style.cursor = 'pointer'

      // ② Popup を作成
      const popup = new maplibregl.Popup({ offset: [0, -38] })
        .setText(propertyName)

      // ③ マーカーにアイコンと Popup をセットして地図に追加
      new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map)

      // ② 洪水レイヤーを追加
      Object.entries(floodTileLayers).forEach(([name, url], idx) => {
        const srcId = `gsi-${idx}`
        const lyrId = `layer-${idx}`
        map.addSource(srcId, { type: 'raster', tiles: [url], tileSize: 256 })
        map.addLayer({
          id: lyrId,
          type: 'raster',
          source: srcId,
          layout: { visibility: 'visible' },
          paint: { 'raster-opacity': 0.5 },
        })
      })
    })


    mapRef.current = map;
  }, [latitude, longitude]);

  // チェックボックスで表示切替
   useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return

    Object.keys(floodTileLayers).forEach((name, idx) => {
      const lyrId = `layer-${idx}`
      const vis = activeLayers.includes(name) ? 'visible' : 'none'
      if (map.getLayer(lyrId)) map.setLayoutProperty(lyrId, 'visibility', vis)
    })
  }, [activeLayers])

  const toggleLayer = (layerName: string) => {
    setActiveLayers(prev =>
      prev.includes(layerName)
        ? prev.filter(n => n !== layerName)
        : [...prev, layerName]
    )
  }

  const toggleExplanation = (key: string) => {
    setOpenExplanationKey(prev => (prev === key ? null : key))
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* メニュー */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 3 }}>
        {/* ハンバーガーアイコン */}
        <div
          onClick={() => setMenuOpen(v => !v)}
          style={{
            width: 30, height: 24, cursor: 'pointer',
            background: 'rgba(255,255,255,0.9)', borderRadius: 4,
            boxShadow: '0 0 5px rgba(0,0,0,0.3)',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'space-around', alignItems: 'center',
            padding: 4,
          }}
        >
          <div style={{ width: 20, height: 2, background: '#333' }} />
          <div style={{ width: 20, height: 2, background: '#333' }} />
          <div style={{ width: 20, height: 2, background: '#333' }} />
        </div>

        {/* メニュー展開 */}
        {menuOpen && (
          <div
            style={{
              position: 'absolute', top: '100%', marginTop: 8, right: 0,
              background: 'rgba(255,255,255,0.95)', padding: 10,
              borderRadius: 4, fontSize: 14,
              boxShadow: '0 0 5px rgba(0,0,0,0.3)', minWidth: 280,
            }}
          >
            {Object.keys(floodTileLayers).map((name, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
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
                    <p>{floodExplains[name].explanation}</p>
                    {floodExplains[name].hanrei && (
                      <img
                        src={`${ImageS3URL}assets/bosai-legend/${floodExplains[name].hanrei}`}
                        alt="凡例"
                        style={{ width: 100 }}
                      />
                    )}
                    {floodExplains[name].urls.map((u, idx) => (
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
  )
}

export default FloodMap