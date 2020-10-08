'use strict';

const pth = require('path');
const gulp = require('gulp');

// Views
const pug = require('gulp-pug');
const fileInclude = require('gulp-file-include');

// Styles
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');

// Scripts
const browserify = require('browserify');
const babelify = require('babelify');
const watchify = require('watchify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify-es').default;

// Images
const imagemin = require('gulp-imagemin');
// const webp = require('gulp-webp');
const svgStore = require('gulp-svgstore');

// Server
const browserSync = require('browser-sync').create();

// Tools
const inject = require('gulp-inject');
const gulpIf = require('gulp-if');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const newer = require('gulp-newer');
const del = require('del');
const notify = require('gulp-notify');

// Config
const isProduction = process.env.NODE_ENV === 'production' || false;
const port = process.env.PORT || 9000;

const src = './source';
const dest = './build';
const path = {
  styles: {
    src: `${src}/scss/**/*.scss`,
    dest: `${dest}/css`,
    filename: `style.css`,
  },
  scripts: {
    src: `${src}/js/**/*.js`,
    dest: `${dest}/js`,
    filename: `main.js`,
    entryPoint: `${src}/js/index.js`,
  },
  images: {
    src: `${src}/assets/images/**/*.{png,jpg,jpeg}`,
    svg: `${src}/assets/images/**/i-*.svg`,
    dest: `${dest}/assets/images`,
  },
  icons: {
    src: `${src}/assets/images/icons/*.svg`,
    dest: `${dest}/assets/images/`,
    filename: `icons.svg`,
  },
  views: {
    src: `${src}/views/**/*.{html,pug}`,
    ignore: `${src}/views/**/_*.{html,pug}`,
    dest: `${dest}`,
  },
  vendors: {
    src: `${src}/vendors.json`,
    filename: `libs.css`,
  },
};

// Helpers
const isPug = (file) => file.extname === '.pug';
const handleError = (taskName) =>
  function (err) {
    notify.onError({
      message: `${taskName} failed, check the logs...`,
      sound: false,
    })(err);

    console.error(err.message);
    this.emit('end');
  };

// Tasks
const server = (done) => {
  browserSync.init({
    server: {
      baseDir: dest,
    },
    port: port,
    notify: false,
    open: true,
    cors: true,
  });

  done();
};

const reload = (done) => {
  browserSync.reload();

  done();
};

const views = () => {
  const styleFile = pth.join(path.styles.dest, path.styles.filename);
  const libFile = pth.join(path.styles.dest, path.vendors.filename);
  const jsFile = pth.join(path.scripts.dest, path.scripts.filename);

  const srcOptions = { read: false, allowEmpty: true };
  const injectOptions = { relative: true };

  return gulp
    .src(path.views.src, { ignore: path.views.ignore })
    .pipe(plumber({ errorHandler: handleError('Views') }))
    .pipe(gulpIf(isPug, pug(), fileInclude()))
    .pipe(gulp.dest(path.views.dest))
    .pipe(
      inject(gulp.src(libFile, srcOptions), {
        name: 'vendor',
        ...injectOptions,
      })
    )
    .pipe(inject(gulp.src(styleFile, srcOptions), injectOptions))
    .pipe(inject(gulp.src(jsFile, srcOptions), injectOptions))
    .pipe(gulp.dest(path.views.dest));
};

const styles = () => {
  return gulp
    .src(path.styles.src)
    .pipe(plumber({ errorHandler: handleError('Styles') }))
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(gulpIf(isProduction, autoprefixer({ cascade: false })))
    .pipe(rename({ suffix: '.original' }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.styles.dest))
    .pipe(cleanCSS({ level: { 2: { mergeMedia: false } } }))
    .pipe(rename(path.styles.filename))
    .pipe(gulp.dest(path.styles.dest))
    .pipe(browserSync.stream());
};

const scripts = (watch = false) => {
  let bundler = browserify({
    entries: path.scripts.entryPoint,
    debug: !isProduction,
  }).transform(babelify, {
    presets: ['@babel/env'],
  });

  function rebundle() {
    return bundler
      .bundle()
      .on('error', handleError('Scripts'))
      .pipe(source(path.scripts.filename))
      .pipe(buffer())
      .pipe(gulpIf(!isProduction, sourcemaps.init({ loadMaps: true })))
      .pipe(gulpIf(isProduction, uglify()))
      .pipe(gulpIf(!isProduction, sourcemaps.write('./')))
      .pipe(gulp.dest(path.scripts.dest))
      .pipe(browserSync.stream({ once: true }));
  }

  if (watch === true) {
    bundler = watchify(bundler);

    bundler.on('update', () => {
      console.log(' -> Building...');

      rebundle();
    });
  }

  return rebundle();
};

const imgs = () => {
  return gulp
    .src([path.images.src, path.images.svg])
    .pipe(newer(path.images.dest))
    .pipe(
      imagemin([
        imagemin.mozjpeg({ quality: 80, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({ plugins: [{ removeViewBox: false }] }),
      ])
    )
    .pipe(gulp.dest(path.images.dest));
};

const webps = () => {
  return gulp
    .src(path.images.src)
    .pipe(newer(path.images.dest))
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest(path.images.dest));
};

const icons = () => {
  const dest = pth.join(path.icons.dest, path.icons.filename);

  return gulp
    .src(path.icons.src, { ignore: path.images.svg })
    .pipe(newer(dest))
    .pipe(imagemin([imagemin.svgo({ plugins: [{ removeViewBox: false }] })]))
    .pipe(svgStore())
    .pipe(rename(path.icons.filename))
    .pipe(gulp.dest(path.icons.dest));
};

const vendors = (done) => {
  const targets = require(path.vendors.src);

  if (targets.length === 0) return done();

  return gulp
    .src(targets, {
      cwd: src,
    })
    .pipe(concat(path.vendors.filename))
    .pipe(gulp.dest(path.styles.dest));
};

const clean = () => {
  return del(dest);
};

const copy = () => {
  return gulp
    .src(`${src}/**/*`, {
      nodir: true,
      ignore: Object.keys(path)
        .map((item) => path[item].src)
        .flat(),
    })
    .pipe(newer(dest))
    .pipe(gulp.dest(dest));
};

// Complex tasks
const images = gulp.parallel(imgs, icons);

const watchStatic = () => {
  gulp.watch(path.views.src, gulp.series(views, reload));
  gulp.watch(path.styles.src, styles);
  gulp.watch(path.vendors.src, gulp.series(vendors, reload));
  gulp.watch([path.images.src, path.icons.src], gulp.series(images, reload));
};

const watchScripts = () => scripts(true);

const watch = gulp.parallel(watchStatic, watchScripts);

const dev = gulp.series(
  gulp.parallel(styles, vendors, scripts),
  gulp.parallel(views, images, copy),
  gulp.parallel(server, watch)
);

module.exports.clean = clean;
module.exports.watch = watch;
module.exports.build = gulp.series(
  clean,
  gulp.parallel(styles, vendors, scripts),
  gulp.parallel(views, images, copy)
);
module.exports.default = dev;
