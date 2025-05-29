// components/remap/GakkuFlame.tsx
import React, { useState } from 'react';
import GakkuMap from './GakkuMap';
import styles from '../../styles/remap.module.css';

export interface GakkuFlameProps {
  propertyName:   string;
  propertyLatitude: number;
  propertyLongitude: number;
  prefectureCode: number;
  prefecture:   string;
  localGovCode:   number;
  localGov:   string;
  colorScheme:    Record<string, string>;
}

const GakkuFlame: React.FC<GakkuFlameProps> = ({
  propertyName,
  propertyLatitude,
  propertyLongitude,
  prefectureCode,
  prefecture,
  localGovCode,
  localGov,
  colorScheme,
}) => {
  const tabs = ['小学校', '中学校'] as const;
  const levels: Array<'elementary' | 'juniorHigh'> = ['elementary', 'juniorHigh'];
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className={styles.tabRow}>
        {tabs.map((label, i) => {
          const borderColor = colorScheme[`color${i + 1}`] || '#000';
          const bgColor     = i === activeTab ? borderColor : '#fff';
          const txtColor    = i === activeTab ? '#fff' : borderColor;
          return (
            <div
              key={label}
              className={styles.tabItem}
              onClick={() => setActiveTab(i)}
              style={{
                '--tab-border': borderColor,
                '--tab-bg':     bgColor,
                '--tab-color':  txtColor,
              } as React.CSSProperties}
            >
              {label}
            </div>
          );
        })}
      </div>

      <div className={styles.bottomArea}>
        <GakkuMap
          propertyName={propertyName}
          latitude={propertyLatitude}
          longitude={propertyLongitude}
          prefectureCode={prefectureCode}
          prefecture={prefecture}
          localGovCode={localGovCode}
          localGov={localGov}
          level={levels[activeTab]}
          color={colorScheme[`color${activeTab + 1}`]}
        />
      </div>
    </div>
  );
};

export default GakkuFlame;
