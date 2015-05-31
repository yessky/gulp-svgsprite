gulp-svgsprite
=============

this project is forked from [gulp-svgstore](https://github.com/w0rm/gulp-svgstore). I make it to support "metaAttrs" and "cleanAttrs". so that we can extract svg icon's metadata or clean useless attributes. 

## Notes

added config option "metaAttrs" for extracting icon's metadata. it's helpful to generate correspondent css of icon's default style.

added config option "cleanAttrs" for remove useless attributes, it's helpful to customize the icon style and decrease file size.

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
