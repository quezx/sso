/* eslint no-console: 0*/
const gulp = require('gulp');
const del = require('del');
const runSequence = require('run-sequence');
const plugin = require('gulp-load-plugins')();
const locals = require('./apps/config');
const scriptsFolders = ['core', 'accounts', 'hire', 'partner'];

gulp.task('develop', () => plugin.nodemon({
  script: 'app.js',
  ext: 'js',

  // tasks: plugin.livereload.changed,
  ignore: ['node_modules/**', 'bower_components/**', 'src/**', 'dist/**'],
  nodeArgs: [],
  env: { NODE_ENV: 'development' },
}));

// Jade Templates
gulp.task('html', () => gulp
  .src('src/jade/**/*.jade')
  .pipe(plugin.changed('dist/html', { extension: '.html' }))
  .pipe(
    plugin.jade({ pretty: true, locals })
    .on('error', plugin.notify.onError({
      message: 'Jade Error: <%= error.message %>',
    }))
  )
  .pipe(gulp.dest('dist/html'))
  .pipe(plugin.notify({
    onLast: true,
    title: 'Jade Compilation',
    message: 'all jade files compiled',
  })));

// json assets direct copy
gulp.task('copy', () => gulp
  .src('src/*.json')
  .pipe(gulp.dest('dist'))
);

// Fonts
gulp.task('fonts', () => gulp
  .src('bower_components/bootstrap-sass/assets/fonts/**')
  .pipe(gulp.dest('dist/fonts'))
  .pipe(plugin.notify({
    onLast: true,
    title: 'Font copied',
    message: 'Font copy done!',
  })));

// Images
gulp.task('images', () => gulp
  .src('src/images/**/*')
  .pipe(plugin.changed('dist/images', { extension: '.svg' }))
  .pipe(plugin.cache(plugin.imagemin(
    { optimizationLevel: 3, progressive: true, interlaced: true }
  )))
  .pipe(gulp.dest('dist/images'))
  .pipe(plugin.notify({
    onLast: true,
    title: 'Image Minification',
    message: 'Image minification done!',
  })));

// Styles
gulp.task('styles', () => gulp
  .src('src/styles/main.scss')
  .pipe(plugin.sourcemaps.init())
  .pipe(plugin.sass().on('error', plugin.sass.logError))
  .pipe(plugin.autoprefixer('last 2 version'))
  .pipe(plugin.sourcemaps.write('.'))
  .pipe(gulp.dest('dist/styles'))
  .pipe(plugin.rename({ suffix: '.min' }))
  .pipe(plugin.sourcemaps.write('.'))
  .pipe(gulp.dest('dist/styles'))
  .pipe(plugin.notify({
    onLast: true,
    title: 'SASS Compilation',
    message: 'style build complete',
  })));

// Script Tasks
(function scripts() {
  const scriptTasks = scriptsFolders.map(f => {
    const task = `scripts:${f}`;
    gulp.task(task, () => gulp
      .src(`src/scripts/${f}/**/*.js`)
      .pipe(plugin.sourcemaps.init())
      .pipe(plugin.concat(`${f}.js`))
      .pipe(plugin.babel({
        presets: ['es2015'],
      }))
      .on('error', plugin.notify.onError({
        message: 'Babel Error: <%= error.message %>',
      }))
      .pipe(plugin.sourcemaps.write('.'))
      .pipe(gulp.dest('dist/scripts'))
    );

    return task;
  });

  gulp.task('scripts:src', () => gulp
    .src('src/*.js')
    .pipe(plugin.sourcemaps.init())
    .pipe(plugin.babel({
      presets: ['es2015'],
    }))
    .on('error', plugin.notify.onError({
      message: 'Babel Error: <%= error.message %>',
    }))
    .pipe(plugin.uglify())
    .pipe(plugin.sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
  );

  gulp.task('scripts', ['scripts:src'].concat(scriptTasks));
}());

// lint Scripts
gulp.task('lint', () => gulp
  .src(['app/**/*.js', '*.js', 'src/scripts/**/*.js'])
  .pipe(plugin.eslint())
  .pipe(plugin.eslint.format())
  .pipe(plugin.if(
    ~process.argv.indexOf('--fail'),
    plugin.eslint.failAfterError()
  ))
  .pipe(plugin.jscs())
  .pipe(plugin.jscs.reporter())
  .pipe(plugin.if(
    ~process.argv.indexOf('--fail'),
    plugin.jscs.reporter('fail')
  ))
  .pipe(plugin.notify({
    onLast: true,
    title: 'Lint Notification',
    message: 'code linting for error completed',
  })));

// Clean
gulp.task('clean', () => del(['dist', 'assets']));

// Watch
gulp.task('watch', () => {
  // Watch .jade files
  gulp.watch('src/jade/**/*.jade', ['html']);

  // Watch image files
  gulp.watch('src/images/**/*', ['images']);

  // Watch .scss files
  gulp.watch('src/styles/**/*.scss', ['styles']);

  // Watch frontend .js files
  scriptsFolders.map(f => gulp.watch(`src/scripts/${f}/**/*.js`, [`scripts:${f}`]));

  // Watch js files just inside src
  gulp.watch(['src/*.js'], ['scripts:src']);

  // Watch node server files
  gulp.watch(['app/**/*.js', 'src/*.js', '*.js', 'src/scripts/**/*.js'], ['lint']);

  // Create LiveReload server
  plugin.livereload.listen();

  // Watch any files in dist/, reload on change
  gulp.watch('dist/**').on('change', plugin.livereload.changed);
});

gulp.task('build:dev', cb => runSequence(
  'lint', 'clean',
  ['styles', 'scripts', 'images', 'fonts', 'copy'],
  'html', cb
));

gulp.task('build:prod', () => gulp
  .src('dist/**/*.html')
  .pipe(plugin.useref({ searchPath: ['dist', '.'] }))
  .pipe(plugin.if('*.js', plugin.uglify()))
  .pipe(plugin.if('*.js', plugin.rev()))
  .pipe(plugin.if('*.css', plugin.minifyCss()))
  .pipe(plugin.if('*.css', plugin.rev()))
  .pipe(plugin.if('**/*.html', plugin.htmlmin()))
  .pipe(plugin.revReplace())
  .pipe(gulp.dest('assets'))
);

gulp.task(
  'build:copy',
  ['build:copy:sourcesanspro', 'build:copy:fontawesome'],
  () => gulp
    .src(['dist/images/**', 'dist/fonts/**', 'dist/*.js', 'dist/*.json'], { base: 'dist' })
    .pipe(gulp.dest('assets'))
);

gulp.task('build:copy:sourcesanspro', () => gulp
  .src(
    'bower_components/source-sans-pro/**/*.?(eot|otf|ttf|woff|woff2)',
    { base: 'bower_components/source-sans-pro' }
  )
  .pipe(gulp.dest('assets/styles'))
);

gulp.task('build:copy:fontawesome', () => gulp
  .src(
    'bower_components/font-awesome/fonts/**',
    { base: 'bower_components/font-awesome' }
  )
  .pipe(gulp.dest('assets'))
);

gulp.task('build', cb => runSequence('build:dev', ['build:prod', 'build:copy'], cb));

gulp.task('default', cb => runSequence('develop', 'build:dev', 'watch', cb));
