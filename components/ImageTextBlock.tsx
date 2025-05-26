import React from 'react';
import styles from '../styles/Layout.module.css';

export interface SummaryData {
  textTopRight:    string;
  imageTopLeft:    string;
  textBottomLeft:  string;
  imageBottomRight: string;
}

interface Props {
  /** Home.tsx から渡される summary データ */
  data: SummaryData;
}

const ImageTextBlock: React.FC<Props> = ({ data }) => {
  return (
    <>
      {/* 上段：画像→テキスト */}
      <div className={`${styles.layoutRowSplit} ${styles.rowImageText}`}>  
        <div className={styles.imageContainer}>
          <img src={data.imageTopLeft} alt="" />
        </div>
        <div className={styles.textBlock}>{data.textTopRight}</div>
      </div>

      {/* 下段：テキスト→画像 */}
      <div className={`${styles.layoutRowSplit} ${styles.rowTextImage}`}>  
        <div className={styles.textBlock}>{data.textBottomLeft}</div>
        <div className={styles.imageContainer}>
          <img src={data.imageBottomRight} alt="" />
        </div>
      </div>
    </>
  );
};

export default ImageTextBlock;
