const gulp = require('gulp');
const sass = require('gulp-sass')(require('node-sass'));
const fileinclude = require('gulp-file-include');
const server = require('browser-sync').create();

const paths = {
    src: './src',
    dest: './build'
};

// Compile scss into css
function compileSCSS(){

    // 1. Find my scss file
    return gulp.src(`${paths.src}/assets/scss/**/*.scss`)

        // 2. Pass that file through sass compiler
        .pipe(sass().on('error', sass.logError))

        // 3. Compiles CSS to the destination folder
        .pipe(gulp.dest(`${paths.dest}/assets/styles/`))

        // 4. Stream changes
        .pipe(server.stream());

}

// Copy assets
function copyAssets() {
    gulp.src([
        `${paths.src}/assets/**/*`,
        `!${paths.src}/assets/scss`, // ignore
        `!${paths.src}/assets/scss/*.scss` // ignore
    ])
    .pipe(gulp.dest(`${paths.dest}/assets`));

}

// HTML include functionality
function includeHTML(){
    return gulp.src([
      `${paths.src}/**/*.html`,
      `!${paths.src}/templates/*.html` // ignore
      ])
      .pipe(fileinclude({
        prefix: '@@',
        basepath: `${paths.src}/templates`
      }))
      .pipe(gulp.dest(`${paths.dest}/`));
}

// Watches changes on SCSS, HTML and JS files using browserSync
function watch(){

    // Init serve files from the build folder
    server.init({
        server: {
            baseDir: paths.dest
        }
    });

    // Build and reload for the first time
    build();
    server.reload();

    // Watch HTML Task
    gulp.watch([
        `${paths.src}/**/*.html`, 
        `!${paths.src}/build/*` // ignore
    ]).on('change', function() {
        includeHTML();
        copyAssets();
        server.reload();
    });

    // Watch SCSS Task
    gulp.watch(`${paths.src}/assets/scss/**/*.scss`, compileSCSS);

    // Watch JS Task
    gulp.watch(`${paths.src}/assets/scripts/**/*.js`).on('change', server.reload);

}

// Build for production
async function build(){
    await includeHTML();
    await compileSCSS();
    await copyAssets();
}

exports.watch = watch;
exports.build = build;