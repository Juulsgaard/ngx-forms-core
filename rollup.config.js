import dts from 'rollup-plugin-dts';

export default [
	{
		input: 'out/index.js',
		output: {
			file: 'dist/index.js'
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
