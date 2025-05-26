// components/map/util/ColorSampler.tsx
// ColorSampler: 指定座標のタイル色をサンプリングし、対応する凡例エントリを返します
import React, { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { LayerInfo } from '../../../types/mapTypes'

/**
 * ColorMapEntry は colorMap 配列の各要素に対応する型です。
 * depth（浸水深）か hour（継続時間）のどちらかを含みます。
 */
export interface ColorMapEntry {
  [key: string]: string | number
}

/**
 * HazardInfo（旧 ColorSampler 用の型）は LayerInfo と同一です。
 */
export type HazardInfo = LayerInfo

interface Props {
  propertyLatitude:  number
  propertyLongitude: number
  config:    HazardInfo
  onMatch:   (entry: ColorMapEntry | null) => void
}

/**
 * Leaflet タイルをキャンバスに描画し、サンプルした色に対応するcolorMapエントリを onMatch に渡します。
 */
export default function ColorSampler({
  propertyLatitude,
  propertyLongitude,
  config,
  onMatch,
}: Props) {
  const map = useMap()

  useEffect(() => {
    map.whenReady(() => {
      const z = map.getZoom()
      const n = Math.pow(2, z)
      const xt = ((propertyLongitude + 180) / 360) * n
      const latRad = (propertyLatitude * Math.PI) / 180
      const yt = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n

      const tx = Math.floor(xt),
            ty = Math.floor(yt),
            px = Math.floor((xt - tx) * 256),
            py = Math.floor((yt - ty) * 256)

      // タイル URL 組み立て
      const tileUrl = config.url
        .replace('{z}', `${z}`)
        .replace('{x}', `${tx}`)
        .replace('{y}', `${ty}`)

      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = tileUrl

      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          console.warn('[ColorSampler] Canvas context error')
          onMatch(null)
          return
        }
        ctx.drawImage(img, 0, 0)
        const [r, g, b, a] = ctx.getImageData(px, py, 1, 1).data

        // 透過なら浸水なし
        if (a === 0) {
          onMatch({ depth: '浸水なし', r, g, b })
          return
        }

        // RGB 一致で colorMap から検索
        const found = (config.colorMap ?? []).find(
          (c: ColorMapEntry) => c.r === r && c.g === g && c.b === b
        ) ?? null
        onMatch(found)
      }

      img.onerror = () => {
        console.warn('[ColorSampler] Tile load error', tileUrl)
        onMatch(null)
      }
    })
  }, [map, propertyLatitude, propertyLongitude, config, onMatch])

  return null
}
