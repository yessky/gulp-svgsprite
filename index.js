var cheerio = require('cheerio')
var path = require('path')
var through2 = require('through2')
var gutil = require('gulp-util')

module.exports = function (config) {

  config = config || {}

  var isEmpty = true
  var fileName
  var inlineSvg = config.inlineSvg || false
  var metaAttrs = config.metaAttrs || false
  var ids = {}

  var resultSvg = '<svg xmlns="http://www.w3.org/2000/svg" ><defs/></svg>'
  if (!inlineSvg) {
    resultSvg =
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
      '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
      resultSvg
  }

  var $ = cheerio.load(resultSvg, { xmlMode: true })
  var $combinedSvg = $('svg')
  var $combinedDefs = $('defs')
  var metadata = {}

  return through2.obj(

    function transform (file, encoding, cb) {

      if (file.isStream()) {
        return cb(new gutil.PluginError('gulp-svgstore', 'Streams are not supported!'))
      }

      if (!file.cheerio) {
        file.cheerio = cheerio.load(file.contents.toString(), { xmlMode: true })
      }

      var $svg = file.cheerio('svg')
      var idAttr = path.basename(file.relative, path.extname(file.relative))
      var viewBoxAttr = $svg.attr('viewBox')
      var $symbol = $('<symbol/>')

      if (idAttr in ids) {
        return cb(new gutil.PluginError('gulp-svgstore', 'File name should be unique: ' + idAttr))
      }

      ids[idAttr] = true

      if (!fileName) {
        fileName = path.basename(file.base)
        if (fileName === '.' || !fileName) {
          fileName = 'svgstore.svg'
        } else {
          fileName = fileName.split(path.sep).shift() + '.svg'
        }
      }

      if (file && isEmpty) {
        isEmpty = false
      }

      var toString = Object.prototype.toString
      if (toString.call(metaAttrs) === "[object Array]" && metaAttrs.length > 0) {
        var firstPath = file.cheerio("path").first()
        var useSvg = {
          width: 1,
          height: 1
        }
        var nonattr = "@@non@@"
        var ret = {}
        ret[nonattr] = 1
        metaAttrs.forEach(function(attr, i) {
          if (useSvg[attr] && $svg.attr(attr)) {
            ret[attr] = $svg.attr(attr)
            delete ret[nonattr]
          } else if (firstPath.attr(attr)) {
            ret[attr] = firstPath.attr(attr)
            delete ret[nonattr]
          }
        })
        if (!ret[nonattr]) {
          if (!ret.name) {
            ret.name = idAttr
          }
          metadata[idAttr] = ret
        }
      }

      $symbol.attr('id', idAttr)
      if (viewBoxAttr) {
        $symbol.attr('viewBox', viewBoxAttr)
      }

      var $defs = file.cheerio('defs')
      if ($defs.length > 0) {
        $combinedDefs.append($defs.contents())
        $defs.remove()
      }

      $symbol.append($svg.contents())
      $combinedSvg.append($symbol)
      cb()
    }

  , function flush (cb) {
      if (isEmpty) return cb()
      if ($combinedDefs.contents().length === 0) {
        $combinedDefs.remove()
      }
      var file = new gutil.File({ path: fileName, contents: new Buffer($.xml()) })
      file.cheerio = $
      file.metadata = metadata
      this.push(file)
      cb()
    }
  )
}
