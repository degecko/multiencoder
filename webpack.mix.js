let mix = require('laravel-mix');

mix.setPublicPath('./dist')
    .js('src/js/app.js', 'dist')
    .sass('src/sass/app.scss', 'dist');

if (mix.inProduction()) {
    mix.version();
}
