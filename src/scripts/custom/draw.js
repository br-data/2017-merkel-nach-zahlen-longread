var draw = function (options) {

  var container, svg, defs, group, line, drag, clipRect, background;

  var x, xMin, xMax, xAxis, xAxisEl; // Years
  var y, yMin, yMax, yAxis, yAxisEl; // Values

  var data;
  var previousData, previousGroup, previousLine, previousDots; // Schröder years
  var currentData, currentGroup, currentLine, currentDots; // Merkel years
  var userData, userGroup, userLine, userDot; // User guess

  var state = {

    started: false,
    completed: false,
    evaluated: false,
    mobile: false
  };

  var width, height, margin = { bottom: 50, left: 5, right: 100, top: 20 };
  var breakpoint = 561;

  function init(json) {

    data = json.filter(function (d) { return d.name == options.id; })[0];

    previousData = data.values.filter(function (d) {

      return d.year <= 2005;
    });

    currentData = data.values.filter(function (d) {

      return d.year >= 2005;
    });

    userData = clone(currentData).map(function (d, i) {

      d.value = i ? undefined : d.value;

      return d;
    });

    render();
  }

  function render() {

    container = document.getElementById(options.id);

    svg = d3.select(container).append('svg')
      .attr('version', '1.1')
      .attr('baseProfile', 'full')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
      .attr('xmlns:ev', 'http://www.w3.org/2001/xml-events');

    defs = svg.append('defs');

    clipRect = defs.append('clipPath')
        .attr('id', 'clip-' + options.id)
      .append('rect');

    yMin = 0;
    yMax = d3.max(data.values, function (d) { return d.value; }) * 1.5;

    xMin = d3.min(data.values, function (d) { return d.year; });
    xMax = d3.max(data.values, function (d) { return d.year; });

    x = d3.scale.linear()
      .domain([xMin, xMax]);

    y = d3.scale.linear()
      .domain([yMin, yMax]);

    line = d3.svg.line();

    group = svg.append('g')
      .attr('cursor', 'pointer');

    background = group.append('rect')
      .attr('class', 'background');

    xAxisEl = group.append('g')
      .attr('class', 'x axis');

    yAxisEl = group.append('g')
      .attr('class', 'y axis');

    userGroup = group.append('g')
      .attr('class', 'user');

    userLine = userGroup.append('path');

    userDot = userGroup.append('circle')
      .style('opacity', 0);

    currentGroup = group.append('g')
      .attr('class', 'current')
      .attr('clip-path', 'url(#clip-' + options.id + ')');

    currentLine = currentGroup.append('path');

    currentDots = currentGroup.selectAll('dot')
        .data(currentData)
        .enter()
      .append('circle');

    previousGroup = group.append('g')
      .attr('class', 'previous');

    previousLine = previousGroup.append('path');

    previousDots = previousGroup.selectAll('dot')
        .data(previousData)
        .enter()
      .append('circle');

    drag = d3.behavior.drag()
      .on('drag', handleDrag);

    svg.call(drag);

    scale();
  }

  function scale() {

    state.mobile = window.innerWidth < breakpoint;

    margin.bottom = state.mobile ? 80 : 50;
    width = container.getBoundingClientRect().width - margin.left - margin.right;
    height = state.mobile ? 260 : 300;
    height = height - margin.top - margin.bottom;

    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.bottom + margin.top);

    group
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    background
      .attr('width', width)
      .attr('height', height)
      .attr('cursor', 'pointer')
      .attr('stroke', 'none')
      .attr('fill', 'white');

    x.range([0, width]);
    y.range([height, 0]);

    xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .tickSize(0)
      .tickFormat(function (d) { return  d; });

    yAxis = d3.svg.axis()
      .scale(y)
      .orient('right')
      .ticks(6)
      .innerTickSize(-width)
      .outerTickSize(0)
      .tickPadding(10)
      .tickFormat(function (d) { return pretty(d) + ' ' + data.format; });

    xAxisEl
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
      .selectAll('text')
        .attr('dx', state.mobile ? '-10px' : 0)
        .attr('dy', state.mobile ? '0' : '12px')
        .attr('transform', state.mobile ? 'rotate(-90)' : 'rotate(0)')
        .style('text-anchor', state.mobile ? 'end' : 'start');

    yAxisEl
      .attr('transform', 'translate(' + width + ',0)')
      .call(yAxis);

    clipRect
      .attr('width', function () {

        if (state.completed) {

          return x(xMax) + margin.right;
        }  else {

          return x(lastYear(previousData));
        }
      })
      .attr('height', height);

    line
      .interpolate('linear')
      .x(function (d) { return x(d.year); })
      .y(function (d) { return y(d.value); });

    currentLine.attr('d', line(currentData));

    currentDots
      .attr('r', 4)
      .attr('cx', function (d) { return x(d.year); })
      .attr('cy', function (d) { return y(d.value); });

    previousLine
      .attr('d', line(previousData));

    previousDots
      .attr('r', 4)
      .attr('cx', function (d) { return x(d.year); })
      .attr('cy', function (d) { return y(d.value); });

    update();
  }

  function update() {

    var definedData = userData.filter(function (d) {

      return d.value;
    });

    userLine
      .attr('d', function () {

        return line(userData.filter(function (d) {

          return d.value;
        }));
      });

    userDot
      .attr('r', 4)
      .attr('cx', x(lastYear(currentData)))
      .attr('cy', y(lastValue(definedData)))
      .style('opacity', 1);

    if (!state.completed && lastValue(userData)) {

      clipRect
        .transition()
        .duration(1000)
        .attr('width', x(xMax) + margin.right);

      state.completed = true;
    }
  }

  function handleDrag() {

    var pos = d3.mouse(this);
    var year = Math.max(2006, Math.min(2017, x.invert(pos[0])));
    var value = Math.max(0, Math.min(y.domain()[1], y.invert(pos[1])));

    userData.forEach(function (d) {

      if (Math.abs(d.year - year) < 0.5) {

        d.value = value;
      }
    });

    update();
  }

  function pretty(number) {

    var fragments = number.toString().split('.');
    return fragments[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (fragments[1] ? ',' + fragments[1] : '');
  }

  // Get value property from last object in an array
  function lastValue(objArr) {

    return objArr[objArr.length - 1].value;
  }

  // Get year property from last object in an array
  function lastYear(objArr) {

    return objArr[objArr.length - 1].year;
  }

  // Clone a JavaScript object. Doesn't work for functions.
  function clone(object) {

    return JSON.parse(JSON.stringify(object));
  }

  return {

    init: init,
    render: render,
    scale: scale
  };
};
