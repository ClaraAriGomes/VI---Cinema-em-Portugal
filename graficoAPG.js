let svg;
let canvasHeight, canvasWidth, padding, graphWidth, graphHeight;
let dataset;
const excludedGenres = ["(em branco)", "N/D", ""];
let seatWidth = 35;
let seatHeight = 25;

window.addEventListener("load", function () {
    canvasHeight = 1280;
    canvasWidth = 1280;
    padding = 70;
    graphWidth = canvasWidth - padding * 2;
    graphHeight = canvasHeight - padding * 2;

    //filter the data for this graph
    d3.csv("dados/dadosFilmes.csv", d => ({
        //return {
        year: +d.Year,
        genre: d.Genre.split(",").map(g => g.trim()), // split multi-genre strings
        admissions: +d.Admissions
        //};

    })).then(dataset => {
        let flatData = dataset.flatMap(d =>
            d.genre
                .filter(g => !excludedGenres.includes(g))  //exclude unwanted genres
                .map(g => ({
                    year: d.year,
                    genre: g,
                    admissions: d.admissions
                }))
        );

        let groupedData = d3.rollups(flatData,
            v => d3.sum(v, d => d.admissions),  //aggregate admissions
            d => d.year,                        //group by year
            d => d.genre                        //then by genre

        ).flatMap(([year, genres]) =>
            genres.map(([genre, admissions]) => ({ year, genre, admissions }))
        );

        const colorScale = d3.scaleSequential()
            .domain([0, d3.max(groupedData, d => d.admissions)])
            .interpolator(d3.interpolateReds);

        svg = d3.select("#grafAdmissoesPorGenero")
            .append("svg")
            .attr("width", canvasWidth)
            .attr("height", canvasHeight);

        const chartGroup = svg.append("g")
            .attr("transform", `translate(${padding},${padding})`);

        const years = [...new Set(groupedData.map(d => d.year))].sort(d3.ascending);
        const genres = [...new Set(groupedData.map(d => d.genre))].sort(d3.ascending);

        const xAxis = d3.scaleBand()
            .domain(years)
            .range([0, graphWidth])
            .paddingInner(0.1)
            .paddingOuter(0.1);

        const yAxis = d3.scaleBand()
            .domain(genres)
            .range([0, graphHeight])
            .paddingInner(0.01)
            .paddingOuter(0.1);

        chartGroup.append("g")
            //.attr("transform", `translate(0, ${graphHeight})`)
            .call(d3.axisTop(xAxis).tickFormat(d3.format("d")).tickSize(0))
            .selectAll("path")
            .style("display", "none"); // hide axis line

        chartGroup.append("g")
            .call(d3.axisLeft(yAxis).tickSize(0))
            .selectAll("path")
            .style("display", "none"); // hide axis line

        chartGroup.selectAll("rect")
            .data(groupedData)
            .enter()
            .append("rect")
            .attr("x", d => xAxis(d.year)+(xAxis.bandwidth()/2)-(seatWidth/2))
            .attr("y", d => yAxis(d.genre)+(yAxis.bandwidth()/2)-(seatHeight/2))
            .attr("width", seatWidth)
            .attr("height", seatHeight)
            .attr("fill", d => colorScale(d.admissions))
            .attr("rx", 4) // rounded corners
            .attr("ry", 4);

        const printthing = [...new Set(groupedData.map(d => d.genre))].sort(d3.descending);
        printthing.forEach(g => console.log(g));

    });

    /*TODO
    - define color encodings
    - draw cells at the right position
    - add legend and labels
    - think about interactivity (tooltip, highlight on hover, ...)
    */
});