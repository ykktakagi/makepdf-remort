import React, { useState } from 'react';
import HazardFloodMap from './Hazard/FloodMap';
import HazardLandSlideMap from './Hazard/LandSlideMap';
import HazardSurgeMap from './Hazard/SurgeMap';
import HazardTsunamiMap from './Hazard/TsunamiMap';
import HazardGeomorphologyMap from './Hazard/GeomorphologyMap';
import styles from '../../styles/remap.module.css';

export interface HazardFlameProps {
  propertyName: string;
  propertyLatitude: number;
  propertyLongitude: number;
  prefectureCode: number;
  prefecture: string;
  localGovCode: number;
  localGov: string;
  colorScheme: Record<string, string>;
}

const HazardFlame: React.FC<HazardFlameProps> = ({
  propertyName,
  propertyLatitude,
  propertyLongitude,
  prefectureCode,
  prefecture,
  localGovCode,
  localGov,
  colorScheme,
}) => {
  const tabs = ['洪水', '土砂災害', '高潮', '津波', '地形分類'] as const;
  const components = [
    HazardFloodMap,
    HazardLandSlideMap,
    HazardSurgeMap,
    HazardTsunamiMap,
    HazardGeomorphologyMap,
  ];

  const [activeTab, setActiveTab] = useState(0);
  const ActiveComponent = components[activeTab];

  return (
    <div>
      <div className={styles.tabRow}>
        {tabs.map((label, i) => {
          const borderColor = colorScheme[`color${i + 1}`] || '#000';
          const bgColor = i === activeTab ? borderColor : '#fff';
          const txtColor = i === activeTab ? '#fff' : borderColor;
          return (
            <div
              key={label}
              className={styles.tabItem}
              onClick={() => setActiveTab(i)}
              style={{
                '--tab-border': borderColor,
                '--tab-bg': bgColor,
                '--tab-color': txtColor,
              } as React.CSSProperties}
            >
              {label}
            </div>
          );
        })}
      </div>

      <div className={styles.bottomArea}>
        <ActiveComponent
          propertyName={propertyName}
          latitude={propertyLatitude}
          longitude={propertyLongitude}
          prefectureCode={prefectureCode}
          prefecture={prefecture}
          localGovCode={localGovCode}
          localGov={localGov}
          color={colorScheme[`color${activeTab + 1}`]}
        />
      </div>
    </div>
  );
};

export default HazardFlame;
