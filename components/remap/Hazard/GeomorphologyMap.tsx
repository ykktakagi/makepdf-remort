// src/components/remap/Hazard/GeomorphologyMap.tsx
import React, { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import styles from '../../../styles/remap.module.css'
import {
  geomorphologyNaturalData14_16,
  geomorphologyArtificialData14_16,
  geomorphologyExplains,
} from './geomorphologyData'

export interface GeomorphologyMapProps {
  propertyName: string
  latitude: number
  longitude: number
}

// GeoJSON タイル URL テンプレート
const geomorphologyTileLayers: Record<string, string> = {
  '地形分類（自然地形）':
    'https://cyberjapandata.gsi.go.jp/xyz/experimental_landformclassification1/{z}/{x}/{y}.geojson',
  '地形分類（人工地形）':
    'https://cyberjapandata.gsi.go.jp/xyz/experimental_landformclassification2/{z}/{x}/{y}.geojson',
}

// 緯度経度 → タイル座標変換
function calcTileCoordinates(lng: number, lat: number, zoom: number) {
  const scale = 2 ** zoom
  const x = Math.floor(((lng + 180) / 360) * scale)
  const rad = (lat * Math.PI) / 180
  const y = Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
      scale
  )
  return { x, y }
}

// 表示範囲に必要なタイル範囲を取得
function getTileRange(
  bounds: maplibregl.LngLatBounds,
  zoom: number
): { xMin: number; xMax: number; yMin: number; yMax: number } {
  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()
  const { x: xMin, y: yMax } = calcTileCoordinates(sw.lng, sw.lat, zoom)
  const { x: xMax, y: yMin } = calcTileCoordinates(ne.lng, ne.lat, zoom)
  return { xMin, xMax, yMin, yMax }
}

const GeomorphologyMap: React.FC<GeomorphologyMapProps> = ({
  propertyName,
  latitude,
  longitude,
}) => {
  const mapRef = useRef<maplibregl.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 初期で両方 ON
  const [activeLayers, setActiveLayers] = useState<string[]>([
    '地形分類（自然地形）',
    '地形分類（人工地形）',
  ])
  const [menuOpen, setMenuOpen] = useState(false)
  const [openExplanationKey, setOpenExplanationKey] = useState<string | null>(
    null
  )

  // タイルデータ取得＆ソース更新関数
  const updateTiles = () => {
    if (!mapRef.current) return
    const map = mapRef.current
    const zoom = Math.floor(map.getZoom())
    const bounds = map.getBounds()
    const { xMin, xMax, yMin, yMax } = getTileRange(bounds, zoom)

    // 自然地形
    const naturalSrc = map.getSource('geojson-natural') as any
    if (naturalSrc && activeLayers.includes('地形分類（自然地形）')) {
      const promises: Promise<any>[] = []
      for (let x = xMin; x <= xMax; x++) {
        for (let y = yMin; y <= yMax; y++) {
          const url = geomorphologyTileLayers['地形分類（自然地形）']
            .replace('{z}', `${zoom}`)
            .replace('{x}', `${x}`)
            .replace('{y}', `${y}`)
          promises.push(fetch(url).then(r => r.json()))
        }
      }
      Promise.all(promises)
        .then(chunks => chunks.flatMap(c => c.features || []))
        .then(features => {
          naturalSrc.setData({
            type: 'FeatureCollection',
            features,
          })
        })
        .catch(console.error)
    } else {
      if (naturalSrc) {
         naturalSrc.setData({
          type: 'FeatureCollection',
          features: [],
        })
      }
    }

    // 人工地形
    const artificialSrc = map.getSource('geojson-artificial') as any
    if (artificialSrc && activeLayers.includes('地形分類（人工地形）')) {
      const promises: Promise<any>[] = []
      for (let x = xMin; x <= xMax; x++) {
        for (let y = yMin; y <= yMax; y++) {
          const url = geomorphologyTileLayers['地形分類（人工地形）']
            .replace('{z}', `${zoom}`)
            .replace('{x}', `${x}`)
            .replace('{y}', `${y}`)
          promises.push(fetch(url).then(r => r.json()))
        }
      }
      Promise.all(promises)
        .then(chunks => chunks.flatMap(c => c.features || []))
        .then(features => {
          artificialSrc.setData({
            type: 'FeatureCollection',
            features,
          })
        })
        .catch(console.error)
    } else {
       if (artificialSrc) {
        artificialSrc.setData({
          type: 'FeatureCollection',
          features: [],
        })
       }
    }
  }

  // 初期マップ作成
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
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
      minZoom: 14,
      maxZoom: 16,
    })
    map.addControl(new maplibregl.NavigationControl(), 'top-left')

    map.on('load', () => {
      // 空データでソースを追加
      map.addSource('geojson-natural', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
      map.addSource('geojson-artificial', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })

      // カラー別レイヤーを追加
      Object.entries(geomorphologyNaturalData14_16).forEach(
        ([, info], idx) =>
          map.addLayer({
            id: `natural-${idx}`,
            type: 'fill',
            source: 'geojson-natural',
            paint: { 'fill-color': info.color, 'fill-opacity': 1 },
            filter: ['in', ['get', 'code'], ['literal', info.codes]],
          })
      )
      Object.entries(geomorphologyArtificialData14_16).forEach(
        ([, info], idx) =>
          map.addLayer({
            id: `artificial-${idx}`,
            type: 'fill',
            source: 'geojson-artificial',
            paint: { 'fill-color': info.color, 'fill-opacity': 1 },
            filter: ['in', ['get', 'code'], ['literal', info.codes]],
          })
      )

      // 初回＆移動終了でタイル読み込み
      updateTiles()
      map.on('moveend', updateTiles)

      // ── ここからクリック処理 ──
      map.on('click', e => {
        const layerIds = [
          ...Object.keys(geomorphologyNaturalData14_16).map((_, i) => `natural-${i}`),
          ...Object.keys(geomorphologyArtificialData14_16).map((_, i) => `artificial-${i}`),
        ]
        const hits = map.queryRenderedFeatures(e.point, { layers: layerIds })
        if (!hits.length) return

        const codes = Array.from(
          new Set(hits.map(f => String(f.properties?.code)).filter(c => c))
        )
        if (!codes.length) return

        const html = codes
          .map(code => {
            // ラベルを検索
            let label: string | undefined
            let meta: any
            Object.entries(geomorphologyNaturalData14_16).forEach(([k, d]) => {
              if (d.codes.includes(code)) {
                label = k
                meta = d
              }
            })
            Object.entries(geomorphologyArtificialData14_16).forEach(([k, d]) => {
              if (d.codes.includes(code)) {
                label = k
                meta = d
              }
            })
            if (!meta) return ''
            return `
              <div style="margin-bottom:8px;">
                <h4 style="margin:0;">${label}</h4>
                <p style="margin:2px 0;"><strong>成り立ち：</strong>${meta.landFormation}</p>
                <p style="margin:2px 0;"><strong>リスク：</strong>${meta.risk}</p>
              </div>
            `
          })
          .filter(s => s)
          .join('<hr style="margin:8px 0;">')

        new maplibregl.Popup({ offset: [0, -10], maxWidth: '400px' })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map)
      })
      // ── ここまでクリック処理 ──

      // 中心マーカー + propertyName のポップアップ
      const el = document.createElement('img')
      el.src = '/icons/icon_mansion.png'
      el.style.width = '28px'
      el.style.height = '38px'
      el.style.cursor = 'pointer'

      new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([longitude, latitude])
        .setPopup(
          new maplibregl.Popup({ offset: [0, -38] }).setText(propertyName)
        )
        .addTo(map)
    })

    mapRef.current = map
  }, [latitude, longitude])

  // チェック ON/OFF で再読み込み
  useEffect(() => {
    if (!mapRef.current) return
    updateTiles()
  }, [activeLayers])

  const toggleLayer = (name: string) =>
    setActiveLayers(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : [...prev, name]
    )

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* ハンバーガー＋メニュー */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 3 }}>
        <div
          onClick={() => setMenuOpen(v => !v)}
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
              background: 'rgba(255,255,255,0.95)',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '14px',
              boxShadow: '0 0 5px rgba(0,0,0,0.3)',
              minWidth: '280px',
            }}
          >
            {Object.keys(geomorphologyTileLayers).map((name, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={activeLayers.includes(name)}
                      onChange={() => toggleLayer(name)}
                    />{' '}
                    {name}
                  </label>
                  <button
                    onClick={() =>
                      setOpenExplanationKey(k => (k === name ? null : name))
                    }
                    style={{ fontSize: '13px', cursor: 'pointer' }}
                  >
                    解説
                  </button>
                </div>
                {openExplanationKey === name && (
                  <div className={styles.explanationBox}>
                    <p>{geomorphologyExplains[name].explanation}</p>
                    {geomorphologyExplains[name].urls.map((u, idx) => (
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

export default GeomorphologyMap
