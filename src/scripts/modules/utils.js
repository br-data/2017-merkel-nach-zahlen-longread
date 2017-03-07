var utils = (function () {

  function getJson(path, callback) {

    var httpRequest = new XMLHttpRequest();

    httpRequest.overrideMimeType('application/json');

    httpRequest.onreadystatechange = function() {

      if (httpRequest.readyState === 4) {

        if (httpRequest.status === 200) {

          if (callback) callback(JSON.parse(httpRequest.responseText));
        }
      }
    };

    httpRequest.open('GET', path);
    httpRequest.send();
  }

  function preventPageScoll(e) {

    var delta = e.wheelDelta || -e.detail;
    this.scrollTop += (delta < 0 ? 1 : -1) * 30;
    e.preventDefault();
  }

  function selectText() {

    var range;

    if (document.selection) {

      range = document.body.createTextRange();
      range.moveToElementText(this);
      range.select();
    } else if (window.getSelection) {

      range = document.createRange();
      range.selectNode(this);
      window.getSelection().addRange(range);
    }
  }

  return {
    getJson: getJson,
    preventPageScoll: preventPageScoll,
    selectText: selectText
  };
})();
