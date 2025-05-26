// next.config.js
const path = require('path')
const { NextFederationPlugin } = require('@module-federation/nextjs-mf')

module.exports = {
  webpack(config, options) {
    const isServer = options.isServer

    config.resolve.alias['@'] = path.resolve(__dirname)

    config.plugins.push(
      new NextFederationPlugin({
        name: 'makepdf_remort',
        filename: 'static/chunks/remoteEntry.js', // ←重要：このままでOK
        exposes: {
          './ChartWrapper': './components/ChartWrapper.tsx',
          './chart/Bar': './components/chart/Bar.tsx',
          './chart/GroupedBar': './components/chart/GroupedBar.tsx',
          './chart/HorizontalBar': './components/chart/HorizontalBar.tsx',
          './chart/HorizontalGroupedBar': './components/chart/HorizontalGroupedBar.tsx',
          './chart/Pie': './components/chart/Pie.tsx',
          './chart/PieWithLegend': './components/chart/PieWithLegend.tsx',
          './chart/Radar': './components/chart/Radar.tsx',
          './chart/StackedBar': './components/chart/StackedBar.tsx',
          './MapWrapper': './components/MapWrapper.tsx',
          './map/RasterImageMap': './components/map/RasterImageMap.tsx',
          './map/OneMap': './components/map/OneMap.tsx',
          './map/RootMap': './components/map/RootMap.tsx',
        },
        shared: {
          react: { singleton: true, eager: true },
          'react-dom': { singleton: true, eager: true },
          recharts: { singleton: true, eager: false },
          leaflet: { singleton: true, eager: false },
          'react-leaflet': { singleton: true, eager: false },
        },
      })
    )

    return config
  },

  transpilePackages: ['@module-federation/nextjs-mf'],

}
