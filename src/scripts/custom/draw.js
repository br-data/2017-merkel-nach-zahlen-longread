var draw = function (options) {

  var container, svg, g, rect, clipRect, correctSel, yourDataSel, yourData, completed, xAxis, yAxis, yMax, area, line, bars, labels, x, y, data;
  var width, height, margin = { bottom: 50, left: 50, right: 15, top: 20 };
  var isMobile, breakpoint = 561;
  var years = [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016];
  var lastYear = years[years.length - 1];

  var drag = d3.behavior.drag()
      .on('drag', function(){
        var pos = d3.mouse(this);
        var year = Math.max(2006, Math.min(2017, x.invert(pos[0])));
        var value = Math.max(0, Math.min(y.domain()[1], y.invert(pos[1])));

        yourData.forEach(function(d){
          if (Math.abs(d.year - year) < .5){
            d.value = value;
            d.defined = true;
          }
        });

        drawLine();
      });

  function init() {

    d3.json('data/data.json', function(error, d) {

      if (error) { throw error; }

      var datName = options.nodeId; // in constructor
      data = d.filter(function(dd) { return dd.name == datName; })[0];
      yMax = d3.max(data.values);

      data = data.values
        .map(function(d, i){ return {year: years[i], value: d}; });

      yourData = data
        .map(function(d){ return {year: d.year, value: d.value, defined: 0}; })
        .filter(function(d){
          if (d.year == 2005) d.defined = true;
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

    g = svg.append('g');

    x = d3.scale.linear()
      .domain([years[0], lastYear]);

    y = d3.scale.linear()
      .domain([0, yMax]);

    area = d3.svg.area();
    line = d3.svg.area();

    clipRect = g.append('clipPath')
      .attr('id', 'clip').append('rect');

    correctSel = g.append('g')
      .attr('clip-path', 'url(#clip)');

    correctSel.append('path')
      .attr('class', 'area');

    correctSel.append('path')
      .attr('class', 'line');

    yourDataSel = g.append('path')
      .attr('class', 'your-line');

    xAxis = g.append('g')
      .attr('class', 'x axis');
    yAxis = g
      .append('g').attr('class', 'y axis');

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

    g
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    x.range([0, width]);
    y.range([height, 0]);

    xAxis
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.svg.axis().scale(x).orient('bottom').tickSize(0).tickFormat(function(d, i) { return i % 2 ? '' : d; }))
      .selectAll('text')
        .attr('dx', isMobile ? '-10px' : 0)
        .attr('dy', isMobile ? '0' : '12px')
        .attr('transform', isMobile ? 'rotate(-90)' : 'rotate(0)')
        .style('text-anchor', isMobile ? 'end' : 'middle');

    yAxis
      .call(d3.svg.axis().scale(y).orient('left').tickSize(0).tickFormat(function(d, i) { return i % 2 ? '' : d; }));

    area
      .x(function(d) { return x(+d.year); })
      .y0(function(d) { return y(+d.value); })
      .y1(height);

    line
      .x(function(d) { return x(+d.year); })
      .y(function(d) { return y(+d.value); });

    clipRect
      .attr('width', function(d) { return !completed ? x(2005) : x(d3.max(data, function(d) { return d.year; })); })
      .attr('height', height);

    correctSel.selectAll('path.area')
      .attr('d', area(data));

    correctSel.selectAll('path.line')
      .attr('d', line(data));

    drawLine();
  }

  function drawLine() {
    yourDataSel
      .attr('d', function(d) { return line(yourData.filter(function(dd) { return dd.defined == 1; })); });

    if (!completed && yourData[yourData.length - 1].defined == 1){
      completed = true;
      clipRect.transition().duration(1000).attr('width', x(lastYear));
    }
  }

  return {

    init: init,
    render: render,
    scale: scale
  };
};
