var draw = function (options) {

  var container, svg, group, lines, previousLine, currentLine, userLine, completed, xAxisEl, yAxisEl, xAxis, yAxis, yMax, line, x, y, isMobile;

  var data, userData, previousData, currentData;

  var width, height, margin = { bottom: 50, left: 5, right: 100, top: 20 };
  var breakpoint = 561;

  var years = [];
  var lastYear;

  var drag = d3.behavior.drag()
    .on('drag', function () {

      var pos = d3.mouse(this);
      var year = Math.max(2006, Math.min(2017, x.invert(pos[0])));
      var value = Math.max(0, Math.min(y.domain()[1], y.invert(pos[1])));

      userData.forEach(function (d) {

        if (Math.abs(d.year - year) < .5) {

          d.value = value;
          d.defined = true;
        }
      });

      update();
    });

  function init() {

    d3.json('data/data.json', function (error, res) {

      if (error) { throw error; }

      var indicator = options.nodeId;

      data = res.filter(function (d) { return d.name == indicator; })[0];

      yMax = d3.max(data.values, function (d) { return d.value; }) * 1.5;

      years = data.values.map(function (d) { return d.year; }).sort();

      lastYear = years[years.length - 1];

      previousData = data.values
        .filter(function (d) {

          return d.year <= 2005;
        });

      currentData = data.values
        .filter(function (d) {

          return d.year >= 2005;
        });

      userData = data.values
        .map(function (d) {

          return { year: d.year, value: d.value, defined: false };
        })
        .filter(function (d) {

          if (d.year == 2005) { d.defined = true; }

          return d.year >= 2005;
        });

      completed = false;

      render();
    });

  }

  function render() {

    container = document.getElementById(options.nodeId);

    // Dectivate scrolling for mobile devices
    container.addEventListener('touchmove', function (e) {

      e.preventDefault();
    }, false);

    svg = d3.select(container).append('svg')
      .attr('class', 'draw');

    svg.call(drag);

    group = svg.append('g');

    x = d3.scale.linear()
      .domain([years[0], lastYear]);

    y = d3.scale.linear()
      .domain([0, yMax]);

    line = d3.svg.line();

    xAxisEl = group.append('g')
      .attr('class', 'x axis');

    yAxisEl = group.append('g')
      .attr('class', 'y axis');

    lines = group.append('g')
      .attr('class', 'lines');

    previousLine = lines.append('path')
      .attr('class', 'previous');

    currentLine = lines.append('path')
      .attr('class', 'current');

    userLine = lines.append('path')
      .attr('class', 'user');

    scale();
  }

  function scale() {

    isMobile = window.innerWidth < breakpoint;

    margin.bottom = isMobile ? 80 : 50;
    width = container.getBoundingClientRect().width - margin.left - margin.right;
    height = isMobile ? 260 : 300;
    height = height - margin.top - margin.bottom;

    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.bottom + margin.top);

    group
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

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
        .attr('dx', isMobile ? '-10px' : 0)
        .attr('dy', isMobile ? '0' : '12px')
        .attr('transform', isMobile ? 'rotate(-90)' : 'rotate(0)')
        .style('text-anchor', isMobile ? 'end' : 'start');

    yAxisEl
      .attr('transform', 'translate(' + width + ',0)')
      .call(yAxis);

    line
      .interpolate('linear')
      .x(function (d) { return x(d.year); })
      .y(function (d) { return y(d.value); });

    previousLine
      .attr('d', line(previousData));

    group.selectAll('dot')
        .data(previousData)
        .enter()
      .append('circle')
        .attr('class', 'previous')
        .attr('r', 4)
        .attr('cx', function (d) { return x(d.year); })
        .attr('cy', function (d) { return y(d.value); });

    //update();
  }

  function update() {

    userLine
      .attr('d', function () {

        return line(userData.filter(function (d) {

          return d.defined;
        }));
      });

    if (!completed && userData[userData.length - 1].defined) {

      // Show lines
      console.log('Finished');

      currentLine.attr('d', line(currentData));

      group.selectAll('dot')
        .data(currentData)
        .enter()
      .append('circle')
        .attr('class', 'current')
        .attr('r', 4)
        .attr('cx', function (d) { return x(d.year); })
        .attr('cy', function (d) { return y(d.value); });

      completed = true;
    }
  }

  function pretty(number) {

    var fragments = number.toString().split('.');
    return fragments[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (fragments[1] ? ',' + fragments[1] : '');
  }

  return {

    init: init,
    render: render,
    scale: scale
  };
};
