var draw = function (options) {

  var container, svg, group, clipRect, correctSel, yourDataSel, yourData, completed, xAxisEl, yAxisEl, xAxis, yAxis, yMax, area, line, x, y, data;

  var width, height, margin = { bottom: 50, left: 5, right: 100, top: 20 };
  var isMobile, breakpoint = 561;

  var years = [];
  var lastYear;

  var drag = d3.behavior.drag()
    .on('drag', function () {

      var pos = d3.mouse(this);
      var year = Math.max(2006, Math.min(2017, x.invert(pos[0])));
      var value = Math.max(0, Math.min(y.domain()[1], y.invert(pos[1])));

      yourData.forEach(function (d) {

        if (Math.abs(d.year - year) < .5) {

          d.value = value;
          d.defined = true;
        }
      });

      drawLine();
    });

  function init() {

    d3.json('data/data.json', function (error, res) {

      if (error) { throw error; }

      var datName = options.nodeId;

      data = res.filter(function (d) { return d.name == datName; })[0];

      yMax = d3.max(data.values, function (d) { return +d.value; }) * 1.333;

      years = data.values.map(function (d) {
        return d.year;
      }).sort();

      lastYear = years[years.length - 1];

      yourData = data.values
        .map(function (d) {

          return { year: d.year, value: d.value, defined: 0 };
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
    // dectivate scrolling for mobile devices
    container.addEventListener('touchmove', function(e) {
      e.preventDefault();
    }, false);

    svg = d3.select(container).append('svg')
      .attr('class', 'drawing');

    svg.call(drag);

    group = svg.append('g');

    x = d3.scale.linear()
      .domain([years[0], lastYear]);

    y = d3.scale.linear()
      .domain([0, yMax]);

    area = d3.svg.area();
    line = d3.svg.area();

    xAxisEl = group.append('g')
      .attr('class', 'x axis');

    yAxisEl = group.append('g')
      .attr('class', 'y axis');

    clipRect = group.append('clipPath')
      .attr('id', 'clip').append('rect');

    correctSel = group.append('g')
      .attr('clip-path', 'url(#clip)');

    correctSel.append('path')
      .attr('class', 'area');

    correctSel.append('path')
      .attr('class', 'line');

    yourDataSel = group.append('path')
      .attr('class', 'your-line');


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
      .tickFormat(function (d, i) { return  d; });

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

    area
      .x(function (d) { return x(+d.year); })
      .y0(function (d) { return y(+d.value); })
      .y1(height);

    line
      .x(function (d) { return x(+d.year); })
      .y(function (d) { return y(+d.value); });

    clipRect
      .attr('width', function () {

        return !completed ? x(2005) : x(d3.max(data.values, function (d) { return d.year; }));
      })
      .attr('height', height);

    correctSel.selectAll('path.area')
      .attr('d', area(data.values));

    correctSel.selectAll('path.line')
      .attr('d', line(data.values));

    drawLine();
  }

  function drawLine() {

    yourDataSel
      .attr('d', function () {

        return line(yourData.filter(function (d) {
          return d.defined == 1;
        }));
      });

    if (!completed && yourData[yourData.length - 1].defined == 1) {

      completed = true;
      clipRect.transition().duration(1000).attr('width', x(lastYear));
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
