import { defineConfig } from 'tsup'
import fs from 'fs'
import path from 'path'

function makeTsconfigAliasPlugin() {
  const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json')
  let aliases: Record<string, string> = {}
  try {
    const cfg = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'))
    const baseUrl = cfg.compilerOptions?.baseUrl || '.'
    const paths = cfg.compilerOptions?.paths || {}
    aliases = Object.fromEntries(
      Object.entries(paths).map(([k, v]) => {
        const key = k.replace(/\/*$/, '')
        const target = Array.isArray(v) && v.length ? v[0].replace(/\/*$/, '') : v
        const resolved = path.resolve(process.cwd(), baseUrl, target)
        return [key, resolved]
      })
    )
  } catch (e) {
    // ignore
  }

  return {
    name: 'tsconfig-paths-inline',
    setup(build: any) {
      for (const [alias, absPath] of Object.entries(aliases)) {
        const filter = new RegExp('^' + alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        build.onResolve({ filter }, (args: any) => {
          const remainder = args.path.slice(alias.length)
          const resolved = path.join(absPath, remainder)
          return { path: resolved }
        })
      }
    },
  }
}

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node24',
  outDir: 'dist',
  dts: false,
  sourcemap: true,
  clean: true,
  esbuildPlugins: [makeTsconfigAliasPlugin()],
  splitting: false,
  minify: false,
  bundle: true,
})
