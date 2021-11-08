const mix = require('laravel-mix');
const path = require('path');
require('laravel-mix-purgecss');

// See https://github.com/kabbouchi/laravel-mix-merge-manifest
let ManifestPlugin = require('laravel-mix/src/webpackPlugins/ManifestPlugin');
let merge = require('lodash').merge;
mix.extend('mergeManifest', function (config, ...args) {
  config.plugins.forEach((plugin, index) => {
    if (plugin instanceof ManifestPlugin) {
      config.plugins.splice(index, 1);
    }
  });

  config.plugins.push(new class {
    apply(compiler) {

      compiler.hooks.emit.tapAsync('ManifestPlugin', (curCompiler, callback) => {
        let stats = curCompiler.getStats().toJson();

        try {
          Mix.manifest.manifest = merge(Mix.manifest.read(), Mix.manifest.manifest);
        } catch (e) {

        }

        Mix.manifest.transform(stats).refresh();
        callback();
      });
    }
  });
});


const purgeCssOptions = {
  safelist: {
    // List of regex of CSS class to not remove
    standard: [/^vs__/],
    // List of regex of CSS class name whose child path CSS class will not be removed
    //  ex: to exclude "jane" in "mary jane": add "mary")
    deep: [/^vue-loaders/, /^vs-/],
  }
};

mix.js('resources/js/app2.js', 'js').vue()
  .sass('resources/css/app2-ltr.scss', 'css')
  .sass('resources/css/app2-rtl.scss', 'css')
  .purgeCss(purgeCssOptions)
  .webpackConfig({
    output: { chunkFilename: 'js/[name].js?id=[chunkhash]' },
  })
  .alias({
    vue$: path.join(__dirname, 'node_modules/vue/dist/vue.esm-bundler.js'),
    '@': path.resolve('resources/js'),
  })
  .babelConfig({
    plugins: ['@babel/plugin-syntax-dynamic-import'],
  })
  .sourceMaps(process.env.MIX_PROD_SOURCE_MAPS || false, 'eval-cheap-module-source-map', 'source-map')
  .setPublicPath('../public')
  .setResourceRoot('../../')
  .mergeManifest();

if (mix.inProduction()) {
  mix.version();
}