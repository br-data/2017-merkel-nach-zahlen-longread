var draw = function (options) {

  var container, svg, defs, filter, group, labelGroup, coalitionGroup, line, drag, clipRect, background;

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

  var button = document.querySelector('button[data-id=' + options.id + ']');
  button = d3.select(button);
  var paragraph = document.querySelector('p[data-id=' + options.id + ']');
  paragraph = d3.select(paragraph);

  var width, height, margin = { bottom: 30, left: 10, right: 10, top: 30 };
  var breakpoint = 561;

  var electionYears = [2002, 2005, 2009, 2013];

  var coalitionData = [
    {
      name: 'Schröder II',
      startYear: 2002,
      endYear: 2005,
      colors: ['#e2001a', 'green']
    },
    {
      name: 'Merkel I',
      startYear: 2005,
      endYear: 2009,
      colors: ['black', '#e2001a']
    },
    {
      name: 'Merkel II',
      startYear: 2009,
      endYear: 2013,
      colors: ['black', 'yellow']
    },
    {
      name: 'Merkel III',
      startYear: 2013,
      endYear: 2017,
      colors: ['black', '#e2001a']
    }
  ];

  var labelData = [
    {
      name: 'SCHRÖDER',
      color: '#e2001a',
      getYear: function () { return middleYear(previousData); },
      getValue: function () { return height - 20; }
    },
    {
      name: 'MERKEL',
      color: 'black',
      getYear: function () { return middleYear(currentData); },
      getValue: function () { return height - 20; }
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

    coalitionData = coalitionData.map(function (d) {

      d.values = [];

      d.colors.forEach(function (color) {

        d.values.push({
          name: d.name,
          startYear: d.startYear,
          endYear: d.endYear,
          colors: d.colors,
          color: color
        });
      });

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

    line = d3.svg.line()
      .interpolate('linear')
      .x(year)
      .y(value);

    group = svg.append('g');

    background = group.append('rect')
      .attr('class', 'background');

    coalitionGroup = group.append('g')
        .attr('class', 'coalitions')
      .selectAll('g')
        .data(coalitionData)
        .enter()
      .append('g');

    coalitionGroup.selectAll('path')
        .data(function (d) { return d.values; })
        .enter()
      .append('path');

    xAxisGroup = group.append('g')
      .attr('class', 'x axis');

    yAxisGroup = group.append('g')
      .attr('class', 'y axis');

    labelGroup = group.append('g')
        .attr('class', 'label group')
      .selectAll('.label')
        .data(labelData)
        .enter()
      .append('g');

    labelGroup
      .append('text');

    userGroup = group.append('g')
      .attr('class', 'user group');

    userLine = userGroup.append('path');

    userHighlight = group.append('g')
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

    currentHighlight = group.append('g')
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

    previousHighlight = group.append('g')
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

    width = container.getBoundingClientRect().width - margin.left - margin.right;
    height = 300;
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
        .style('text-anchor', state.mobile ? 'end' : 'middle');

    xAxisGroup.selectAll('.tick')
      .each(addBackground);

    yAxisGroup
      .attr('transform', 'translate(' + width + ',0)')
      .call(yAxis);

    coalitionGroup
      .attr('class', function (d) { return dashcase(d.name); })
      .attr('transform', 'translate(0,17)');

    coalitionGroup.selectAll('path')
      .attr('d', coalitionsLine)
      .attr('fill', 0)
      .attr('stroke', function (d) { return d.color; })
      .attr('stroke-width', 3);

    labelGroup
        .attr('transform', function (d) { return 'translate(' + d.getYear() + ',' + d.getValue() +')'; })
      .selectAll('text')
        .text(function (d) { return d.name; })
        .attr('fill', function (d) { return d.color; })
        .attr('text-anchor', 'middle');

    userGroup
      .attr('opacity', state.completed ? 1 : 0);

    userLine
      .attr('d', state.completed ? line(definedData) : '');

    userHighlight
      .attr('transform', state.completed ? translate(currentData, definedData) : translate(currentData, previousData))
      .style('opacity', state.completed ? 1 : 0);

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
      .attr('transform', translate(currentData, currentData))
      .style('opacity', state.completed ? 1 : 0);

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

      userHighlight
        .style('opacity', '1');

      userHighlight.select('circle')
        .call(pulse);

      state.started = true;
    }

    if (!state.completed) {

      userLine
        .attr('d', line(definedData));

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

      previousHighlight.select('circle')
        .call(noPulse);

      userHighlight.select('circle')
        .call(noPulse);

      currentHighlight
        .attr('transform', smartTranslate(currentData, currentData, userData));

      currentHighlight
        .transition()
          .delay(1000)
          .style('opacity', 1);

      paragraph
        .transition()
          .delay(1000)
          .style('opacity', 1);

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

  function smartTranslate(xArr, yArr1, yArr2) {

    var yValue;

    if (lastValue(yArr2) > lastValue(yArr1)) {

      yValue = y(lastValue(yArr1)) + 40;
    } else {

      yValue = y(lastValue(yArr1));
    }

    return 'translate(' + x(lastYear(xArr)) + ',' +  yValue +')';
  }

  function coalitionsLine(d, i) {

    var count = d.colors.length;
    var interval = (d.endYear - d.startYear) / count;

    var startYear = d.startYear + (i * interval);
    var endYear = d.startYear + ((i + 1) * interval);

    return line([
      { year: startYear, value: 0 },
      { year: endYear, value: 0 }
    ]);
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

  function addBackground() {

    var container = d3.select(this);
    var text = container.select('text');
    var bBox = text.node().getBBox();

    container.selectAll('rect').remove();

    container.insert('rect', ':first-child')
      .attr('x', bBox.x - 3)
      .attr('y', bBox.y - 3)
      .attr('height', bBox.height + 6)
      .attr('width', bBox.width + 6)
      .attr('transform', state.mobile ? 'rotate(-90)' : 'rotate(0)')
      .style('fill', 'white');
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
