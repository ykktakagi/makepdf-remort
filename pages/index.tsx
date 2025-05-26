// pages/index.tsx
import dynamic from 'next/dynamic';

// Homeコンポーネントは非SSRで読み込む
const HomeNoSSR = dynamic(() => import('../components/Home'), { ssr: false });

export default function Index() {
  return <HomeNoSSR />;
}
