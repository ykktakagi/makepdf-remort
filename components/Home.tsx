// components/Home.tsx
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from '../styles/Layout.module.css';
import ChartWrapper from '../components/ChartWrapper';
import ImageTextBlock from '../components/ImageTextBlock';
const MapWrapperNoSSR = dynamic(() => import('./MapWrapper'), { ssr: false });
const FacilityInfoNoSSR = dynamic(
  () => import('./remap/FacilityInfo'),
  { ssr: false }
);
// 直接 FacilityEnvironment を動的インポート
import remapColors from '../styles/remapColor.json';
const FacilityEnvNoSSR = dynamic(
  () => import('./remap/FacilityEnvironment'),
  { ssr: false }
);

const remapColorsInline = {
  color1: '#D17D68',
  color2: '#128688',
  color3: '#4C5A97',
  color4: '#FFC20E',
  color5: '#AD3C3E',
};


interface StageData {
  propertyName:   string;
  propertyCatch:  string;
  propertyLatitude:       number;
  propertyLongitude:      number;
  prefectureCode: number;
  prefecture:     string;
  localGovCode:   number;
  localGov:       string;
}


interface SummaryData {
  textTopRight:    string;
  imageTopLeft:    string;
  textBottomLeft:  string;
  imageBottomRight:string;
}

export default function Home() {
  const [stage, setStage] = useState<StageData | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const bukken     = 'fujisawaHighStage';
  const colorTheme = 'casual';

  useEffect(() => {
    import(`../data/${bukken}.json`)
      .then(mod => {
        const json = (mod.default ?? mod) as { top: StageData; summary: SummaryData };
        setStage(json.top);
        setSummary(json.summary);
      })
      .catch(console.error);
  }, [bukken]);

  if (!stage || !summary) return null;

  if (!stage) return null;

  return (
    <div className={styles.page}>
      <button
        className={styles.noPrint}
        style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}
        onClick={() => window.print()}
      >
        印刷／PDF出力
      </button>

      {/* FacilityInfo を描画するセクション */}aaa
      <section className={`${styles.remapSection}`}>
        <h2 className={styles.titleUnderline}>周辺施設情報</h2>
        <div>
          <FacilityInfoNoSSR
            propertyName={stage.propertyName}
            propertyLatitude={stage.propertyLatitude}
            propertyLongitude={stage.propertyLongitude}
            prefectureCode={stage.prefectureCode}
            prefecture={stage.prefecture}
            localGovCode={stage.localGovCode}
            localGov={stage.localGov}
            colorScheme={remapColorsInline}
          />
        </div>
      </section>

      {/* 直接 FacilityEnvironment を表示するセクション */}
      <section className={styles.remapSection}>
        <h2 className={styles.titleUnderline}>周辺施設詳細</h2>
        <FacilityEnvNoSSR
          propertyName={stage.propertyName}
          propertyLatitude={stage.propertyLatitude}
          propertyLongitude={stage.propertyLongitude}
          colorScheme={remapColors}        // JSON から読み込んだ色設定を渡す
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.titleUnderline}>サンプル</h2>

        <div className={styles.layoutRowFull}>
          <MapWrapperNoSSR
            mapType="marker"
            propertyName={stage.propertyName}
            propertyLatitude={stage.propertyLatitude}
            propertyLongitude={stage.propertyLongitude}
          />
        </div>
        <div className={styles.divider} />

        <div className={styles.layoutRowFull}>
          <MapWrapperNoSSR
            mapType="route"
            propertyName={stage.propertyName}
            propertyLatitude={stage.propertyLatitude}
            propertyLongitude={stage.propertyLongitude}
            destName="鵠沼海岸駅"
            destLatitude={35.320773837709076}
            destLongitude={139.47106047011826}
          />
        </div>
        <div className={styles.divider} />
        <div className={styles.layoutBlock}>
          <ImageTextBlock data={summary} />
        </div>
        <div className={styles.divider} />

        <div className={styles.annotation}>■注釈エリア：テキストが入ります。</div>
        <div className={styles.source}>■出典エリア：※テキストが入ります。</div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.titleUnderline}>サンプル</h2>

        <div className={styles.layoutRowFull}>
          <MapWrapperNoSSR
            mapType="raster"                           // “タイルオーバーレイ系” を示すキー
            propertyName={stage.propertyName}
            propertyLatitude={stage.propertyLatitude}
            propertyLongitude={stage.propertyLongitude}
            layerConfig={{                             // もともとの mapLayerType/source 情報をまとめる
              source:      '国土地理院',
              mapLayerType:'洪水浸水',
            }}
          />
        </div>

        <div className={styles.divider} />

        <div className={styles.layoutRowFull}>
            <ChartWrapper
              chartTitle="【通学・通勤の場所】"
              chartType="グループ化棒グラフ"
              source="統計ダッシュボード"
              dataKey="65歳以上の人のいる核家族世帯"
              targetYear="年推移"
              axisConfig={{ xKey: 'time', yKey: 'value', categoryLabel: 'category', xLabel: '', yLabel: '', unit: '人' }}
              prefectureCode={stage.prefectureCode}
              prefecture={stage.prefecture}
              localGovCode={stage.localGovCode}
              localGov={stage.localGov}
              colors={['#ff0000', '#112233', '#3333ff']}
            />
          </div>

          <div className={styles.layoutRowFull}>
            <ChartWrapper
              chartTitle="【世帯の構成】"
              chartType="横向きグループ化棒グラフ"
              source="統計ダッシュボード"
              dataKey="世帯の種類"
              targetYear="過去10年"
              axisConfig={{ xKey: 'time', yKey: 'value', categoryLabel: 'category', xLabel: '', yLabel: '', unit: '' }}
              prefectureCode={stage.prefectureCode}
              prefecture={stage.prefecture}
              localGovCode={stage.localGovCode}
              localGov={stage.localGov}
              colorTheme={colorTheme}
            />
        </div>

        <div className={styles.divider} />

        <div className={styles.annotation}>■注釈エリア：テキストが入ります。</div>
        <div className={styles.source}>■出典エリア：※テキストが入ります。</div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.titleUnderline}>サンプル</h2>

        <div className={styles.layoutRowFull}>
            <ChartWrapper
              chartTitle="【通学・通勤スタイルの年推移】"
              chartType="積み上げ棒グラフ"
              source="統計ダッシュボード"
              dataKey="通学・通勤スタイル"
              targetYear="過去10年"
              axisConfig={{ xKey: 'time', yKey: 'value', categoryLabel: 'category', xLabel: '', yLabel: '', unit: '' }}
              prefectureCode={stage.prefectureCode}
              prefecture={stage.prefecture}
              localGovCode={stage.localGovCode}
              localGov={stage.localGov}
              colorTheme={colorTheme}
            />
          </div>

          <div className={styles.layoutRowFull}>
            <ChartWrapper
              chartTitle="【居住室の畳数別住宅数】"
              chartType="横向き棒グラフ"
              source="統計ダッシュボード"
              dataKey="居住室の畳数別住宅数"
              targetYear="最新"
              axisConfig={{ xKey: 'category', yKey: 'value', categoryLabel: '', xLabel: '', yLabel: '', unit: '' }}
              prefectureCode={stage.prefectureCode}
              prefecture={stage.prefecture}
              localGovCode={stage.localGovCode}
              localGov={stage.localGov}
              colorTheme={colorTheme}
            />
        </div>

        <div className={styles.divider} />
        <div className={styles.layoutRowFull}>
            <ChartWrapper
              chartTitle="【年齢別人口】"
              chartType="円グラフ"
              source="統計ダッシュボード"
              dataKey="年齢別人口"
              targetYear="最新"
              axisConfig={{ xKey: '', yKey: 'value', categoryLabel: 'category', xLabel: '', yLabel: '', unit: '' }}
              prefectureCode={stage.prefectureCode}
              prefecture={stage.prefecture}
              localGovCode={stage.localGovCode}
              localGov={stage.localGov}
              colorTheme={colorTheme}
            />
          </div>

        <div className={styles.layoutRowFull}>
            <ChartWrapper
              chartTitle="【通勤・通学手段別人数２】"
              chartType="凡例付き円グラフ"
              source="統計ダッシュボード"
              dataKey="通勤・通学手段別人数"
              targetYear="最新"
              axisConfig={{ xKey: '', yKey: 'value', categoryLabel: 'category', xLabel: '', yLabel: '', unit: '' }}
              prefectureCode={stage.prefectureCode}
              prefecture={stage.prefecture}
              localGovCode={stage.localGovCode}
              localGov={stage.localGov}
              colorTheme={colorTheme}
            />
        </div>

        <div className={styles.divider} />

        <div className={styles.layoutRowFull}>
            <ChartWrapper
              chartTitle="【居住室の畳数別割合】"
              chartType="円グラフ"
              source="統計ダッシュボード"
              dataKey="居住室の畳数別住宅数"
              targetYear="2003年"
              axisConfig={{ xKey: '', yKey: 'value', categoryLabel: 'category', xLabel: '', yLabel: '', unit: '' }}
              prefectureCode={stage.prefectureCode}
              prefecture={stage.prefecture}
              localGovCode={stage.localGovCode}
              localGov={stage.localGov}
              colorTheme={colorTheme}
            />
          </div>

          <div className={styles.layoutRowFull}>
            <ChartWrapper
              chartTitle="【世帯の種類2】"
              chartType="グループ化棒グラフ"
              source="統計ダッシュボード"
              dataKey="世帯の種類"
              targetYear="年推移"
              axisConfig={{ xKey: 'time', yKey: 'value', categoryLabel: 'category', xLabel: '', yLabel: '', unit: '' }}
              prefectureCode={stage.prefectureCode}
              prefecture={stage.prefecture}
              localGovCode={stage.localGovCode}
              localGov={stage.localGov}
              colorTheme={colorTheme}
            />
        </div>
        <div className={styles.divider} />

        <div className={styles.layoutRowFull}>
        <ChartWrapper
              chartTitle="【世帯の種類3】"
              chartType="円グラフ"
              targetYear="過去5年"     // 過去10年　／　1980年　／　最新　など
              source="統計ダッシュボード"
              dataKey="世帯の種類"
              axisConfig={{ xKey: 'time', yKey: 'value', categoryLabel: 'category', xLabel: '', yLabel: '', unit: '' }}
              prefectureCode={stage.prefectureCode}
              prefecture={stage.prefecture}
              localGovCode={stage.localGovCode}
              localGov={stage.localGov}
              colorTheme={colorTheme}
            />
        </div>
        <div className={styles.divider} />

        <div className={styles.layoutRowFull}>
        <ChartWrapper
              chartTitle="【世帯の種類3】"
              chartType="積み上げ棒グラフ"
              targetYear="過去5年"     // 過去10年　／　1980年　／　最新　など
              source="統計ダッシュボード"
              dataKey="世帯の種類"
              axisConfig={{ xKey: 'time', yKey: 'value', categoryLabel: 'category', xLabel: '', yLabel: '', unit: '' }}
              prefectureCode={stage.prefectureCode}
              prefecture={stage.prefecture}
              localGovCode={stage.localGovCode}
              localGov={stage.localGov}
              colorTheme={colorTheme}
            />
        </div>
        <div className={styles.divider} />

        <div className={styles.layoutRowFull}>
        <ChartWrapper
              chartTitle="【世帯の種類3】"
              chartType="グループ化棒グラフ"
              targetYear="過去5年"     // 過去10年　／　1980年　／　最新　など
              source="統計ダッシュボード"
              dataKey="世帯の種類"
              axisConfig={{ xKey: 'time', yKey: 'value', categoryLabel: 'category', xLabel: '', yLabel: '', unit: '' }}
              prefectureCode={stage.prefectureCode}
              prefecture={stage.prefecture}
              localGovCode={stage.localGovCode}
              localGov={stage.localGov}
              colorTheme={colorTheme}
            />
        </div>

        <div className={styles.divider} />



        <div className={styles.annotation}>■注釈エリア：テキストが入ります。</div>
        <div className={styles.source}>■出典エリア：※テキストが入ります。</div>
      </section>
    </div>
  );
}