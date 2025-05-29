// components/remap/GakkuMap.tsx
import React, { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { ImageS3URL } from '../../config'
import styles from '../../styles/remap.module.css'
import * as turf from '@turf/turf'

export interface GakkuMapProps {
  propertyName:   string
  latitude:       number
  longitude:      number
  prefectureCode: number
  prefecture:   string
  localGov:   string
  level:          'elementary' | 'juniorHigh'
  color:          string
}

// 色を20%明るくするヘルパー
function lightenHex(hex: string, amount = 0.2) {
  hex = hex.replace(/^#/, '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  const num = parseInt(hex, 16)
  let r = (num >> 16) & 0xff
  let g = (num >> 8) & 0xff
  let b = num & 0xff
  r = Math.round(r + (255 - r) * amount)
  g = Math.round(g + (255 - g) * amount)
  b = Math.round(b + (255 - b) * amount)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

// 色を濃くするヘルパー
function darkenHex(hex: string, amount = 0.2) {
  hex = hex.replace(/^#/, '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  const num = parseInt(hex, 16)
  let r = (num >> 16) & 0xff
  let g = (num >> 8) & 0xff
  let b = num & 0xff
  r = Math.round(r * (1 - amount))
  g = Math.round(g * (1 - amount))
  b = Math.round(b * (1 - amount))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}


const lon2tile = (lon: number, z: number) =>
  Math.floor(((lon + 180) / 360) * 2 ** z)
const lat2tile = (lat: number, z: number) => {
  const rad = (lat * Math.PI) / 180
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
      2 ** z
  )
}

const GakkuMap: React.FC<GakkuMapProps> = ({
  propertyName,
  latitude,
  longitude,
  prefectureCode,
  prefecture,
  localGov,
  level,
  color,
}) => {
  const containerRef  = useRef<HTMLDivElement>(null)
  const mapRef        = useRef<maplibregl.Map>()
  const schoolMarkers = useRef<maplibregl.Marker[]>([])

  // 1) MapLibre 初期化（1度だけ）
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
      zoom: 14,
    })
    map.addControl(new maplibregl.NavigationControl(), 'top-left')
    mapRef.current = map
  }, [longitude, latitude])

  // 2) 学区ポリゴンの取得＆描画
// 2) 学区ポリゴンの取得＆描画
useEffect(() => {
  if (!mapRef.current) return
  const map = mapRef.current
  const url =
    level === 'juniorHigh'
      ? `${ImageS3URL}geojson/gakku_juniorhigh/A32-23_${prefectureCode}.geojson`
      : `${ImageS3URL}geojson/gakku_elementary/A27-23_${prefectureCode}.geojson`

  fetch(url)
    .then(r => {
      if (!r.ok) throw new Error(`polygon fetch failed ${r.status}`)
      return r.json()
    })
    .then((data: any) => {
      const fc = { type: 'FeatureCollection', features: data.features || [] }

      // すべてのポリゴンを通常レイヤーに表示
      if (!map.getSource('gakku-geo')) {
        map.addSource('gakku-geo', { type: 'geojson', data: fc })
        map.addLayer({
          id: 'gakku-fill',
          type: 'fill',
          source: 'gakku-geo',
          paint: { 'fill-color': color, 'fill-opacity': 0.4 },
        })
        map.addLayer({
          id: 'gakku-line',
          type: 'line',
          source: 'gakku-geo',
          paint: { 'line-color': color, 'line-width': 4 },
        })
      } else {
        const src = map.getSource('gakku-geo') as maplibregl.GeoJSONSource
        src.setData(fc)
        map.setPaintProperty('gakku-fill', 'fill-color', color)
        map.setPaintProperty('gakku-line', 'line-color', color)
      }

      // 物件の位置に該当するポリゴンだけ抽出して別レイヤーで上描き
      const inside = fc.features.filter(f => {
        if (!f.geometry) return false
        try {
          const poly = turf.polygon(f.geometry.coordinates)
          return turf.booleanPointInPolygon(
            turf.point([longitude, latitude]),
            poly
          )
        } catch {
          return false
        }
      })

      if (inside.length > 0) {
        const highlight = {
          type: 'FeatureCollection',
          features: inside,
        }

        const highlightColor = darkenHex(color, 0.01)

        if (!map.getSource('gakku-highlight')) {
          map.addSource('gakku-highlight', { type: 'geojson', data: highlight })
          map.addLayer({
            id: 'gakku-highlight',
            type: 'fill',
            source: 'gakku-highlight',
            paint: {
              'fill-color': highlightColor,
              'fill-opacity': 0.6,
            },
          })
        } else {
          const src = map.getSource('gakku-highlight') as maplibregl.GeoJSONSource
          src.setData(highlight)
          map.setPaintProperty('gakku-highlight', 'fill-color', highlightColor)
        }
      }
    })
    .catch(console.error)
}, [level, prefectureCode, color, latitude, longitude])


  // 3) 学校ポイントの取得＆マーカー配置
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    // 既存マーカーをクリア
    schoolMarkers.current.forEach(m => m.remove())
    schoolMarkers.current = []

    fetch(`${ImageS3URL}geojson/school/P29-23_${prefectureCode}.geojson`)
      .then(r => {
        if (!r.ok) throw new Error(`school geojson fetch failed ${r.status}`)
        return r.json()
      })
      .then((data: any) => {
        const feats: any[] =
          data.type === 'FeatureCollection'
            ? data.features
            : data.type === 'Feature'
            ? [data]
            : []

        // レベルに合わせた種別コード
        const targetCode = level === 'elementary' ? '16001' : '16002'
        // 管理者コード→プレフィックス
        const labelMap: Record<string,string> = {
          '1': '（国立）',
          '2': `（${prefecture}立）`,
          '3': `（${localGov}立）`,
          '4': '（私立）',
        }

        feats
          .filter(f => f.properties?.P29_003 === targetCode)
          .forEach(f => {
            const mgr = String(f.properties?.P29_006)
            if (mgr === '0') return  // その他は表示しない

            const prefix    = labelMap[mgr] || ''
            const isPrivate = mgr === '4'
            const bgColor   = isPrivate ? lightenHex(color, 0.3) : color
            const name      = String(f.properties?.P29_004 || '')

            const baseSize   = 26
            const markerSize = isPrivate ? Math.round(baseSize * 0.9) : baseSize
            // マーカー要素
            const el = document.createElement('div')
            el.className = styles.schoolMarker
            el.style.width           = `${markerSize}px`
            el.style.height          = `${markerSize}px`
            el.style.backgroundColor = bgColor
            el.innerText             = level === 'elementary' ? '小' : '中'

            const m = new maplibregl.Marker({ element: el, anchor: 'bottom' })
              .setLngLat(f.geometry.coordinates as [number, number])
              .setPopup(
                new maplibregl.Popup({ offset: [0, -12], closeButton: false })
                  .setText(`${prefix}\n${name}`)
              )
              .addTo(map)

            schoolMarkers.current.push(m)
          })
      })
      .catch(console.error)
  }, [prefectureCode, level, color])

  // 4) 物件マーカー + ツールチップ
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current
    const el = document.createElement('img')
    el.src    = '/icons/icon_mansion.png'
    el.style.width  = '28px'
    el.style.height = '38px'

    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([longitude, latitude])
    const popup = new maplibregl.Popup({
      offset: [0, -20],
      closeButton: false,
      closeOnClick: false,
      anchor: 'top',
    }).setText(propertyName)

    marker.setPopup(popup).addTo(map)
    popup.addTo(map)
  }, [propertyName, latitude, longitude])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

export default GakkuMap
