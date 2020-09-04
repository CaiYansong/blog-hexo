const { deepMerge, stripHTML } = require('hexo-util');

hexo.config.search = deepMerge({
  path: 'search.xml',
  field: 'post'
}, hexo.config.search);

// 移除 hexo 标签，如 {% xxx %}
const stripHexoTag = (str) => str.replace(/\{%[\S\s]+?%\}/mg, '');

// 移除 代码，如 ` ` ` xxx ` ` `
const stripCode = (str) => str.replace(/```[\S\s]+?```/mg, '');

// 移除 换行符，如 \n\n
const stripLineChar = (str) => str.replace(/[\r\n]+?/mg, '');

// 移除 style 标签内容，如 < style>xxxx</>
const stripStyle = (str) => str.replace(/<style.*?>.+<\/style>/img, '');

// 移除 script 标签内容，如 <script>xxxx</script>
const stripScript = (str) => str.replace(/<script.*?>.+<\/script>/img, '');

// 移除 超链接，如 [github](https:www.github.com/xxx)
const stripUrl = (str) => str.replace(/(\[.+?\])\((http)?s?:[^)]+?\)/img, '$1');

// 移除特殊字符串
const stripSpecialString = (str) => (
  stripUrl(
    stripCode(
      stripHexoTag(
        stripHTML(
          stripScript(
            stripStyle(
              stripLineChar(str)
            )
          )
        )
      )
    )
  )
);

hexo.extend.generator.register('json', function (locals) {
  var config = this.config;
  var searchConfig = config.search;
  var searchField = searchConfig.field;
  var content = searchConfig.content;

  var posts, pages;

  if (searchField.trim() != '') {
    searchField = searchField.trim();
    if (searchField == 'post') {
      posts = locals.posts.sort('-date');
    } else if (searchField == 'page') {
      pages = locals.pages;
    } else {
      posts = locals.posts.sort('-date');
      pages = locals.pages;
    }
  } else {
    posts = locals.posts.sort('-date');
  }

  var res = new Array();
  var index = 0;

  if (posts) {
    posts.each(function (post) {
      if (post.indexing != undefined && !post.indexing) return;
      var temp_post = new Object();
      if (post.title) {
        temp_post.title = post.title;
      }
      if (post.path) {
        temp_post.url = config.root + post.path;
      }

      if (post.content != false && post._content) {
        temp_post.content = stripSpecialString(post._content);
      }
      if (post.tags && post.tags.length > 0) {
        var tags = [];
        post.tags.forEach(function (tag) {
          tags.push(tag.name);
        });
        temp_post.tags = tags;
      }
      if (post.categories && post.categories.length > 0) {
        var categories = [];
        post.categories.forEach(function (cate) {
          categories.push(cate.name);
        });
        temp_post.categories = categories;
      }
      res[index] = temp_post;
      index += 1;
    });
  }
  if (pages) {
    pages.each(function (page) {
      if (page.indexing != undefined && !page.indexing) return;
      var temp_page = new Object()
      if (page.title) {
        temp_page.title = page.title;
      }
      if (page.path) {
        temp_page.url = config.root + page.path;
      }
      if (content != false && page._content) {
        temp_page.content = stripSpecialString(page._content);
      }
      if (page.tags && page.tags.length > 0) {
        var tags = new Array();
        var tag_index = 0;
        page.tags.each(function (tag) {
          tags[tag_index] = tag.name;
        });
        temp_page.tags = tags;
      }
      if (page.categories && page.categories.length > 0) {
        temp_page.categories = [];
        (page.categories.each || page.categories.forEach)(function (item) {
          temp_page.categories.push(item);
        });
      }
      res[index] = temp_page;
      index += 1;
    });
  }

  var json = JSON.stringify(res);

  return {
    path: searchConfig.path,
    data: json
  };
});