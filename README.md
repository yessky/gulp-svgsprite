gulp-svgsprite
=============

this project is forked from [gulp-svgstore](https://github.com/w0rm/gulp-svgstore). I make it to support "metaAttrs" and "cleanAttrs". 

"metaAttrs"[attribute array] - for extracting icons' meta data, I can control more, like generate correspondent css file based on the meta data.

"cleanAttrs"[attribute array] - for removing useless attributes or cleannig primitive attributes(so that I can use css to control color/width/height/stroke-with, etc).

## Example

following example shows how to genrates css file based on the extracted metadata.

you can define your own "spritecss" function to accomplish your task business.

for other examples or docs see [gulp-svgstore docs](https://github.com/w0rm/gulp-svgstore)

```javascript
gulp.task("svgsprite", function() {
	var spritecss = through2.obj(function(file, encoding, cb) {
	  var data = file.metadata;
	  var result = "";
	  var isMeasurable = {width: 1, height: 1};
	  for (var name in data) {
	  	var icon = data[name];
	  	if (result) {
	  		result += "\n";
	  	}
	  	result += "." + name + " { ";
	  	for (var p in icon) {
	  		var val = icon[p];
	  		result += p + ": " + (isMeasurable[p] ?  + val + "px" : val) + "; ";
	  	}
	  	result += "}";
	  }
	  var meta = new gutil.File({
		  path: '_icons.scss',
		  contents: new Buffer(result)
	  });
	  this.push(meta);
	  this.push(file);
	  cb();
  });
	return gulp.src("icons/*.svg")
		.pipe(rename({prefix: 'icon-'}))
		.pipe(svgmin())
		.pipe(svgsprite({
			inlineSvg: true
			, metaAttrs: ["width", "height", "fill"]
			, cleanAttrs: ["fill", "style"]
		}))
		.pipe(spritecss)
		.pipe(gulp.dest("./"));
});
```
