import dts from 'rollup-plugin-dts';

export default [
	{
		input: 'out/index.js',
		output: {
			dir: 'dist',
			format: "esm",
			preserveModules: true,
		}
	},
	{
		input: 'out/index.d.ts',
		output: {
			file: 'dist/index.d.ts'
		},
		plugins: [dts()]
	}
]
