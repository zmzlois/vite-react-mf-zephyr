import { defineConfig, ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { withZephyr } from 'vite-plugin-zephyr';
import { viteManifestPlugin } from "vite-manifest-plugin"

const mfConfig = {
  name: 'vite-host',
  filename: 'remoteEntry.js',
  remotes: {
    'vite-remote': {
      entry: 'http://localhost:5174/remoteEntry.js',
      type: 'module',
    },
    vite_webpack: {
      entry: 'http://localhost:8080/remoteEntry.js',
      type: 'var',
    },
    vite_rspack: {
      entry: 'http://localhost:8081/remoteEntry.js',
      type: 'var',
    },
  },
  shared: {
    react: {
      singleton: true,
    },
    'react-dom': {
      singleton: true,
    },
  },
};


export default defineConfig(({ mode }: ConfigEnv) => {

  const isDevelopmentMode = mode === 'development';
  const isCI = process.env.CI === 'true';
  const publicPath = !isDevelopmentMode && isCI ? process.env.PUBLIC_URL ?? '/' : '/'
  return {
    base: publicPath,
    plugins: [react(), withZephyr(mfConfig), viteManifestPlugin({
      fileName: 'asset-manifest-vite.json',
      publicPath: publicPath,
    }),],
    build: {
      // target: 'chrome89',
      outDir: '../Supply/wwwroot',
      emptyOutDir: true,
      target: 'esnext',
      // modulePreload: false,
      manifest: 'asset-manifest-vite.json',
      minify: true,
      terserOptions: {
        compress: true,
        mangle: false,
      },

    },
    rollupOptions: {
      output: {
        format: 'esm',
        entryFileNames: `static/js/main.[hash].js`,
        chunkFileNames: `static/js/[name].[hash].js`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        assetFileNames: ({ name }: any) => {
          if (name?.indexOf('css') !== -1)
            return `static/css/[name].[hash].css`
          else return `static/media/[name].[hash].[ext]`
        },
        minifyInternalExports: false,
      },
    },
  }
});
