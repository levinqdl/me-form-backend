import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

export default {
    input: 'src/index.ts',
    output: {
        file: 'dist/index.js',
        format: 'cjs',
        exports: 'named'
    },
    plugins: [
        resolve({extensions: ['.ts', '.tsx']}),
        commonjs({
            include: /node_modules/
        }),
        babel({exclude: 'node_modules/**', extensions: ['.ts', '.tsx']})
    ],
    external: ['react']
}