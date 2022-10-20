import { babel } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';
import {createRequire} from "node:module";

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const config = {
  distDir: './dist',
  ecmascriptLevel: '2017',
  sourceMap: false, // process.env.NODE_ENV === 'production',
  cache: false,
  extensions: ['.ts', '.tsx'],
  external: [
    ...Object.keys(pkg?.dependencies ?? {}),
    ...Object.keys(pkg?.peerDependencies ?? {}),
  ],
};

const rollupPlugins = [
  resolve({ extensions: config.extensions }),
  babel({
    extensions: config.extensions,
    include: ['src/**/*'],
    babelHelpers: 'bundled',
    skipPreflightCheck: false,
  }),
];

export default () => [
  // ESM Compat
  {
    input: ['./src/index.ts', './src/serverSideTranslations.ts'],
    external: config.external,
    plugins: [...rollupPlugins],
    output: {
      format: 'esm',
      preserveModules: true, // Will allow maximum tree-shakeability by bundlers such as webpack
      dir: `${config.distDir}/esm`,
      entryFileNames: '[name].js',
      sourcemap: config.sourceMap,
    },
  },
  // CJS compat
  {
    input: ['./src/index.ts', './src/serverSideTranslations.ts'],
    preserveModules: false,
    external: config.external,
    plugins: [...rollupPlugins],
    output: {
      format: 'cjs',
      dir: `${config.distDir}/commonjs`,
      entryFileNames: '[name].js',
      sourcemap: config.sourceMap,
    },
  },
  // Typings
  {
    input: './src/index.ts',
    output: {
      file: `${config.distDir}/types/index.d.ts`,
      format: 'es',
    },
    external: config.external,
    plugins: [
      dts({
        compilerOptions: {
          tsBuildInfoFile: './tsconfig.tsbuildinfo.dts',
        },
      }),
    ],
  }
];
