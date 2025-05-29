// components/remap/FacilityEnvironment.tsx
import React, { useState, useEffect } from 'react';
import SpotMap from './SpotMap';
import spotListAll from '../../data/spotListAll.json';

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
  const iconColor = colorScheme[`color${activeTab + 1}`] || '';
  const useMansionIcon = activeTab === 0;

  return (
    <div>
      {/* タブ */}
      <div style={{ display: 'flex', height: '50px' }}>
        {categories.map((label, i) => {
          const color = colorScheme[`color${i + 1}`] || '';
          const selected = i === activeTab;
          return (
            <div
              key={label}
              onClick={() => setActiveTab(i)}
              style={{
                flex: 1,
                border: `1px solid ${color}`,
                backgroundColor: selected ? color : '#fff',
                color: selected ? '#fff' : color,
                textAlign: 'center',
                lineHeight: '50px',
                cursor: 'pointer',
              }}
            >
              {label}
            </div>
          );
        })}
      </div>

      {/* 地図 */}
      <div style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}>
        <SpotMap
          spots={spots}
          latitude={propertyLatitude}
          longitude={propertyLongitude}
          iconColor={iconColor}
          useMansionIcon={useMansionIcon}
        />
      </div>
    </div>
  );
};

export default FacilityEnvironment;
