var draw = function (options) {

  'use strict';

  var $config, $app, $state, $pointer, $data;

  $config = {
    height: 270,
    width: 658,
    breakpoint: 561
  };

  $app = {
    previous: {},
    current: {},
    user: {},
    labels: {},
    annotations: {},
    hint: {}
  };

  $state = {
    started: false,
    completed: false,
    evaluated: false,
    mobile: false
  };

  $pointer = 'M20.5 28.7h-11c-.5 0-.9-.4-.9-.9 0-1.4-.7-2.3-1.7-3.5-.5-.7-1.2-1.5-1.8-2.4-1.7-2.8-3.2-6-3.6-7.3-.4-1.3-.1-2 .2-2.4.4-.6 1.1-.9 1.9-.9 1.1 0 2.3.9 3.2 2.1V3.9c0-1.5 1.3-2.8 2.7-2.8 1.5 0 2.8 1.3 2.8 2.8v3.9c.3-.1.5-.2.9-.2 1 0 1.8.5 2.3 1.3.4-.2.9-.4 1.3-.4 1.3 0 2.3.9 2.6 2 .3-.1.6-.2 1-.2 1.5 0 2.8 1.3 2.8 2.8v2.8c0 2.3-.5 4.3-.9 6.1-.5 1.9-.9 3.6-.9 5.8.1.4-.4.9-.9.9zm-10.1-1.8h9.3c.1-2 .5-3.7.9-5.3.5-1.8.9-3.6.9-5.7V13c0-.5-.4-.9-.9-.9s-.9.4-.9.9v1c0 .5-.4.9-.9.9s-.9-.4-.9-.9v-2.9c0-.5-.4-.9-.9-.9s-.9.4-.9.9v2c0 .5-.4.9-.9.9s-.9-.4-.9-.9v-2.9c0-.5-.4-.9-.9-.9s-.9.4-.9.9v2c0 .5-.4.9-.9.9s-.9-.4-.9-.9V3.7c0-.5-.4-.9-.9-.9s-1.2.4-1.2.9v14c0 .5-.4.9-.9.9s-.9-.4-.9-.9V17c-.8-2.1-2.6-4-3.2-4-.2 0-.4.1-.4.2-.1.1-.1.4 0 .8.3 1 1.7 4 3.5 6.8.6.9 1.2 1.6 1.7 2.3.9 1.2 1.7 2.3 2 3.8z';

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

    $app.container = options.element;
    $app.container.addEventListener('touchmove', function (event) {

      event.preventDefault();
    }, false);

    $app.svg = d3.select($app.container).append('svg')
      .attr('id', $app.id)
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('version', '1.1')
      .attr('baseProfile', 'full');

    $app.defs = $app.svg.append('defs');

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

    $app.background = $app.svg.append('rect')
      .attr('class', 'background');

    $app.coalitionGroup = $app.svg.append('g')
        .attr('class', 'coalitions')
      .selectAll('g')
        .data($data.coalitions)
        .enter()
      .append('g');

    $app.coalitionGroup.selectAll('circle')
        .data(function (d) { return d.colors; })
        .enter()
      .append('circle');

    $app.xAxisGroup = $app.svg.append('g')
      .attr('class', 'axis');

    $app.yAxisGroup = $app.svg.append('g')
      .attr('class', 'grid');

    $app.labels.group = $app.svg.append('g')
        .attr('class', 'labels')
      .selectAll('.label')
        .data($data.labels)
        .enter()
      .append('g');

    $app.labels.group
      .append('text');

    $app.hint.group = $app.svg.append('g')
        .attr('class', 'hint');

    $app.hint.group.text = $app.hint.group.append('text');

    $app.hint.group.path = $app.hint.group.append('path');

    $app.user.group = $app.svg.append('g')
      .attr('class', 'user line');

    $app.user.line = $app.user.group.append('path');

    $app.user.highlight = $app.svg.append('g')
      .attr('class', 'user highlight');

    $app.user.highlight.pulse = $app.user.highlight.append('circle');

    $app.user.highlight.circle = $app.user.highlight.append('circle');

    $app.user.highlight.text = $app.user.highlight.append('text');

    $app.current.group = $app.svg.append('g')
      .attr('class', 'current line')
      .attr('clip-path', 'url(#clip-' + options.id + ')');

    $app.current.line = $app.current.group.append('path');

    $app.current.dots = $app.current.group.selectAll('dot')
        .data($data.current)
        .enter()
      .append('circle');

    $app.current.highlight = $app.svg.append('g')
      .attr('class', 'current highlight');

    $app.current.highlight.text = $app.current.highlight.append('text');

    $app.previous.group = $app.svg.append('g')
      .attr('class', 'previous line');

    $app.previous.line = $app.previous.group.append('path');

    $app.previous.dots = $app.previous.group.selectAll('dot')
        .data($data.previous)
        .enter()
      .append('circle');

    $app.previous.highlight = $app.svg.append('g')
      .attr('class', 'previous highlight');

    $app.previous.highlight.pulse = $app.previous.highlight.append('circle');

    $app.previous.highlight.text = $app.previous.highlight.append('text');

    $app.previous.first = $app.svg.append('g')
      .attr('class', 'first highlight');

    $app.previous.first.text = $app.previous.first.append('text');

    $app.drag = d3.behavior.drag()
      .on('drag', handleDrag);

    $app.svg
      .on('click', handleDrag)
      .call($app.drag);

    $app.annotations.group = $app.svg.append('g')
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

    $app.width = $app.container.getBoundingClientRect().width;
    $app.width = $app.width || $config.width;

    $app.height = $config.height;
    $app.height = $app.height;

    $app.x.range([0, $app.width]);
    $app.y.range([$app.height, 0]);

    $app.svg
      .attr('width', $app.width)
      .attr('height', $app.height + 30);

    $app.clipRect
      .attr('width', $state.completed ? $app.x($app.xMax) + 10 : $app.x(lastYear($data.previous)))
      .attr('height', $app.height);

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

    $app.xAxisGroup
        .attr('transform', 'translate(0,' + $app.height + ')')
        .call($app.xAxis)
      .selectAll('text')
        .attr('dx', $state.mobile ? '-10px' : 0)
        .attr('dy', $state.mobile ? '-6px' : '12px')
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
      .attr('transform', function (d) {
        return 'translate(' + middleYear(d.values) + ',' + ($app.height + 17) + ')';
      });

    $app.coalitionGroup.selectAll('circle')
      .attr('cx', function (d, i) { return i * 7; })
      .attr('r', 6)
      .attr('fill', function (d) { return d; });

    $app.labels.group
        .attr('transform', function (d) {
          return 'translate(' + d.getYear() + ',' + d.getValue() +')';
        })
      .selectAll('text')
        .text(function (d) { return d.text; })
        .attr('fill', function (d) { return d.color; })
        .attr('text-anchor', 'middle');

    $app.hint.group
      .attr('transform', translate($data.previous))
      .style('opacity', $state.completed ? 0 : 1);

    $app.hint.group.text
      .attr('dx', 25)
      .attr('dy', 6)
      .attr('fill', '#889')
      .attr('text-anchor', 'start')
      .text('Zeichnen Sie die Linie');

    if ($app.id === 'arbeitslosenquote') {
      $app.hint.group.path
        .classed('moving', true)
        .attr('transform', 'translate(5, 10)')
        .attr('d', $pointer);
    }

    $app.user.group
      .attr('opacity', $state.completed ? 1 : 0);

    $app.user.line
      .attr('d', $state.completed ? $app.line($data.defined) : '');

    $app.user.highlight
      .attr('transform', $state.completed ? translate($data.defined) : translate($data.previous))
      .style('opacity', $state.completed ? 1 : 0);

    $app.user.highlight.pulse
      .attr('r', 4);

    $app.user.highlight.circle
      .attr('r', 4);

    $app.user.highlight.text
      .attr('dy', '-15')
      .attr('fill', '#888899')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'end');

    $app.current.line.attr('d', $app.line($data.current));

    $app.current.dots
      .attr('r', 4)
      .attr('cx', year)
      .attr('cy', value);

    $app.current.highlight
      .attr('transform', currentTranslate($data.current, $data.current, $data.user))
      .style('opacity', $state.completed ? 1 : 0);

    $app.current.highlight.text
      .text(pretty(lastValue($data.current)))
      .attr('dy', '-15')
      .attr('fill', 'black')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'end');

    $app.previous.line
      .attr('d', $app.line($data.previous));

    $app.previous.dots
      .attr('r', 4)
      .attr('cx', year)
      .attr('cy', value);

    $app.previous.highlight
      .attr('transform', previousTranslate($data.previous, $data.previous, $data.previous));

    $app.previous.highlight.pulse
      .attr('r', 4)
      .classed('pulsating', !$state.completed);

    $app.previous.highlight.text
      .text(pretty(lastValue($data.previous)))
      .attr('dy', '-15')
      .attr('fill', '#e2001a')
      .attr('font-weight', 'bold')
      .attr('text-anchor', $state.mobile ? 'start' : 'end');

    $app.previous.first
      .attr('transform', firstTranslate($data.previous, $data.previous, $data.previous));

    $app.previous.first.text
      .text(function () {
        if ($app.id !== 'betreuungsquote') { return pretty($data.previous[0].value); }
      })
      .attr('dy', '-15')
      .attr('fill', '#e2001a')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'start');

    $app.annotations.group
        .attr('transform', function (d) { return 'translate(' + year(d) + ',' + (value(d) - 50) +')'; })
        .style('opacity', $state.completed ? 1 : 0)
      .selectAll('text')
        .text(function (d) { return d.text; })
        .attr('fill', function (d) { return d.color; })
        .attr('text-anchor', 'middle');

    $app.annotations.group
      .selectAll('line')
        .attr('stroke', function (d) { return d.color; })
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

    $app.hint.group
      .style('opacity', 0);

    $app.user.group
      .attr('opacity', 1);

    $app.user.highlight
      .style('opacity', 1);

    $app.user.highlight.pulse
      .classed('pulsating', !$state.completed);

    $app.previous.highlight.pulse
      .classed('pulsating', false);

    $state.started = true;
  }

  function handleChange() {

    $app.user.line
      .attr('d', $app.line($data.defined));

    $app.user.highlight
      .attr('transform', translate($data.defined));

    $app.user.highlight.text
      .text(pretty(lastValue($data.defined)));
  }

  function handleComplete() {

    $app.background
      .style('cursor', 'auto');

    $app.clipRect
      .transition()
        .duration(1000)
        .attr('width', $app.x($app.xMax) + 10);

    $app.hint.group
      .style('opacity', 0);

    $app.user.highlight.pulse
      .classed('pulsating', false);

    $app.current.highlight
      .attr('transform', currentTranslate($data.current, $data.current, $data.user));

    $app.current.highlight
      .transition()
        .duration(1000)
        .style('opacity', 1);

    $app.previous.highlight.pulse
      .classed('pulsating', false);

    $app.annotations.group
      .transition()
        .duration(1000)
        .style('opacity', 1);

    $app.paragraph
      .transition()
        .duration(1000)
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

    yArr = yArr || xArr;

    return 'translate(' + $app.x(lastYear(xArr)) + ',' + $app.y(lastValue(yArr)) +')';
  }

  function previousTranslate(xArr, yArr1, yArr2) {

    var offset = 0;

    if (lastValue(yArr2) < firstValue(yArr1)) {

      offset = 40;
    }

    return 'translate(' + $app.x(lastYear(xArr)) + ',' +  ($app.y(lastValue(yArr1)) + offset) +')';
  }

  function firstTranslate(xArr, yArr1, yArr2) {

    var offset = 0;

    if (lastValue(yArr2) > firstValue(yArr1)) {

      offset = 40;
    }

    return 'translate(' + $app.x(firstYear(xArr)) + ',' +  ($app.y(firstValue(yArr1)) + offset) +')';
  }

  function currentTranslate(xArr, yArr1, yArr2) {

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

  // Get value from firts object in an array
  function firstValue(objArr) {

    return objArr[0].value;
  }

  // Get value from last object in an array
  function lastValue(objArr) {

    return objArr[objArr.length - 1].value;
  }

  function firstYear(objArr) {

    return objArr[0].year;
  }

  // Get x value for the year between the first and last year
  function middleYear(objArr) {

    var first = firstYear(objArr);
    var last = lastYear(objArr);

    return $app.x(((last - first) / 2) + first);
  }

  // Get year from last object in an array
  function lastYear(objArr) {

    return objArr[objArr.length - 1].year;
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
    render: render,
    update: update,
    reset: handleReset
  };
};
