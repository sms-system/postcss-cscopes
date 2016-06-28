var postcss = require('postcss'),
    cheerio = require('cheerio')

module.exports = postcss.plugin('scopes', function (opts) {
  opts = opts || {}

  return function (css, result) {
    if (opts.html) {

      var $ = cheerio.load(opts.html, { decodeEntities: false })
      var classReplacesQueue = []

      var globalPatterns = opts.globalPatterns || []

      $('[scoped]').each(function() {
        var parent = $(this)
        parent.find('*').each(function() {
          var el = $(this)
          var level = el.parents('[scoped]').length
          if (level == parent.parents('[scoped]').length + 1) {

            var globalClasses = (el.attr('global')||'').split(/ +/)
            el.removeAttr('global')

            var elClasses = el.attr('class')
            var newClasses
            if (elClasses) {
              elClasses = elClasses
                .split(/ +/)
              globalClasses.push(
                ...elClasses.filter(c =>
                  !globalPatterns.every(p => !(new RegExp(p)).test(c))
                )
              )
              elClasses = elClasses
                .filter(c => globalClasses.indexOf(c) == -1)
              newClasses = elClasses
                .map( c => c + '_scope' + level )
                .concat(globalClasses)
                .filter(c => c)
                .join(' ')
            } else {
              newClasses = globalClasses.join(' ')
            }
            classReplacesQueue.push([el, newClasses])

            css.walkRules(function(rule) {
              rule.selectors.forEach(function(selector) {
                searchSelector = selector.replace(/:[^ .,:]+/g, '')
                if (selector.indexOf(' ') != -1 && el.is(searchSelector)) {

                  var printParts   = selector.split(/ +/)
                  var searchParts  = searchSelector.split(/ +/)
                  var parentScopes = el.parents('[scoped]').toArray()

                  var validationEl = parentScopes.pop()
                  var validationInterval = [0, 0]
                  var validationLevel = 0
                  var firstHalf = ''

                  for (var i = 1, l = searchParts.length; i < l; i++) {

                    validationInterval[1] = i
                    if ($(validationEl).is( searchParts.slice(0, i).join(' ') )) {
                      if (validationLevel > 0) {
                        firstHalf += printParts
                         .slice(...validationInterval).join(' ')
                         .replace(/(\.[^ .,:]+)/g, '$1_scope' + validationLevel)
                      } else {
                        firstHalf += printParts
                         .slice(...validationInterval).join(' ')
                      }

                      firstHalf += ' '
                      validationLevel += 1
                      validationEl = parentScopes.pop()
                      validationInterval[0] = i
                    }
                    if (!validationEl) {
                      var newSelector = firstHalf + printParts
                         .slice(i).join(' ')
                         .replace(/(\.[^ .,:]+)/g, '$1_scope' + level)
                      if (rule.selectors.indexOf(newSelector) == -1) {
                        rule.selectors = rule.selectors.concat(newSelector)
                      }
                      break
                    }

                  }

                }
              })
            })

          }
        })
      })

      classReplacesQueue.forEach( a => {
        if (a[1]) a[0].attr('class', a[1])
      })
      $('[scoped]').removeAttr('scoped')

      if (opts.getHTML) opts.getHTML($.html())
    }
  }

})
