var postcss = require('postcss'),
    cheerio = require('cheerio')

module.exports = postcss.plugin('cscopes', function (opts) {
  opts = opts || {}

  return function (css, result) {
    if (opts.html) {

      var $ = cheerio.load(opts.html, { decodeEntities: false })
      var classReplacesQueue = []

      $('[scoped]').each(function() {
        var parent = $(this)
        parent.find('*').each(function() {
          var el = $(this)
          var level = el.parents('[scoped]').length
          if (level == parent.parents('[scoped]').length + 1) {

            css.walkRules(function(rule) {
              rule.selectors.forEach(function(selector) {
                if (selector.indexOf(' ') != -1 && el.is(selector)) {

                  var searchParts = selector.split(/ +/)
                  var parentScopes = el.parents('[scoped]').toArray()

                  var validationEl = parentScopes.pop()
                  var validationInterval = [0, 0]
                  var validationLevel = 0
                  var firstHalf = ''

                  for (var i = 1, l = searchParts.length; i < l; i++) {

                    validationInterval[1] = i
                    if ($(validationEl).is( searchParts.slice(0, i).join(' ') )) {
                      if (validationLevel > 0) {
                        firstHalf += searchParts
                         .slice(...validationInterval).join(' ')
                         .replace(/(\.[^ .:]+?)/g, '$1_scope' + validationLevel)
                      } else {
                        firstHalf += searchParts
                         .slice(...validationInterval).join(' ')
                      }

                      firstHalf += ' '
                      validationLevel += 1
                      validationEl = parentScopes.pop()
                      validationInterval[0] = i
                    }
                    if (!validationEl) {
                      var newSelector = firstHalf + searchParts
                         .slice(i).join(' ')
                         .replace(/(\.[^ .:]+?)/g, '$1_scope' + level)

                      if (rule.selectors.indexOf(newSelector) == -1) {
                        rule.selector = rule.selector + ', ' + newSelector
                      }
                      break
                    }

                  }

                }
              })
            })

            var elClasses = el.attr('class').trim().split(/ +/)
            var newClasses = elClasses.map( c => c + '_scope' + level).join(' ')
            classReplacesQueue.push([el, newClasses])

          }
        })
      })

      classReplacesQueue.forEach( a => a[0].attr('class', a[1]))
      $('[scoped]').removeAttr('scoped')

      if (opts.getHTML) opts.getHTML($.html())
    }
  }

})