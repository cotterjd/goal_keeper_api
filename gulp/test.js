var gulp = require("gulp");
var debug = require("gulp-debug");
var mocha = require("gulp-mocha");

function test() {
  return (
    gulp
      .src("test/**/*.js")
      //   .pipe(debug())
      .pipe(mocha({ reporter: "spec", timeout: 10000 }))
      .on("error", console.log)
      .once("end", function() {
        process.exit();
      })
  );
}

gulp.task("test", test);
