import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default [
  // Development build
  {
    input: 'js/dragon.js',
    output: {
      file: 'dist/dragon.js',
      format: 'iife',
      name: 'dragon',
      globals: {
        'dragon': 'dragon'
      }
    },
    plugins: [
      resolve(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', {
            targets: {
              browsers: ["> 1%", "last 2 versions", "not dead", "IE 11"]
            }
          }]
        ]
      })
    ]
  },
  // Production build (minified)
  {
    input: 'js/dragon.js',
    output: {
      file: 'dist/dragon.min.js',
      format: 'iife',
      name: 'dragon',
      globals: {
        'dragon': 'dragon'
      }
    },
    plugins: [
      resolve(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', {
            targets: {
              browsers: ["> 1%", "last 2 versions", "not dead", "IE 11"]
            }
          }]
        ],
        plugins: ['transform-remove-console']
      }),
      terser()
    ]
  },
  // Snippets - development
  {
    input: 'snippets.js',
    output: {
      file: 'dist/snippets.js',
      format: 'es'
    },
    plugins: [
      resolve(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', {
            targets: {
              browsers: ["> 1%", "last 2 versions", "not dead", "IE 11"]
            }
          }]
        ]
      })
    ]
  },
  // Snippets - production (minified)
  {
    input: 'snippets.js',
    output: {
      file: 'dist/snippets.min.js',
      format: 'es'
    },
    plugins: [
      resolve(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', {
            targets: {
              browsers: ["> 1%", "last 2 versions", "not dead", "IE 11"]
            }
          }]
        ],
        plugins: ['transform-remove-console']
      }),
      terser()
    ]
  }
];