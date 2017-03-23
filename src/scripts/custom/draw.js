var draw = function (options) {

  var container, svg, defs, filter, group, line, drag, clipRect, background;

  var x, xMin, xMax, xAxis, xAxisEl; // Years
  var y, yMin, yMax, yAxis, yAxisEl; // Values

  var data, definedData;
  var previousData, previousGroup, previousLine, previousDots, previousHighlight; // Schröder years
  var currentData, currentGroup, currentLine, currentDots, currentHighlight; // Merkel years
  var userData, userGroup, userLine, userDot, userHighlight; // User guess

  var state = {

    started: false,
    completed: false,
    evaluated: false,
    mobile: false
  };

  var width, height, margin = { bottom: 50, left: 5, right: 100, top: 20 };
  var breakpoint = 561;

  var electionYears = [1998, 2002, 2005, 2009, 2013];

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

    prepare();
  }

  function prepare() {

    container = document.getElementById(options.id);

    svg = d3.select(container).append('svg')
      .attr('version', '1.1')
      .attr('baseProfile', 'full')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
      .attr('xmlns:ev', 'http://www.w3.org/2001/xml-events');

    defs = svg.append('defs');

    filter = defs.append('filter')
      .attr('id', 'solid-' + options.id)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 1)
      .attr('height', 1);

    filter.append('feFlood')
      .attr('flood-color', 'white');

    filter.append('feComposite')
      .attr('in', 'SourceGraphic');

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

    userDot = userGroup.append('circle');

    userHighlight = userGroup.append('g');
    userHighlight.append('circle');
    userHighlight.append('text');

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

    previousHighlight = previousGroup.append('g');
    previousHighlight.append('circle');
    previousHighlight.append('text');

    drag = d3.behavior.drag()
      .on('drag', handleDrag);

    svg.call(drag);

    render();
  }

  function render() {

    state.mobile = window.innerWidth < breakpoint;

    margin.bottom = state.mobile ? 80 : 50;
    width = container.getBoundingClientRect().width - margin.left - margin.right;
    height = state.mobile ? 260 : 300;
    height = height - margin.top - margin.bottom;

    x.range([0, width]);
    y.range([height, 0]);

    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.bottom + margin.top);

    clipRect
      .attr('width', state.completed ? x(xMax) + margin.right : x(lastYear(previousData)))
      .attr('height', height);

    group
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    background
      .attr('width', width)
      .attr('height', height)
      .attr('cursor', 'pointer')
      .attr('fill', 'white');

    xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .tickSize(0)
      .tickPadding(10)
      .tickValues(electionYears)
      .tickFormat(function (d) { return d; });

    yAxis = d3.svg.axis()
      .scale(y)
      .orient('right')
      .ticks(6)
      .innerTickSize(-width)
      .outerTickSize(0)
      .tickPadding(10)
      .tickFormat(function (d, i) {

        return (i % 2) ? '' : pretty(d) + ' ' + data.format;
      });

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

    line
      .interpolate('linear')
      .x(year)
      .y(value);

    userGroup
      .attr('opacity', state.completed ? 1 : 0);

    userLine
      .attr('d', state.completed ? line(definedData) : '');

    userDot
      .attr('r', 4)
      .attr('cx', x(lastYear(currentData)))
      .attr('cy', state.completed ? y(lastValue(definedData)) : y(lastValue(previousData)));

    userHighlight
      .attr('transform', state.completed ? translate(currentData, definedData) : translate(currentData, previousData));

    userHighlight.select('circle')
      .attr('r', 4);

    userHighlight.select('text')
      .attr('dy', '5')
      .attr('dx', '10')
      .attr('text-anchor', 'start')
      .attr('filter', 'url(#solid-' + options.id + ')');

    currentLine.attr('d', line(currentData));

    currentDots
      .attr('r', 4)
      .attr('cx', year)
      .attr('cy', value);

    previousLine
      .attr('d', line(previousData));

    previousDots
      .attr('r', 4)
      .attr('cx', year)
      .attr('cy', value);

    previousHighlight
      .attr('transform', translate(previousData, previousData));

    previousHighlight.select('circle')
      .attr('r', 4)
      .call(pulse);

    previousHighlight.select('text')
      .text(pretty(lastValue(previousData)) + ' ' + data.format)
      .attr('dy', '-15')
      .attr('fill', 'black')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle');
  }

  function update() {

    definedData = userData.filter(function (d) {

      return d.value;
    });

    if (!state.started) {

      previousHighlight.select('circle')
        .call(noPulse);

      userGroup
        .attr('opacity', 1);

      userHighlight.select('circle')
        .call(pulse);

      state.started = true;
    }

    if (!state.completed) {

      userLine
        .attr('d', line(definedData));

      userDot
        .attr('cy', y(lastValue(definedData)));

      userHighlight
        .attr('transform', translate(currentData, definedData));

      userHighlight.select('text')
        .text(pretty(Math.round(lastValue(definedData))) + ' ' +  data.format);
    }

    if (lastValue(userData)) {

      clipRect
        .transition()
        .duration(1000)
        .attr('width', x(xMax) + margin.right);

      userHighlight.select('circle')
        .call(noPulse);

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

  function pulse(element) {

    (function repeat() {

      element
        .transition()
          .ease('quad')
          .duration(1000)
          .attr('r', 7)
        .transition()
          .ease('quad')
          .duration(800)
          .attr('r', 4)
        .each('end', repeat);
    })();
  }

  function noPulse(element) {

    (function repeat() {

      element
        .transition()
          .ease('quad')
          .duration(800)
          .attr('r', 4);
    })();
  }

  // Returns translate property for SVG transforms
  function translate(xArr, yArr) {

    return 'translate(' + x(lastYear(xArr)) + ',' +  y(lastValue(yArr)) +')';
  }

  // Add German decimal seperators to number
  function pretty(number) {

    var fragments = number.toString().split('.');
    return fragments[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (fragments[1] ? ',' + fragments[1] : '');
  }

  // Get x value for year
  function year(d) {

    return x(d.year);
  }

  // Get y value for value
  function value(d) {

    return y(d.value);
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
    prepare: prepare,
    render: render,
    update: update
  };
};
