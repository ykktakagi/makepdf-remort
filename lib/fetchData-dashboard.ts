// lib/fetchData-dashboard.ts
import { dataKeyDashboard } from '../data/dataKey-dashboard';
import type { ChartRecord} from '../types/chartTypes';

interface DashboardMeta {
  IndicatorCodes:  string;
  IndicatorLabels: string;
  Parameters?:     string; /** 今後の拡張用 */
  [key: string]: any; /** JSON に余分なプロパティがあっても許容 */
}
/**
 * 統計ダッシュボードAPIからデータを取得してChartRecord形式で返す
 */
export async function fetchDataDashboard(
  dataKey:         string,
  localGovCode:    number,
  localGov:        string,
  prefectureCode:  number,
  prefecture:      string,
  comparisonsCode: string = '',
  comparisons:     string = ''
): Promise<{
  data:   ChartRecord[];
  labels: string[];
}> {
  
  console.log('fetch-Data呼ばれた');
  const info = (dataKeyDashboard as unknown as Record<string, DashboardMeta>)[dataKey];
  if (!info) throw new Error(`dataKeyDashboard に key=${dataKey} の定義がありません`);

  const { IndicatorCodes, IndicatorLabels, Parameters = '' } = info;
  const codes  = IndicatorCodes.split(',');
  const labels = IndicatorLabels.split(',');

  const codeLabelMap: Record<string, string> = {};
  codes.forEach((code, idx) => {
    codeLabelMap[code] = labels[idx] ?? `不明ラベル(${code})`;
  });

  const prefCode5 = String(prefectureCode).padEnd(5, '0');
  const regionCodes = [String(localGovCode), prefCode5];
  if (comparisonsCode) regionCodes.push(...comparisonsCode.split(','));
  const regionParam = regionCodes.join(',');

  const chunks: string[][] = [];
  for (let i = 0; i < codes.length; i += 5) {
    chunks.push(codes.slice(i, i + 5));
  }

  const fetches = await Promise.all(
    chunks.map(group => {
      const url = [
        'https://dashboard.e-stat.go.jp/api/1.0/Json/getData?',
        `IndicatorCode=${group.join(',')}`,
        `&RegionCode=${regionParam}`,
        Parameters
      ].join('');
      return fetch(url).then(res => res.json());
    })
  );
  let allEntries: any[] = [];
  fetches.forEach(json => {
    const rawObj = json?.GET_STATS?.STATISTICAL_DATA?.DATA_INF?.DATA_OBJ;
    if (rawObj && typeof rawObj === 'object') {
      allEntries = allEntries.concat(Object.values(rawObj) as any[]);
    }
  });

  const filtered = allEntries.filter(e =>
    regionCodes.includes(e.VALUE['@regionCode'])
  );

  const codeNameMap: Record<string, string> = {
    [String(localGovCode)]: localGov,
    [prefCode5]:            prefecture
  };
  if (comparisonsCode && comparisons) {
    comparisonsCode.split(',').forEach((code, i) => {
      codeNameMap[code] = comparisons.split(',')[i] || code;
    });
  }

  const data: ChartRecord[] = filtered.map(e => {
    const indCode = e.VALUE['@indicator'] as string;
    return {
      time:     (e.VALUE['@time'] as string).slice(0, 4),
      region:   codeNameMap[e.VALUE['@regionCode']] || e.VALUE['@regionCode'],
      category: codeLabelMap[indCode] || `未定義(${indCode})`,
      value:    Number(e.VALUE['$'])
    };
  });

  data.sort((a, b) => {
    if (a.region !== b.region) return a.region.localeCompare(b.region);
    if (a.time !== b.time)     return a.time.localeCompare(b.time);
    return labels.indexOf(a.category) - labels.indexOf(b.category);
  });
console.log("data999999999999:",data)
  return { data, labels };
}
