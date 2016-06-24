var postcss = require('postcss');
var cscopes = require('./postcss-cscopes');

console.log(postcss([
  cscopes({
    html: `
      <div class="a">
        <div class="b">foobar</div>
      </div>
      <div scoped="scoped" class="a">
        <div class="b">foobar</div>
      </div>
      <div scoped="scoped" class="a">
        <div scoped="scoped" class="b">
          <div scoped="scoped" class="b">
            <div class="b">foobar</div>
            <div class="b c">foobar</div>
          </div>
        </div>
      </div>`,
    getHTML: function (html) {
      console.log(html)
    }
  })
]).process(`
  .b {foo: bar;}
  .a .b {foo: bar;}
  .a .b .b {foo: bar;}
  .a .b .b .b {foo: bar;}`
).css)