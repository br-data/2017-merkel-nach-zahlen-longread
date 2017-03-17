document.addEventListener('DOMContentLoaded', init);
//window.addEventListener('load', init);

function init() {

  var timeout;

  // Find all draw areas
  var $draw = document.getElementsByClassName('draw');
  var $d = [];

  if ($draw) {

    for (var i = 0; i < $draw.length; i++) {

      var d = new draw({nodeId: $draw[i].id});

      d.init();
      $d.push(d);
    }
  }

  window.onresize = function () {

    clearTimeout(timeout);
    timeout = setTimeout(function () {

    for (var i = 0; i < $d.length; i++) {

      $d[i].scale();
    }
    }, 200);
  };

  window.onorientationchange = function () {

    clearTimeout(timeout);
    timeout = setTimeout(function () {

    for (var i = 0; i < $d.length; i++) {

      $d[i].scale();
    }
    }, 200);
  };

  navigation.init();
}
