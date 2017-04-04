var draw = function (options) {

  var container, svg, defs, filter, pattern, group, labelGroup, coalitionGroup, line, drag, clipRect, background;

  var x, xMin, xMax, xAxis, xAxisGroup; // Years
  var y, yMin, yMax, yAxis, yAxisGroup; // Values

  var data, definedData;
  var firstHighlight;
  var previousData, previousGroup, previousLine, previousDots, previousHighlight; // Schröder years
  var currentData, currentGroup, currentLine, currentDots, currentHighlight; // Merkel years
  var userData, userGroup, userLine, userHighlight; // User guess

  var state = {

    started: false,
    completed: false,
    evaluated: false,
    mobile: false
  };

  var width, height, margin = { bottom: 30, left: 10, right: 10, top: 30 };
  var breakpoint = 561;

  var electionYears = [2002, 2005, 2009, 2013];

  var coalitionData = [
    {
      name: 'Schröder II',
      start: '2002',
      end: '2005',
      colors: ['red', 'green']
    },
    {
      name: 'Merkel I',
      start: '2005',
      end: '2009',
      colors: ['black', 'red']
    },
    {
      name: 'Merkel II',
      start: '2009',
      end: '2013',
      colors: ['black', 'yellow']
    },
    {
      name: 'Merkel III',
      start: '2013',
      end: '2017',
      colors: ['black', 'red']
    }
  ];

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
    yMax = data.max;
    // yMax = d3.max(data.values, function (d) { return d.value; }) * 1.5;

    xMin = d3.min(data.values, function (d) { return d.year; });
    xMax = d3.max(data.values, function (d) { return d.year; });

    x = d3.scale.linear()
      .domain([xMin, xMax]);

    y = d3.scale.linear()
      .domain([yMin, yMax]);

    line = d3.svg.line();

    group = svg.append('g');

    background = group.append('rect')
      .attr('class', 'background');

    xAxisGroup = group.append('g')
      .attr('class', 'x axis');

    yAxisGroup = group.append('g')
      .attr('class', 'y axis');

    coalitionGroup = xAxisGroup.append('g')
        .attr('class', 'coalitions')
      .selectAll('g')
        .data(coalitionData)
        .enter()
      .append('g');

    coalitionGroup.selectAll('rect')
        .data(function (d) { return d.colors; })
        .enter()
      .append('rect');

    labelGroup = group.append('g')
      .attr('class', 'label group');

    userGroup = group.append('g')
      .attr('class', 'user group');

    userLine = userGroup.append('path');

    userHighlight = userGroup.append('g')
      .attr('class', 'user highlight');

    userHighlight.append('circle')
      .attr('class', 'pulse');

    userHighlight.append('text');

    currentGroup = group.append('g')
      .attr('class', 'current group')
      .attr('clip-path', 'url(#clip-' + options.id + ')');

    currentLine = currentGroup.append('path');

    currentDots = currentGroup.selectAll('dot')
        .data(currentData)
        .enter()
      .append('circle');

    currentHighlight = currentGroup.append('g')
      .attr('class', 'current highlight');

    currentHighlight.append('circle');

    currentHighlight.append('text');

    previousGroup = group.append('g')
      .attr('class', 'previous group');

    previousLine = previousGroup.append('path');

    previousDots = previousGroup.selectAll('dot')
        .data(previousData)
        .enter()
      .append('circle');

    previousHighlight = previousGroup.append('g')
      .attr('class', 'previous highlight');

    previousHighlight.append('circle')
      .attr('class', 'pulse');

    previousHighlight.append('text');

    firstHighlight = previousGroup.append('g')
      .attr('class', 'first highlight');

    firstHighlight.append('text');

    drag = d3.behavior.drag()
      .on('drag', handleDrag);

    svg.call(drag);

    render();
  }

  function render() {

    state.mobile = window.innerWidth < breakpoint;

    margin.bottom = state.mobile ? (margin.bottom * 3) : margin.bottom;
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

    // @todo Is this necessary?
    group
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    background
      .attr('width', width)
      .attr('height', height);

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
      .tickFormat('');
      //.tickFormat(function (d, i) { return (i % 2) ? '' : pretty(d); });

    xAxisGroup
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
      .selectAll('text')
        .attr('dx', state.mobile ? '-10px' : 0)
        .attr('dy', state.mobile ? '0' : '12px')
        .attr('transform', state.mobile ? 'rotate(-90)' : 'rotate(0)')
        .style('text-anchor', state.mobile ? 'end' : 'start');

    xAxisGroup.selectAll('.tick')
      .each(function () {

        var tick = d3.select(this),
          text = tick.select('text'),
          bBox = text.node().getBBox();

        tick.selectAll('rect').remove();

        tick.insert('rect', ':first-child')
          .attr('x', bBox.x - 3)
          .attr('y', bBox.y - 3)
          .attr('height', bBox.height + 6)
          .attr('width', bBox.width + 6)
          .style('fill', 'white');
      });

    yAxisGroup
      .attr('transform', 'translate(' + width + ',0)')
      .call(yAxis);

    coalitionGroup
      .attr('transform', function (d) {
        return 'translate(' + x(d.start) + ',13)';
      })
      .attr('width', function (d) { return x(d.end) - x(d.start); })
      .attr('height', 3)
      .attr('fill', function (d) { return d.colors[0]; });

    coalitionGroup.selectAll('rect')
      .attr('y', function (d, i) { return i * 5; })
      .attr('width', function () {
        var data = d3.select(this.parentNode).datum();
        return x(data.end) - x(data.start);
      })
      .attr('height', 3)
      .attr('fill', function (d) { return d; });

    // @todo Move generic attributes to prepare()
    labelGroup
      .attr('transform', 'translate(0,' + (height - 20) +')');

    labelGroup
      .append('text')
      .attr('x', middleYear(previousData))
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2001a')
      .text('SCHRÖDER');

    labelGroup
      .append('text')
      .attr('x', middleYear(currentData))
      .attr('text-anchor', 'middle')
      .text('MERKEL');

    line
      .interpolate('linear')
      .x(year)
      .y(value);

    userGroup
      .attr('opacity', state.completed ? 1 : 0);

    userLine
      .attr('d', state.completed ? line(definedData) : '');

    userHighlight
      .attr('transform', state.completed ? translate(currentData, definedData) : translate(currentData, previousData));

    userHighlight.select('circle')
      .attr('r', 4);

    userHighlight.select('text')
      // .attr('filter', 'url(#solid-' + options.id + ')')
      .attr('dy', '-15')
      .attr('fill', '#888899')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle');

    currentLine.attr('d', line(currentData));

    currentDots
      .attr('r', 4)
      .attr('cx', year)
      .attr('cy', value);

    currentHighlight
      .attr('transform', translate(currentData, currentData));

    currentHighlight.select('circle');

    currentHighlight.select('text')
      .text(pretty(lastValue(currentData)))
      .attr('dy', '-15')
      .attr('fill', 'black')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle');

    previousLine
      .attr('d', line(previousData));

    previousDots
      .attr('r', 4)
      .attr('cx', year)
      .attr('cy', value);

    previousHighlight
      .attr('transform', translate(previousData, previousData));

    previousHighlight.select('circle')
      .call(pulse);

    previousHighlight.select('text')
      .text(pretty(lastValue(previousData)))
      .attr('dy', '-15')
      .attr('fill', '#e2001a')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle');

    firstHighlight
      .attr('transform', 'translate(' + year(previousData[0]) + ',' +  value(previousData[0]) +')');

    firstHighlight.select('text')
      .text(pretty(previousData[0].value))
      .attr('dy', '-15')
      .attr('fill', '#e2001a')
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

      // userDot
      //   .attr('cy', y(lastValue(definedData)));

      userHighlight
        //.attr('transform', translate(currentData, definedData));
        .attr('transform', translate(definedData, definedData));

      userHighlight.select('text')
        .text(pretty(lastValue(definedData)));
    }

    if (lastValue(userData)) {

      clipRect
        .transition()
          .duration(1000)
          .attr('width', x(xMax) + margin.right);

      userHighlight.select('circle')
        .call(noPulse);

      userHighlight.select('text')
        .text('');

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

  function radiate(element) {

    (function repeat() {

      element
        .transition()
          .duration(0)
          .attr('stroke-width', 4)
          .attr('r', 0)
        .transition()
          .duration(1500)
          .attr('stroke-width', 0)
          .attr('r', 12)
          .ease('sine')
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

    var string;

    number = number / data.factor;
    number = Math.round(number * data.precision) / data.precision;

    string = number.toString().split('.');
    string = string[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (string[1] ? ',' + string[1] : '');

    string = string + ' ' + data.unit;

    return string;
  }

  // Get x value for year
  function year(d) {

    return x(d.year);
  }

  // Get y value for value
  function value(d) {

    return y(d.value);
  }

  // Get value from last object in an array
  function lastValue(objArr) {

    return objArr[objArr.length - 1].value;
  }

  // Get year from last object in an array
  function lastYear(objArr) {

    return objArr[objArr.length - 1].year;
  }

  // Get x value for the year between the first and last year
  function middleYear(objArr) {

    var first = firstYear(objArr);
    var last = lastYear(objArr);

    return x(((last - first) / 2) + first);
  }

  function firstYear(objArr) {

    return objArr[0].year;
  }

  function dashcase(string) {

    string = string.replace(/\s+/g, '-')
      .toLowerCase()
      .replace('ä', 'ae')
      .replace('ö', 'oe')
      .replace('ü', 'ue')
      .replace('ß', 'ss')
      .replace(/[^a-z0-9-]/g, '');

    return string;
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
