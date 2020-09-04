// 获取搜索文件
const getSearchFile = function () {
  return new Promise((resolve, reject) => {
    if (getSearchFile.ret) {
      return resolve(getSearchFile.ret);
    }
    const path = '/search.json';
    $.ajax({
      url: path,
      dataType: 'json',
      success: function (data) {
        getSearchFile.ret = data;
        resolve(getSearchFile.ret);
      },
      error: function () {
        resolve(null);
      },
    });
  });
};

// 获取搜搜结果
const getSearchResult = (key) => {
  const keywords = key.toLowerCase().split(/[\s\-]+/);
  return getSearchFile().then(data => {
    if (!data) {
      return '';
    }
    if (Object.prototype.toString.call(data) === '[object Object]') {
      data = data.data;
    }

    let str = '<ul class="search-result-list">';
    const beforeLength = 10; // content 关键词之前显示数量
    const contentLength = 30; // content 显示长度
    data.forEach(function ({ title = 'Untitled', content = '', url = '' }) {
      title = title.trim().toLowerCase();
      content = content.trim().toLowerCase().replace(/<[^>]+>/g, '');
      let isMatch = true;
      let indexTitle = -1;
      let indexContent = -1;
      let firstOccur = -1;
      keywords.forEach(function (wd, i) {
        indexTitle = title.indexOf(wd);
        indexContent = content.indexOf(wd);

        if (indexTitle < 0 && indexContent < 0) {
          isMatch = false;
        } else {
          if (indexContent < 0) {
            indexContent = 0;
          }
          if (i == 0) {
            firstOccur = indexContent;
          }
        }
      });

      if (isMatch && content) {
        str += '<li class="search-result-item"><a href=' + url + ' class="search-result-title" target="_blank">' + title + '</a>';
        if (firstOccur >= 0) {
          let start = Math.max(firstOccur - beforeLength, 0);

          let match_content = content.substr(start, contentLength);

          // highlight all keywords
          keywords.forEach(function (wd) {
            const reg = new RegExp(wd, 'gi');
            match_content = match_content.replace(reg, '<em class="search-wd">' + wd + '</em>');
          });

          str += '<p class="search-result-content">' + match_content + '...</p>'
        }
        str += '</li>';
      }
    });
    str += '</ul>';
    if (str.indexOf('</li>') === -1) {
      return '';
    }
    return str;
  });
};

const searchEvent = () => {
  const $resultContent = $('#js_site_search_result');
  $('#js_site_search_input').on('input', function () {
    const val = $(this).val().trim();
    $resultContent.html('');
    if (val.length <= 0) {
      return;
    }
    $resultContent.html('<div><span class="local-search-empty">正在载入索引文件，请稍后……<span></div>');
    getSearchResult(val).then(ret => {
      if (!ret) {
        return $resultContent.html('<div><span class="local-search-empty">没有找到内容，请尝试更换检索词。<span></div>');
      }
      $resultContent.html(ret);
    });
  });
  $('#js_site_search_input').on('blur', function () {
    setTimeout(() => {
      // 失去焦点清除输入框的数据
      $('#js_site_search_input').val('');
      $('#js_site_search_result').html('');
    }, 100)
  });
};

function initSearchInput() {
  searchEvent();
  return;

  // Search input
  var $searchWrap = $('#search-form-wrap'),
    isSearchAnim = false,
    searchAnimDuration = 200;

  var startSearchAnim = function () {
    isSearchAnim = true;
  };

  var stopSearchAnim = function (callback) {
    setTimeout(function () {
      isSearchAnim = false;
      callback && callback();
    }, searchAnimDuration);
  };

  $('#nav-search-btn').on('click', function () {
    if (isSearchAnim) return;

    startSearchAnim();
    $searchWrap.addClass('on');
    stopSearchAnim(function () {
      $('.search-form-input').focus();
    });
  });

  $('.search-form-input').on('blur', function () {
    startSearchAnim();
    $searchWrap.removeClass('on');
    stopSearchAnim();
    // 失去焦点清除输入框的数据
    $('#js_site_search_input').val('');
    $('#js_site_search_result').html('');
  });
}