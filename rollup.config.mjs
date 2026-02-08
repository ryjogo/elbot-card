import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/elbot-card.js',
  output: {
    file: 'dist/elbot-card.js',
    format: 'es',
    banner: '/* Elbot Card v' + process.env.npm_package_version + ' */\n',
  },
  plugins: [
    resolve(),
    terser({
      format: {
        comments: /^!/,
      },
    }),
  ],
};
