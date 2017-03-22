document.addEventListener('DOMContentLoaded', init, false);

function init() {

  var timeout, drawElements, drawInstances = [];

  // Initialize navigation handler
  navigation.init();

  // Find all draw areas
  drawElements = document.getElementsByClassName('draw');

  // Get data
  d3.json('data/data.json', handleData);

  function handleData(error, data) {

    if (error) { throw error; }

    if (drawElements) {

      for (var i = 0; i < drawElements.length; i++) {

        var newDraw = new draw({ id: drawElements[i].id });

        // Initialize DrawIt
        newDraw.init(data);
        drawInstances.push(newDraw);
      }
    }

    window.addEventListener('resize', handleResize, false);
  }

  function handleResize() {

    clearTimeout(timeout);

    timeout = setTimeout(function () {

      for (var i = 0; i < drawInstances.length; i++) {

        drawInstances[i].render();
        drawInstances[i].update();
      }
    }, 200);
  }
}
