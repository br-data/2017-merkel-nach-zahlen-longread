var navigation = (function () {

  'use strict';

  var SCROLLDELAY = 100;
  var TRIGGER = -20;
  var isVisible = false;

  var $navbar;

  function init() {

    $navbar = document.getElementsByClassName('navigation')[0];

    scrollListener();
    navbarOpacity();
  }

  function scrollListener() {

    var isScrolling = false;

    window.onscroll = function () {

      navbarOpacity();
      isScrolling = true;
    };

    setInterval(function () {

      if (isScrolling) {

        isScrolling = false;
      }
    }, SCROLLDELAY);
  }

  function navbarOpacity() {

    var elementOffset = $navbar.offsetTop;
    var distance = $navbar.offsetTop - window.pageYOffset;
    var pageOffset = window.pageYOffset;

    if ((distance < TRIGGER) && !isVisible) {

      $navbar.classList.remove('hidden');
      isVisible = true;
    } else if (isVisible && (pageOffset <= elementOffset)) {

      $navbar.classList.add('hidden');
      isVisible = false;
    }
  }

  // Export global functions
  return {
    init: init
  };
})();
