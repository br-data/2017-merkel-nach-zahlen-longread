document.addEventListener('DOMContentLoaded', init);
//window.addEventListener('load', init);

function init() {

  var timeout;

  var draw1 = new draw({nodeId: 'draw1', dataLink: 'data/data.csv'});

  draw1.init();
  navigation.init();

  window.onresize = function () {

    clearTimeout(timeout);
    timeout = setTimeout(function () {

      draw1.scale();
    }, 200);
  };

  window.onorientationchange = function () {

    clearTimeout(timeout);
    timeout = setTimeout(function () {

      draw1.scale();
    }, 200);
  };

  arrow();
}

function arrow() {

  var $arrow = document.getElementById('arrow');
  var $header = document.getElementById('header');

  $arrow.addEventListener('click', scrollTo);

  function scrollTo() {

    var offsetTop = $header.offsetHeight - 60;
    scroll.to(offsetTop, 750);
  }
}
