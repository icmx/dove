import * as esbuild from 'esbuild';
import * as files from 'files';

(async () => {
  await files.remove('dist');

  await esbuild.build({
    entryPoints: ['./src/main.ts'],
    logLevel: 'info',
    outdir: './dist',
    bundle: true,
    minify: true,
    platform: 'node',
    format: 'cjs',
  });
})();
