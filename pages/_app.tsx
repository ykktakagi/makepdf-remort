import '../styles/print.css';
import "../styles/globals.css";

import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import type { AppProps } from 'next/app';
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}