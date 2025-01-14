import { defineConfig } from 'vitest/config'
import tsConfigPaths from 'vite-tsconfig-paths'

import swc from 'unplugin-swc'

export default defineConfig({
	test: {
		coverage: {
			enabled: false,
		},

		include: ['**/*.e2e-spec.ts'],
		setupFiles: ['./test/setup-e2e.ts'],
		root: './',
	},
	plugins: [
		tsConfigPaths(),
		swc.vite({
			module: {
				type: 'es6',
			},
			jsc: {
				parser: {
					syntax: 'typescript',
					tsx: true,
				},
			},
		}),
	],
})
