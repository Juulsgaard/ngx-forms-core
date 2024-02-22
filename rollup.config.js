import dts from 'rollup-plugin-dts';

export default [
	{
		input: 'out/index.js',
		output: {
			dir: 'dist',
			format: "esm",
			preserveModules: true,
		},
		external: ['@juulsgaard/ts-tools', 'rxjs', 'rxjs/operators', '@juulsgaard/rxjs-tools', '@angular/core', '@angular/forms']
	},
	{
		input: 'out/index.d.ts',
		output: {
			file: 'dist/index.d.ts'
		},
		plugins: [dts()]
	}
]
