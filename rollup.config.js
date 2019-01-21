import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

export default {
    input: 'src/index.ts',
    output: {
        file: 'dist/index.js',
        format: 'cjs',
    },
    plugins: [
        resolve({extensions: ['.ts', '.tsx']}),
        babel({exclude: 'node_module/**', extensions: ['.ts', '.tsx']})
    ],
    external: ['react']
}