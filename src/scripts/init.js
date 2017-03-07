document.addEventListener('DOMContentLoaded', init);
//window.addEventListener('load', init);

function init() {

  var $modal = document.getElementById('modal');
  var $modalButton = document.getElementById('modal-button');

  navigation.init();
  marginals.init();
  modal.init();

  // Bind modal button to open event
  $modalButton.addEventListener('click', function () {

    modal.open($modal);
  });

  arrow();
  resize();
}

function resize() {

  var timeout;

  window.onresize = function () {

    clearTimeout(timeout);
    timeout = setTimeout(function () {

      marginals.reorder();
    }, 200);
  };
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
