import { defineConfig } from 'vite';
import { globSync } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sassGlobImports from 'vite-plugin-sass-glob-import';
import VitePluginWebpAndPath from 'vite-plugin-webp-and-path';
import autoprefixer from 'autoprefixer';

//Read JS
const inputJsArray = globSync( 'js/**/*.js', { ignore: [ 'node_modules/**', '**/modules/**' ] } )
	.map( file => {
		return [
			path.relative (
				'./js',
				file.slice( 0, file.length - path.extname( file ).length )
			),
			fileURLToPath( new URL( file, import.meta.url ) )
		]
	}
);

//Read HTML
const inputHtmlArray = globSync( 'index.html' )
	.map( file => {
		return [
			path.relative(
				'',
				file.slice( 0, file.length - path.extname( file ).length )
			),
			fileURLToPath( new URL( file, import.meta.url ) )
		]
	}
);

//Read SCSS
const inputScssArray = globSync( 'scss/**/*.scss', { ignore: [ 'scss/**/_*.scss' ] } )
	.map( file => {
		const fileName = file.slice( file.lastIndexOf( '/' ) + 1, file.length - path.extname( file ).length );
		return [
			fileName,
			fileURLToPath( new URL( file, import.meta.url ) )
		]
	}
);

const inputImgArray = globSync( [ '**/*.gif', '**/*.jpeg', '**/*.jpg', '**/*.png', '**/*.svg', '**/*.webp' ], { ignore: [ 'node_modules/**' ] } )
	.map( file => {
		return [
			path.relative (
				'',
				file.slice( 0, file.length - path.extname( file ).length )
			),
			fileURLToPath( new URL( file, import.meta.url ) )
		]
	}
);

//Integrate objecs from read Arrays
const inputObj = Object.fromEntries( inputJsArray.concat( inputHtmlArray, inputScssArray, inputImgArray ) );

export default defineConfig ( {
	server: {
		host: true,
	},
	css: {
		devSourcemap: true,
		postcss: {
			plugins: [
				autoprefixer( {} ) // add options if needed
			],
		}
	},
	plugins:[
		sassGlobImports(),
		VitePluginWebpAndPath()
	],
	build: {
		assetsInlineLimit: 0,
		rollupOptions: {
			input: inputObj,
			output: {
				entryFileNames: `assets/js/[name].js`,
				chunkFileNames: `assets/js/[name].js`,
				assetFileNames: ( assetInfo ) => {
					if( assetInfo.name ) {
						if ( /\.( gif|jpeg|jpg|png|svg|webp| )$/.test( assetInfo.name ) ) {
							return 'assets/img/[name].[ext]';
						}
						if ( /\.css$/.test( assetInfo.name ) ) {
							return 'assets/css/[name].[ext]';
						}
					}
					return 'assets/[name].[ext]';
				}
			},
		},
	}
} );
