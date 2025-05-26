// /data/dataKey-reinfolib.ts
// 不動産ライブラリ
import type { LayerInfo } from '@/types/mapTypes';

export const dataKeyReinfolib: Record<string, LayerInfo> = {
  人口密度: {
    url: 'https://www.reinfolib.mlit.go.jp/ex-api/external/XKT013',
    layerType: '色付き画像API',
    zoomLevel: { min: 11, max: 15 },
    hanrei: 'https://disaportal.gsi.go.jp/.../shinsui_legend3.png',
    providedDate: '令和2年3月17日',
    source: '国土交通省各地方整備局等',
    remarks: "本データは、洪水浸水想定区域（想定最大規模）_国管理河川と洪水浸水想定区域（想定最大規模）_都道府県管理河川のデータを統合したものです。都道府県管理河川につきましては、都道府県の許諾を得てタイルデータの配信を行っているため、一部の都道府県のデータ配信のみとなっております。なお、東京都の公表図面では浸水深0.1m未満の区域は着色されていないため、本サイトにおいても同様の表現としております。",
    colorMap: [
        { depth: "20m～", r: 220, g: 122, b: 220 },
        { depth: "10m～20m", r: 242, g: 133, b: 201 },
        { depth: "5m～10m", r: 255, g: 145, b: 145 },
        { depth: "3m～5m", r: 255, g: 183, b: 183 },
        { depth: "0.5m～3m", r: 255, g: 216, b: 192 },
        { depth: "～0.5m", r: 247, g: 245, b: 169 }
      ]
    },
  
    浸水継続時間: {
      url: 'https://disaportaldata.gsi.go.jp/.../keizoku_data/{z}/{x}/{y}.png',
      layerType: '色付き画像重ね',
      zoomLevel: { min: 2, max: 17 },
      hanrei: 'https://disaportal.gsi.go.jp/.../shinsui_legend_l2_keizoku.png',
      providedDate: '令和3年5月28日',
      source: '国土交通省各地方整備局等',
      remarks: '本データは…',
      colorMap: [
        { hour: '～12時間', r: 160, g: 210, b: 255 },
        { hour: "12時間～24時間（1日間）", r: 0, g: 65, b: 255 },
        { hour: "24時間～72時間（3日間）", r: 250, g: 234, b: 0 },
        { hour: "72時間～168時間（1週間）", r: 255, g: 153, b: 0 },
        { hour: "168時間～336時間（2週間）", r: 255, g: 40, b: 0 },
        { hour: "336時間～672時間（4週間）", r: 180, g: 0, b: 104 },
        { hour: "672時間～", r: 96, g: 0, b: 96 }
      ],
    },
  };

  export type ReinfolibDataKey = keyof typeof dataKeyReinfolib;