import { build, context } from 'esbuild'

const watch = process.argv.includes('--watch')

const options = {
  entryPoints: ['src/edumanage-card.ts'],
  outfile: 'dist/edumanage-card.js',
  bundle: true,
  format: 'esm',
  target: 'es2022',
  minify: !watch,
  sourcemap: watch,
  logLevel: 'info',
}

if (watch) {
  const ctx = await context(options)
  await ctx.watch()
} else {
  await build(options)
}
