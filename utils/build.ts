import * as ESbuild from 'esbuild';
import * as Files from 'files';

(async () => {
  await Files.remove('dist');

  await ESbuild.build({
    entryPoints: ['./src/main.ts'],
    logLevel: 'info',
    outdir: './dist',
    bundle: true,
    minify: true,
    platform: 'node',
    format: 'cjs',
  });
})();
