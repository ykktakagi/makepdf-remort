// components/remap/FacilityInfo.tsx
import React, { useState } from 'react';
import FacilityEnvironment from './FacilityEnvironment';
import GakkuFlame from './GakkuFlame';
import HazardFlame from './HazardFlame';
import styles from '../../styles/remap.module.css';

const labels = ['周辺施設', '学区', '防災'];

export interface FacilityInfoProps {
  propertyName: string;
  propertyLatitude: number;
  propertyLongitude: number;
  prefectureCode: number;
  prefecture: string;
  localGovCode: number;
  localGov: string;
  /** ホストから渡す色設定。なければ内部フォールバックを使う */
  colorScheme?: Record<string, string>;
}

const defaultColors: Record<string,string> = {
  color1: '#D17D68',
  color2: '#128688',
  color3: '#4C5A97',
  color4: '#FFC20E',
  color5: '#AD3C3E',
};

const FacilityInfo: React.FC<FacilityInfoProps> = ({
  propertyName,
  propertyLatitude,
  propertyLongitude,
  prefectureCode,
  prefecture,
  localGovCode,
  localGov,
  colorScheme: hostColors,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const colorScheme = hostColors ?? defaultColors;

  return (
    <div>
      {/* タブ */}
      <div className={styles.buttonRow}>
        {labels.map((label, i) => {
          const color = colorScheme[`color${i + 1}`] || '#000';
          const selected = i === activeTab;
          return (
            <button
              key={i}
              className={`${styles.topButton} ${
                selected ? styles.topButtonSelected : styles.topButtonUnselected
              }`}
              style={{
                borderColor: color,
                '--btn-color': color,
              } as React.CSSProperties}
              onClick={() => setActiveTab(i)}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 下部エリア */}
      <div className={styles.bottomArea}>
        {activeTab === 0 && (
          <FacilityEnvironment
            propertyName={propertyName}
            propertyLatitude={propertyLatitude}
            propertyLongitude={propertyLongitude}
            colorScheme={colorScheme}
          />
        )}
        {activeTab === 1 && (
          <GakkuFlame
            propertyName={propertyName}
            propertyLatitude={propertyLatitude}
            propertyLongitude={propertyLongitude}
            prefectureCode={prefectureCode}
            prefecture={prefecture}
            localGovCode={localGovCode}
            localGov={localGov}
            colorScheme={colorScheme}
          />
        )}
        {activeTab === 2 && (
          <HazardFlame
            propertyName={propertyName}
            propertyLatitude={propertyLatitude}
            propertyLongitude={propertyLongitude}
            prefectureCode={prefectureCode}
            prefecture={prefecture}
            localGovCode={localGovCode}
            localGov={localGov}
            colorScheme={colorScheme}
          />
        )}
      </div>
    </div>
  );
};

export default FacilityInfo;
