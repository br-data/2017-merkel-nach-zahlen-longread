var draw = function (options) {

  'use strict';

  var $config, $app, $state, $data;

  $config = {
    margin: { bottom: 30, left: 10, right: 10, top: 30 },
    height: 300,
    width: 658,
    breakpoint: 561
  };

  $app = {
    previous: {},
    current: {},
    user: {},
    labels: {},
    annotations: {}
  };

  $state = {
    started: false,
    completed: false,
    evaluated: false,
    mobile: false
  };

  $data = {};

  $data.elections = [2002, 2005, 2009, 2013, 2017];

  $data.coalitions = [
    {
      text: 'Schröder II',
      values: [{ year: 2002 }, { year: 2005 }],
      colors: ['#e2001a', '#20ac00']
    }, {
      text: 'Merkel I',
      values: [{ year: 2005 }, { year: 2009 }],
      colors: ['#000', '#e2001a']
    }, {
      text: 'Merkel II',
      values: [{ year: 2009 }, { year: 2013 }],
      colors: ['#000', '#f4e000']
    }, {
      text: 'Merkel III',
      values: [{ year: 2013 }, { year: 2017 }],
      colors: ['#000', '#e2001a']
    }
  ];

  $data.labels = [
    {
      text: 'SCHRÖDER',
      color: '#e2001a',
      getYear: function () { return middleYear($data.previous); },
      getValue: function () { return $app.height - 20; }
    }, {
      text: 'MERKEL',
      color: '#000',
      getYear: function () { return middleYear($data.current); },
      getValue: function () { return $app.height - 20; }
    }
  ];

  function init(data) {

    $data.data = data;
    $app.id = options.id;

    transform();
  }

  function transform() {

    $data.data = $data.data.filter(function (d) { return d.id == $app.id; })[0];

    $data.previous = $data.data.values.filter(function (d) {

      return d.year <= $data.data.breakpoint;
    });

    $data.current = $data.data.values.filter(function (d) {

      return d.year >= $data.data.breakpoint;
    });

    $data.user = clone($data.current).map(function (d, i) {

      d.value = i ? undefined : d.value;

      return d;
    });

    prepare();
  }

  function prepare() {

    $app.showButton = d3.select('button.show[data-id=' + options.id + ']');
    $app.showButton.on('click', handleComplete);

    $app.resetButton = d3.select('button.reset[data-id=' + options.id + ']');
    $app.resetButton.on('click', handleReset);

    $app.paragraph = d3.select('p[data-id=' + options.id + ']');

    $app.container = document.getElementById(options.id);
    $app.container.addEventListener('touchmove', function (event) {

      event.preventDefault();
    }, false);

    $app.svg = d3.select($app.container).append('svg')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('version', '1.1')
      .attr('baseProfile', 'full');

    $app.defs = $app.svg.append('defs');

    $app.filter = $app.defs.append('filter')
      .attr('id', 'solid-' + options.id)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 1)
      .attr('height', 1);

    $app.filter.append('feFlood')
      .attr('flood-color', 'white');

    $app.filter.append('feComposite')
      .attr('in', 'SourceGraphic');

    $app.clipRect = $app.defs.append('clipPath')
        .attr('id', 'clip-' + options.id)
      .append('rect');

    $app.yMin = 0;
    $app.yMax = $data.data.max;
    // $app.yMax = d3.max($data.data.values, function (d) { return d.value; }) * 1.5;

    $app.xMin = d3.min($data.data.values, function (d) { return d.year; });
    $app.xMax = d3.max($data.data.values, function (d) { return d.year; });

    $app.x = d3.scale.linear()
      .domain([$app.xMin, $app.xMax]);

    $app.y = d3.scale.linear()
      .domain([$app.yMin, $app.yMax]);

    $app.line = d3.svg.line()
      .interpolate('linear')
      .x(year)
      .y(value);

    $app.group = $app.svg.append('g');

    $app.background = $app.group.append('rect')
      .attr('class', 'background');

    $app.coalitionGroup = $app.group.append('g')
        .attr('class', 'coalitions')
      .selectAll('g')
        .data($data.coalitions)
        .enter()
      .append('g');

    $app.coalitionGroup.selectAll('circle')
        .data(function (d) { return d.colors; })
        .enter()
      .append('circle');

    $app.xAxisGroup = $app.group.append('g')
      .attr('class', 'x axis');

    $app.yAxisGroup = $app.group.append('g')
      .attr('class', 'y axis');

    $app.labels.group = $app.group.append('g')
        .attr('class', 'labels')
      .selectAll('.label')
        .data($data.labels)
        .enter()
      .append('g');

    $app.labels.group
      .append('text');

    $app.user.group = $app.group.append('g')
      .attr('class', 'user line');

    $app.user.line = $app.user.group.append('path');

    $app.user.highlight = $app.group.append('g')
      .attr('class', 'user highlight');

    $app.user.highlight.append('circle');
    $app.user.highlight.append('circle');

    $app.user.highlight.append('text');

    $app.current.group = $app.group.append('g')
      .attr('class', 'current line')
      .attr('clip-path', 'url(#clip-' + options.id + ')');

    $app.current.line = $app.current.group.append('path');

    $app.current.dots = $app.current.group.selectAll('dot')
        .data($data.current)
        .enter()
      .append('circle');

    $app.current.highlight = $app.group.append('g')
      .attr('class', 'current highlight');

    $app.current.highlight.append('circle');

    $app.current.highlight.append('text');

    $app.previous.group = $app.group.append('g')
      .attr('class', 'previous line');

    $app.previous.line = $app.previous.group.append('path');

    $app.previous.dots = $app.previous.group.selectAll('dot')
        .data($data.previous)
        .enter()
      .append('circle');

    $app.previous.highlight = $app.group.append('g')
      .attr('class', 'previous highlight');

    $app.previous.highlight.append('circle');

    $app.previous.highlight.append('text');

    $app.previous.first = $app.group.append('g')
      .attr('class', 'first highlight');

    $app.previous.first.append('text');

    $app.drag = d3.behavior.drag()
      .on('drag', handleDrag);

    $app.svg
      .on('click', handleDrag)
      .call($app.drag);

    $app.annotations.group = $app.group.append('g')
        .attr('class', 'annotations')
      .selectAll('.annotations')
        .data(function () { return $data.data.annotations; })
        .enter()
      .append('g');

    $app.annotations.group
      .append('text');

    $app.annotations.group
      .append('line');

    render();
  }

  function render() {

    $state.mobile = window.innerWidth < $config.breakpoint;

    $app.width = $app.container.getBoundingClientRect().width - $config.margin.left - $config.margin.right;
    $app.width = $app.width || $config.width;

    $app.height = $config.height;
    $app.height = $app.height - $config.margin.top - $config.margin.bottom;

    $app.x.range([0, $app.width]);
    $app.y.range([$app.height, 0]);

    $app.svg
      .attr('width', $app.width + $config.margin.left + $config.margin.right)
      .attr('height', $app.height + $config.margin.bottom + $config.margin.top);

    $app.clipRect
      .attr('width', $state.completed ? $app.x($app.xMax) + $config.margin.right : $app.x(lastYear($data.previous)))
      .attr('height', $app.height);

    // @todo Is this necessary?
    $app.group
      .attr('transform', 'translate(' + $config.margin.left + ',' + $config.margin.top + ')');

    $app.background
      .attr('width', $app.width - $app.x(lastYear($data.previous)))
      .attr('height', $app.height)
      .attr('x', $app.x(lastYear($data.previous)) - 10)
      .style('cursor', 'pointer');

    $app.xAxis = d3.svg.axis()
      .scale($app.x)
      .orient('bottom')
      .tickSize(-7)
      .tickPadding(10)
      .tickValues($data.elections)
      .tickFormat(function (d) { return d; });

    $app.yAxis = d3.svg.axis()
      .scale($app.y)
      .orient('right')
      .ticks(6)
      .innerTickSize(-$app.width)
      .outerTickSize(0)
      .tickPadding(10)
      .tickFormat('');
      //.tickFormat(function (d, i) { return (i % 2) ? '' : pretty(d); });

    $app.xAxisGroup
        .attr('transform', 'translate(0,' + $app.height + ')')
        .call($app.xAxis)
      .selectAll('text')
        .attr('dx', $state.mobile ? '-10px' : 0)
        .attr('dy', $state.mobile ? '0' : '12px')
        .attr('transform', $state.mobile ? 'rotate(-90)' : 'rotate(0)')
        .style('text-anchor', $state.mobile ? 'end' : 'middle');

    $app.xAxisGroup
      .select('path')
        .attr('d', $app.line([
          { year: $data.elections[0], value: $app.yMax },
          { year: $data.elections[$data.elections.length - 1], value: $app.yMax }
        ]));

    $app.yAxisGroup
      .attr('transform', 'translate(' + $app.width + ',0)')
      .call($app.yAxis);

    $app.coalitionGroup
      .attr('class', function (d) { return dashcase(d.text); })
      .attr('transform', function (d) { return 'translate(' + middleYear(d.values) + ',' + ($app.height + 17) + ')'; });

    $app.coalitionGroup.selectAll('circle')
      .attr('cx', function (d, i) { return i * 7; })
      .attr('r', 6)
      .attr('fill', function (d) { return d; });

    $app.labels.group
        .attr('transform', function (d) { return 'translate(' + d.getYear() + ',' + d.getValue() +')'; })
      .selectAll('text')
        .text(function (d) { return d.text; })
        .attr('fill', function (d) { return d.color; })
        .attr('text-anchor', 'middle');

    $app.user.group
      .attr('opacity', $state.completed ? 1 : 0);

    $app.user.line
      .attr('d', $state.completed ? $app.line($data.defined) : '');

    $app.user.highlight
      .attr('transform', $state.completed ? translate($data.defined, $data.defined) : translate($data.previous, $data.previous))
      .style('opacity', $state.completed ? 1 : 0);

    $app.user.highlight.selectAll('circle')
      .attr('r', 4);

    $app.user.highlight.select('text')
      .attr('dy', '-15')
      .attr('fill', '#888899')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle');

    $app.current.line.attr('d', $app.line($data.current));

    $app.current.dots
      .attr('r', 4)
      .attr('cx', year)
      .attr('cy', value);

    $app.current.highlight
      .attr('transform', smartTranslate($data.current, $data.current, $data.user))
      .style('opacity', $state.completed ? 1 : 0);

    $app.current.highlight.select('circle');

    $app.current.highlight.select('text')
      .text(pretty(lastValue($data.current)))
      .attr('dy', '-15')
      .attr('fill', 'black')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle');

    $app.previous.line
      .attr('d', $app.line($data.previous));

    $app.previous.dots
      .attr('r', 4)
      .attr('cx', year)
      .attr('cy', value);

    $app.previous.highlight
      .attr('transform', translate($data.previous, $data.previous));

    $app.previous.highlight.select('circle')
      .attr('r', 4)
      .classed('pulse', !$state.completed);

    $app.previous.highlight.select('text')
      .text(pretty(lastValue($data.previous)))
      .attr('dy', '-15')
      .attr('fill', '#e2001a')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle');

    $app.previous.first
      .attr('transform', 'translate(' + year($data.previous[0]) + ',' +  value($data.previous[0]) +')');

    $app.previous.first.select('text')
      .text(pretty($data.previous[0].value))
      .attr('dy', '-15')
      .attr('fill', '#e2001a')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle');

    $app.annotations.group
        .attr('transform', function (d) { return 'translate(' + year(d) + ',' + (value(d) - 50) +')'; })
        .style('opacity', $state.completed ? 1 : 0)
      .selectAll('text')
        .text(function (d) { return d.text; })
        .attr('fill', function (d) { return d.color; })
        .attr('text-anchor', 'middle');

    $app.annotations.group
      .selectAll('line')
        .attr('stroke', 'black')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 10)
        .attr('y2', 35);
  }

  function update() {

    if (!$state.started) {

      handleStart();
    }

    if (!$state.completed) {

      handleChange();
    }

    if (!$state.completed && lastValue($data.user)) {

      handleComplete();
    }
  }

  function handleDrag() {

    var pos = d3.mouse(this);

    var year = Math.max($data.data.breakpoint + 1,
      Math.min($app.xMax, $app.x.invert(pos[0]))
    );

    var value = Math.max($app.yMin,
      Math.min($app.y.domain()[1], $app.y.invert(pos[1]))
    );

    $data.user.forEach(function (d) {

      if (Math.abs(d.year - year) < 0.5) {

        d.value = value;
      }
    });

    $data.defined = $data.user.filter(function (d) {

      return d.value;
    });

    update();
  }

  function handleStart() {

    $app.previous.highlight.select('circle')
      .classed('pulse', false);

    $app.user.group
      .attr('opacity', 1);

    $app.user.highlight
      .style('opacity', 1);

    $app.user.highlight.select('circle')
      .classed('pulse', true);

    $state.started = true;
  }

  function handleChange() {

    $app.user.line
      .attr('d', $app.line($data.defined));

    $app.user.highlight
      .attr('transform', translate($data.defined, $data.defined));

    $app.user.highlight.select('text')
      .text(pretty(lastValue($data.defined)));
  }

  function handleComplete() {

    $app.background
      .style('cursor', 'auto');

    $app.clipRect
      .transition()
        .duration(1000)
        .attr('width', $app.x($app.xMax) + $config.margin.right);

    $app.user.highlight.select('circle')
      .classed('pulse', false);

    $app.current.highlight
      .attr('transform', smartTranslate($data.current, $data.current, $data.user));

    $app.current.highlight
      .transition()
        .delay(1000)
        .style('opacity', 1);

    $app.annotations.group
      .transition()
        .delay(1000)
        .style('opacity', 1);

    $app.paragraph
      .transition()
        .delay(1000)
        .style('opacity', 1);

    $state.completed = true;
  }

  function handleReset() {

    $state = {
      started: false,
      completed: false,
      evaluated: false,
      mobile: false
    };

    $data.user = clone($data.current).map(function (d, i) {

      d.value = i ? undefined : d.value;

      return d;
    });

    render();
  }

  // Returns translate property for SVG transforms
  function translate(xArr, yArr) {

    return 'translate(' + $app.x(lastYear(xArr)) + ',' + $app.y(lastValue(yArr)) +')';
  }

  function smartTranslate(xArr, yArr1, yArr2) {

    var offset = 0;
    // var delta = Math.abs(y(lastValue(yArr1)) - y(lastValue(yArr2)));

    if (lastValue(yArr2) > lastValue(yArr1)) {

      offset = 40;
    }

    return 'translate(' + $app.x(lastYear(xArr)) + ',' +  ($app.y(lastValue(yArr1)) + offset) +')';
  }

  // Add German decimal seperators to number
  function pretty(number) {

    var string;

    number = number / $data.data.factor;
    number = Math.round(number * $data.data.precision) / $data.data.precision;

    string = number.toString().split('.');
    string = string[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (string[1] ? ',' + string[1] : '');

    string = string + ' ' + $data.data.unit;

    return string;
  }

  // Get x value for year
  function year(d) {

    return $app.x(d.year);
  }

  // Get y value for value
  function value(d) {

    return $app.y(d.value);
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

    return $app.x(((last - first) / 2) + first);
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

  function noop() { return; }

  return {

    init: init,
    prepare: prepare,
    render: render,
    update: update
  };
};
