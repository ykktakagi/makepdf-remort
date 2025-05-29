import React, { useState, useEffect } from 'react';
import SpotMap from './SpotMap';
import spotListAll from '../../data/spotListAll.json';
import styles from '../../styles/remap.module.css';

interface FacilityEnvironmentProps {
  propertyName: string;
  propertyLatitude: number;
  propertyLongitude: number;
  colorScheme: Record<string, string>;
}

const FacilityEnvironment: React.FC<FacilityEnvironmentProps> = ({
  propertyName,
  propertyLatitude,
  propertyLongitude,
  colorScheme,
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const byProp = (spotListAll as Record<string, any>)[propertyName] || {};
    const cats = Object.keys(byProp);
    setCategories(cats);
    setActiveTab(0);
  }, [propertyName]);

  if (categories.length === 0) {
    return <div>周辺施設データを読み込み中…</div>;
  }

  const activeCategory = categories[activeTab];
  const spots =
    ((spotListAll as Record<string, any>)[propertyName] || {})[activeCategory] || [];

  return (
    <div>
      {/* タブ行 */}
      <div className={styles.tabRow}>
        {categories.map((label, i) => {
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

      {/* 地図表示エリア */}
      <div className={styles.bottomArea}>
        <SpotMap
          spots={spots}
          propertyName={propertyName}
          latitude={propertyLatitude}
          longitude={propertyLongitude}
        />
      </div>
    </div>
  );
};

export default FacilityEnvironment;
