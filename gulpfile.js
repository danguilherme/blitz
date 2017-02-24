const gulp = require("gulp");
const concat = require("gulp-concat");
const watch = require('gulp-watch');
const uglify = require("gulp-uglify");
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');

const paths = {
  dist: 'dist/'
};

function getProjectFiles() {
  return [
    // essential modules
    "src/web2kony.js",
    "src/polyfills.js",
    "src/core.js",
    "src/utils.js",
    "src/logger.js",
    "src/events.js",
    "src/application.js",

    // optional modules
    "src/http.js",
    // "src/animation.js",
    "src/mvc.js",

    "src/**/*.js"
  ];
}

gulp.task('watch', () => {
  gulp.start('build');
  watch('src/**/*.js', () => {
    gulp.start('build');
  });
});

gulp.task('build', () => {
  return gulp
    .src(getProjectFiles())
    .pipe(plumber())
    .pipe(babel({
      // presets: ['es2015'],
      plugins: [
        [require("babel-plugin-check-es2015-constants")],
        [require('babel-plugin-transform-es2015-modules-commonjs'), {
          allowTopLevelThis: true
        }],
        [require("babel-plugin-transform-es2015-arrow-functions")],
        [require("babel-plugin-transform-es2015-block-scoped-functions")],
        [require("babel-plugin-transform-es2015-block-scoping")],
        [require("babel-plugin-transform-es2015-spread")],
        [require("babel-plugin-transform-es2015-template-literals")]
      ]
    }))
    .pipe(concat("blitz.js"))
    .pipe(uglify())
    .pipe(gulp.dest("dist"));
});

gulp.task('default', ['build']);
