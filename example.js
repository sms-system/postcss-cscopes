var postcss = require('postcss');
var cscopes = require('./postcss-cscopes');

console.log(postcss([
  cscopes({
    html: `
      <div class="c">.a</div>
      <div class="a">
        <div class="c">.a</div>
      </div>
      <div scoped="scoped" class="b">
        <div class="c">.a</div>
      </div>`,
    getHTML: function (html) {
      console.log(html)
    }
  })
]).process(`
  .c {
    color: #f00;
    margin: 10px;
  }
  .a .c, .b .c {
    background: #f00;
    margin: 10px;
  }`
).css)
