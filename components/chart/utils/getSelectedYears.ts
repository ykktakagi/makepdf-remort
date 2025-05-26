export function getSelectedTimes(allTimes: string[], targetYear: string): string[] {
  // ソートしておく（昇順）
  const sortedTimes = [...allTimes].sort();

  if (targetYear === '最新') {
    return sortedTimes.slice(-1);
  } else if (/^過去(\d+)年$/.test(targetYear)) {
    const n = parseInt(targetYear.match(/^過去(\d+)年$/)?.[1] || '0', 10);
    return sortedTimes.slice(-n);
  } else if (/^\d{4}(年)?$/.test(targetYear)) {
    return [targetYear.replace(/年$/, '')];
  } else {
    return sortedTimes;
  }
}
