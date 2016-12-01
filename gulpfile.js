var gulp        = require('gulp')
var aglio       = require('gulp-aglio')
var browserSync = require('browser-sync')
var watch       = require('gulp-watch')
var rimraf      = require('rimraf')
var runSequence = require('run-sequence')
var plumber     = require('gulp-plumber')

var $DEST = './build/'
var $SRC = './'
var path = {
    $SRC: $SRC,
    $DEST: $DEST,
    src: {
        md: [$SRC + "INTERFACE.md"]
    },
    dest: {
        html: $DEST
    }
}

gulp.task('clean', (cb) => {
    return rimraf(path.$DEST, cb)
})

gulp.task('aglio', () => {
    return gulp.src(path.src.md).pipe(aglio({
        template: 'default'
    })).pipe(plumber(

    )).pipe(gulp.dest(path.dest.html)).pipe(browserSync.reload({
        stream: true
    }))
})

gulp.task('browser-sync', () => {
    return browserSync.init(null, {
        server: path.$DEST,
        reloadDelay: 1000
    })
})

gulp.task('watch', () => {
    return watch(path.src.md, () => {
        return gulp.start(['aglio'])
    })
})

gulp.task('default', () => {
    return runSequence('clean', 'aglio', ['browser-sync', 'watch'])
})
