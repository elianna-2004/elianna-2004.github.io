const margin = {top: 70, right: 90, bottom: 70, left: 90};
const width = 1000 - margin.left - margin.right;
const height = 700 - margin.top - margin.bottom;

// Create SVG (White Hat)
const svg = d3.select('#vis1')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

// Create SVG (Black Hat)
const svg2 = d3.select('#vis2')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);


function init(){
    d3.csv("./data/data.csv", 
        // This is our callback function, applied to each item in the array
        function(d){
            return {
            // Besides converting the types from string to int,
            // we also simplify the variable
            year: +d.TIME_PERIOD,
            pollutant: d.POLLUTANT,
            location: d['Reference area'],
            unit: d.UNIT_MEASURE,
            amount: +d.OBS_VALUE,

         }
        }) 
        .then(data => {
            console.log(data)
            allData = data

            // Initial rendering steps:
            // P.S. You could move these into setupSelector(),
            // but calling them seperately makes the flow clearer.

            drawWhiteHat(data.filter(d => d.location === 'OECD'));
            drawBlackHat(data.filter(d => d.location === 'OECD'));

        })
    .catch(error => console.error('Error loading data:', error));
}

window.addEventListener('load', init);


function drawAxes(chart, x, y) {
    chart.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')));
    chart.append('g').call(d3.axisLeft(y));
}

// Honest view: all available OECD years, a 9 baseline, and an explicit unit.
function drawWhiteHat(data) {
    const x = d3.scaleLinear().domain(d3.extent(data, d => d.year)).range([0, width]);
    const y = d3.scaleLinear().domain([9, d3.max(data, d => d.amount) * 1.12]).nice().range([height, 0]);
    drawAxes(svg, x, y);
    svg.append('text').attr('x', width / 2).attr('y', height + 52)
        .attr('text-anchor', 'middle').text('Year')
        .style('font-weight', 'bold');
    svg.append('text').attr('transform', 'rotate(-90)').attr('x', -height / 2).attr('y', -62)
        .attr('text-anchor', 'middle').text('GHG emissions per person (thousand kg CO₂e)')
        .style('font-weight', 'bold');
    svg.append('path').datum(data).attr('fill', 'none').attr('stroke', '#1769aa').attr('stroke-width', 3)
        .attr('d', d3.line().x(d => x(d.year)).y(d => y(d.amount)));
    svg.selectAll('.white-point').data(data).enter().append('circle').attr('class', 'white-point')
        .attr('cx', d => x(d.year)).attr('cy', d => y(d.amount)).attr('r', 4).attr('fill', '#1769aa')
        .append('title').text(d => `${d.year}: ${d.amount.toFixed(2)} thousand kg CO₂e/person`);
    svg.append('text').attr('class', 'chart-note').attr('x', width*3/4).attr('y', -28)
        .attr('text-anchor', 'end').text('OECD Aggregate • 2015–2024 • Complete Range');

    // Keep the black-hat legend unchanged and add a separate key for this chart.
    const whiteLegend = svg.append('g').attr('class', 'legend white-legend')
        .attr('transform', `translate(${width - 260},${height - 92})`);
    whiteLegend.append('rect').attr('class', 'legend-box')
        .attr('x', -12).attr('y', -26)
        .attr('width', 260).attr('height', 74)
        .attr('rx', 8).attr('ry', 8);
    whiteLegend.append('text').attr('class', 'legend-title').attr('x', 0).attr('y', -8)
        .text('Emissions trend');
    whiteLegend.append('line')
        .attr('x1', 2).attr('x2', 30).attr('y1', 15).attr('y2', 15)
        .attr('stroke', '#1769aa').attr('stroke-width', 3);
    whiteLegend.append('circle').attr('cx', 16).attr('cy', 15).attr('r', 4)
        .attr('fill', '#1769aa');
    whiteLegend.append('text').attr('x', 40).attr('y', 20)
        .text('OECD GHG emissions per person');
}

// Deliberately misleading view: a dense spiral makes the series resemble a
// pollution plume, with larger bubbles for the earlier, higher value.
function drawBlackHat(data) {
    const allData = data;
    data = data.filter(d => d.year >= 2018 && d.year <= 2020)
        .sort((a, b) => a.year - b.year);
    const unitLabels = {
        KG_CO2E_PS: 'Kilogrammes of CO₂-equivalent per person'
    };
    const measureUnit = unitLabels[data[0]?.unit] || data[0]?.unit || 'unknown unit';

    const tooltip = d3.select('#vis2')
        .style('position', 'relative')
        .append('div')
        .attr('class', 'chart-tooltip')
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('padding', '8px 10px')
        .style('border', '1px solid #71879a')
        .style('border-radius', '4px')
        .style('background', 'rgba(255, 255, 255, 0.95)')
        .style('color', '#333')
        .style('font-size', '12px')
        .style('line-height', '1.4')
        .style('z-index', 10)
        .style('opacity', 0);

    const defs = svg2.append('defs');
    const metalGradient = defs.append('linearGradient')
        .attr('id', 'industrial-metal')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '100%').attr('y2', '100%');
    metalGradient.append('stop').attr('offset', '0%').attr('stop-color', '#f5fbff');
    metalGradient.append('stop').attr('offset', '48%').attr('stop-color', '#d9e8f4');
    metalGradient.append('stop').attr('offset', '52%').attr('stop-color', '#eef7fc');
    metalGradient.append('stop').attr('offset', '100%').attr('stop-color', '#bfd3e3');

    const fullWidth = width + margin.left + margin.right;
    const fullHeight = height + margin.top + margin.bottom;
    svg2.append('rect').attr('class', 'industrial-background')
        .attr('x', -margin.left).attr('y', -margin.top)
        .attr('width', fullWidth).attr('height', fullHeight)
        .attr('fill', 'url(#industrial-metal)');

    const centerX = width / 2;
    const centerY = height / 2;
    const g = svg2.append('g').attr('transform', `translate(${centerX},${centerY})`);
    const minAmount = d3.min(data, d => d.amount);
    const maxAmount = d3.max(data, d => d.amount);
    // Intentionally exaggerate small value differences with a cubic size scale.
    const bubbleSize = d3.scalePow().exponent(3)
        .domain([minAmount, maxAmount]).range([18, 48]);
    // Keep the plotted visualization in the original black-to-gray palette.
    const severityColors = ['#111111', '#666666', '#b8b8b8'];
    const severityLabels = ['Severe', 'Moderate', 'Low'];
    // Divide the full series into three value bands: high, middle, and low.
    // Reversing the quantile range keeps the darkest color for the highest values.
    const colorScale = d3.scaleQuantile()
        .domain(allData.map(d => d.amount))
        .range([2, 1, 0]);
    const colorRanges = severityColors.map((_, colorIndex) => {
        const values = allData
            .filter(d => colorScale(d.amount) === colorIndex)
            .map(d => d.amount);
        return d3.extent(values);
    });
    const timeColors = ['#d62828', '#f28c28', '#2e8b57'];
    const labelColors = timeColors;
    const turns = 2.6;
    const samples = 260;
    const points = [];

    for (let i = 0; i < samples; i++) {
        const t = i / (samples - 1);
        const yearIndex = Math.min(data.length - 1, Math.floor(t * data.length));
        const amount = data[yearIndex].amount;
        const colorIndex = colorScale(amount);
        const colorRange = colorRanges[colorIndex];
        const colorRangeLabel = `${colorRange[0].toFixed(2)}–${colorRange[1].toFixed(2)} ${measureUnit}`;
        const angle = -Math.PI / 2 + t * turns * 2 * Math.PI;
        const r = 32 + t * 250;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        points.push([x, y]);

        g.append('circle')
            .attr('class', 'spiral-bubble')
            .datum(data[yearIndex])
            .attr('cx', x).attr('cy', y)
            .attr('r', bubbleSize(amount))
            .attr('stroke', severityColors[colorIndex])
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.32)
            .attr('fill', severityColors[colorIndex])
            .attr('fill-opacity', 0.28)
            .style('animation-delay', `${(i % 24) * 0.08}s`)
            .on('mouseenter', function(event, d) {
                d3.select(this)
                    .attr('stroke', '#000000')
                    .attr('stroke-width', 3)
                    .attr('stroke-opacity', 1);
                tooltip
                    .html(`<strong>Pollution Affect: ${severityLabels[colorIndex]}</strong><br>` +
                        `Color value range: ${colorRangeLabel}<br>` +
                        `Year represented: ${d.year}`)
                    .style('opacity', 1);
                moveTooltip(event);
            })
            .on('mousemove', moveTooltip)
            .on('mouseleave', function(event, d) {
                d3.select(this)
                    .attr('stroke', severityColors[colorIndex])
                    .attr('stroke-width', 1)
                    .attr('stroke-opacity', 0.32);
                tooltip.style('opacity', 0);
            });

        function moveTooltip(event) {
            const container = document.querySelector('#vis2').getBoundingClientRect();
            tooltip
                .style('left', `${event.clientX - container.left + 14}px`)
                .style('top', `${event.clientY - container.top + 14}px`);
        }
    }

    g.append('path').datum(points)
        .attr('class', 'spiral-wave')
        .attr('fill', 'none').attr('stroke', '#c8d8ca')
        .attr('stroke-width', 1.5).attr('stroke-opacity', 0.9)
        .attr('d', d3.line());

    const misleadingTimeLabels = ['Earlier', 'Recent', 'Latest'];
    const misleadingLabelPositions = [0.16, 0.48, 0.9];
    data.forEach((d, i) => {
        const t = misleadingLabelPositions[i];
        const angle = -Math.PI / 2 + t * turns * 2 * Math.PI;
        const r = 32 + t * 250 + 68;
        g.append('text').attr('class', 'spiral-label')
            .attr('x', r * Math.cos(angle)).attr('y', r * Math.sin(angle))
            .attr('text-anchor', 'middle')
            .attr('fill', labelColors[i])
            .attr('font-weight', 'bold')
            .attr('font-size', '16px')
            .text(misleadingTimeLabels[i]);
    });

    svg2.append('text').attr('class', 'chart-title').attr('x', width / 2).attr('y', -28)
        .attr('text-anchor', 'middle').text('Pollution Crisis Solved: Emissions Are Gone!');

    // Pollution severity legend (kept separate from the time scale).
    const pollutionLegend = svg2.append('g').attr('class', 'legend pollution-legend')
        .attr('transform', 'translate(-65,18)');
    pollutionLegend.append('rect').attr('class', 'legend-box')
        .attr('x', -10).attr('y', -24)
        .attr('width', 180).attr('height', 112)
        .attr('rx', 8).attr('ry', 8);
    pollutionLegend.append('text').attr('class', 'legend-title').attr('x', 0).attr('y', -8)
        .text('Pollution Affect');
    data.forEach((d, i) => {
        const row = pollutionLegend.append('g').attr('transform', `translate(0,${22 + i * 24})`);
        row.append('circle').attr('r', 7).attr('cx', 7).attr('cy', 0)
            .attr('fill', severityColors[i]).attr('stroke', severityColors[i])
            .attr('stroke-width', 2);
        row.append('text').attr('x', 22).attr('y', 5)
            .text(severityLabels[i]);
    });

    // Separate time color scale, positioned in the bottom-right as requested.
    const timeLegend = svg2.append('g').attr('class', 'legend time-legend')
        .attr('transform', `translate(${width - 225},${height + 5})`);
    timeLegend.append('rect').attr('class', 'legend-box')
        .attr('x', -12).attr('y', -26)
        .attr('width', 270).attr('height', 78)
        .attr('rx', 8).attr('ry', 8);
    timeLegend.append('text').attr('class', 'legend-title').attr('x', 0).attr('y', -8)
        .text('Increasing Time →');
    const timeLabels = ['Earlier', 'Recent', 'Latest'];
    timeLabels.forEach((label, i) => {
        const x = i * 90;
        timeLegend.append('circle').attr('cx', x + 7).attr('cy', 15).attr('r', 7)
            .attr('fill', timeColors[i]).attr('fill-opacity', 0.82);
        timeLegend.append('text').attr('x', x + 18).attr('y', 20)
            .text(label);
    });

}
