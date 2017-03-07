var marginals = (function () {

  'use strict';

  var BREAKPOINT = 840;

  var hasChanged = document.body.clientWidth <= BREAKPOINT;
  var isInline = false;

  var $marginals = document.getElementsByClassName('marginal');

  function init() {

    reorder();
  }

  function reorder() {

    var marginal, i;

    if (isInline && BREAKPOINT < document.body.clientWidth ||
      !isInline && BREAKPOINT >= document.body.clientWidth) {

      hasChanged = true;
    }

    if (hasChanged) {

      if (isInline) {

        for (i = 0; i < $marginals.length; i++) {

          marginal = $marginals[i];

          marginal.parentNode.insertBefore(marginal, marginal.previousElementSibling);
          isInline = false;
        }
      } else {

        for (i = 0; i < $marginals.length; i++) {

          marginal = $marginals[i];

          marginal.parentNode.insertBefore(marginal.nextElementSibling, marginal);
          isInline = true;
        }
      }

      hasChanged = false;
    }
  }

  // Export global functions
  return {
    init: init,
    reorder: reorder
  };
})();
