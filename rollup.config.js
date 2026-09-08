import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import rollupSvelte from 'rollup-plugin-svelte';
import rollupSwc from 'rollup-plugin-swc3';
import { less } from 'svelte-preprocess-less';
import sveltePreprocess from 'svelte-preprocess';
import { transformCodeToESMPlugin, keyPEM, certificatePEM } from '@windycom/plugin-devtools';

const useSourceMaps = true;

export default {
  input: 'src/pluginEntry.svelte',
  output: [
    { file: 'dist/plugin.js', format: 'module', sourcemap: true },
    {
      file: 'dist/plugin.min.js',
      format: 'module',
      plugins: [terser()],
    },
  ],
  onwarn(warning, warn) {
    // Third-party packages can contain benign cycles; keep every other warning
    // visible so real plugin/build problems are not silently hidden.
    if (warning.code !== 'CIRCULAR_DEPENDENCY') warn(warning);
  },
  external: id => id.startsWith('@windy/'),
  watch: {
    include: ['src/**'],
    exclude: 'node_modules/**',
    clearScreen: false,
  },
  plugins: [
    rollupSvelte({
      emitCss: false,
      preprocess: {
        style: less({ sourceMap: false, math: 'always' }),
        script: data => {
          const preprocessed = sveltePreprocess({ sourceMap: useSourceMaps });
          return preprocessed.script(data);
        },
      },
    }),
    rollupSwc({
      include: ['**/*.ts', '**/*.svelte'],
      sourceMaps: useSourceMaps,
    }),
    resolve({
      browser: true,
      mainFields: ['module', 'jsnext:main', 'main'],
      preferBuiltins: false,
      dedupe: ['svelte'],
    }),
    commonjs(),
    transformCodeToESMPlugin(),
    process.env.SERVE !== 'false' &&
      serve({
        contentBase: 'dist',
        host: '0.0.0.0',
        port: 9999,
        headers: { 'Access-Control-Allow-Origin': '*' },
        https: { key: keyPEM, cert: certificatePEM },
      }),
  ],
};
