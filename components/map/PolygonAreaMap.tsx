// components/map/PolygonAreaMap.tsx
import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from '../../styles/mapText.module.css'
import ColorSampler, {
  HazardInfo,
  ColorMapEntry,
} from './util/ColorSampler'

interface Props {
  mapLayerType:  string
  config:        HazardInfo
  propertyName:  string
  propertyLatitude:      number
  propertyLongitude:     number
}

const mansionIcon = L.icon({
  iconUrl: '/icons/icon_mansion.png',
  iconRetinaUrl: '/icons/icon_mansion.png',
  iconSize: [28, 38],
  iconAnchor: [14, 38],
  popupAnchor: [0, -33],
})

export default function PolygonAreaMap({
  mapLayerType,
  config,
  propertyName,
  propertyLatitude,
  propertyLongitude,
}: Props) {
  const [match, setMatch] = useState<ColorMapEntry | null>(null)

  return (
    <div className={styles.container}>
    <h3 className={styles.title}>{mapLayerType}</h3>
      <div className={styles.map}>
        <MapContainer
          center={[propertyLatitude, propertyLongitude]}
          zoom={15}
          minZoom={config.zoomLevel.min}
          maxZoom={config.zoomLevel.max}
          className={styles.map}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <TileLayer url={config.url} tileSize={256} />
          <Marker position={[propertyLatitude, propertyLongitude]} icon={mansionIcon} />

          {/* 共通化した ColorSampler を使う */}
          <ColorSampler
            propertyLatitude={propertyLatitude}
            propertyLongitude={propertyLongitude}
            config={config}
            onMatch={setMatch}
          />
        </MapContainer>
      </div>

      <div className={styles.info}>
        {match ? (
          <p>
            この地点付近は{' '}
            {match.depth ?? match.hour}{' '}の危険性があります。
          </p>
          ) : (
          <p>この地点は災害の恐れはありません。</p>
        )}
        <div className={styles.legend}>
          凡例
          <img
            src={config.hanrei}
            alt="凡例"
            className={styles.legend}
          />
        </div>
      </div>
    </div>
  )
}
