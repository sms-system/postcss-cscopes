var postcss = require('postcss');
var cscopes = require('./postcss-cscopes');

console.log(postcss([
  cscopes({
    html: `
      <div class="c m">.a</div>
      <div class="a">
        <div class="c m">.a</div>
      </div>
      <div scoped="scoped" class="b">
        <div global="m" class="c m">.a</div>
      </div>`,
    getHTML: function (html) {
      console.log(html)
    }
  })
]).process(`
  .c {
    color: #f00;
  }
  .m {
    margin: 10px;
  }
  .a .c, .b .c {
    background: #fdd;
  }
  .a .c:hover, .b .c:hover {
    background: #f00;
  }`
).css)
