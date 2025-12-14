let svg;
let canvasHeight, canvasWidth, padding, graphWidth, graphHeight;
let dataset;
const excludedGenres = ["(em branco)", "N/D", ""];

let seatWidth, seatHeight;

let lableDistance;
let lableFontSize;

window.addEventListener("load", function () {

    drawCompactGraph();

    document.querySelectorAll('input[name="option"]').forEach(radio => {
        radio.addEventListener('change', (event) => {
            if (event.target.value === "one") {
                clearGraph("grafAdmissoesPorGenero");
                drawCompactGraph();
            } else if (event.target.value === "two") {
                clearGraph("grafAdmissoesPorGenero");
                drawDetailedGraph();
            }
        });
    });
});

function clearGraph(containerId) {
    d3.select(`#${containerId}`).select("svg").remove();
}

function drawDetailedGraph() {
    canvasHeight = 1080;
    canvasWidth = 1280;
    padding = 70;
    graphWidth = 1000;
    graphHeight = 1000;

    seatHeight = 25;
    seatWidth = 35;

    let lableFontSize = 14;
    let lableDistance = 5;
    const offsetX = ((canvasWidth - graphWidth) / 2) + 45;
    const offsetY = lableFontSize + lableDistance;

    d3.csv("dados/dadosFilmes.csv", d => ({
        year: +d.Year,
        genre: d.Genre.split(",").map(g => g.trim()), // split strings with multiple genres so genre is an array in some movies
        admissions: +d.Admissions

    })).then(dataset => { // make sure to wait for data to load
        let flatData = dataset.flatMap(d => // so we dont get an array of arrays
            d.genre
                .filter(g => !excludedGenres.includes(g))  //ignore unwanted genres
                .map(g => ({
                    year: d.year,
                    genre: g,
                    admissions: d.admissions
                }))
        );

        let groupedData = d3.rollups(
            flatData,
            v => d3.sum(v, d => d.admissions),  // aggregate admissions--------
            // v is the group of rows with the same year and genre
            // d is a single row in that group
            // and yeah d.admissions is making it numeric

            d => d.year,                        //group by year
            d => d.genre                        //then by genre

        ).flatMap(([year, genres]) =>
            genres.map(([genre, admissions]) => ({ year, genre, admissions }))
        );

        const colorScale = d3.scaleSequential()
            .domain([0, d3.max(groupedData, d => d.admissions)])
            .interpolator(d3.interpolateReds);

        svg = d3.select("#grafAdmissoesPorGeneroContainer")
            .append("svg")
            .attr("width", canvasWidth)
            .attr("height", canvasHeight);

        const chartGroup = svg.append("g") // so later u can apped the rects
            .attr("transform", `translate(${offsetX},${offsetY})`);

        // extract values for each axis
        const years = [...new Set(groupedData.map(d => d.year))].sort(d3.ascending);
        const genres = [...new Set(groupedData.map(d => d.genre))].sort(d3.ascending);




        // X AXIS
        const xAxis = d3.scaleBand()
            .domain(years)
            .range([0, graphWidth])
            .paddingInner(0.1)
            .paddingOuter(0.1);

        const xAxisGroup = chartGroup.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, -${lableDistance})`)
            .call(d3.axisTop(xAxis).tickFormat(d3.format("d")).tickSize(0));

        xAxisGroup.selectAll("path").style("display", "none"); // hide axis line
        xAxisGroup.selectAll(".tick text").style("font-size", `${lableFontSize}px`); // style tick labels

        // background rect behind x axis labels
        const axisBg = xAxisGroup.insert("rect", ":first-child")
            .attr("x", -110)
            .attr("y", -lableFontSize - lableDistance - 1)
            .attr("width", graphWidth + 110)
            .attr("height", lableFontSize + lableDistance * 2)
            .attr("fill", "#292929")
            .attr("opacity", 1)
            .style("display", "none");

        // hide everything above x axis labels
        xAxisGroup.insert("rect", ":first-child")
            .attr("x", -110)
            .attr("y", -canvasHeight) // start way above
            .attr("width", graphWidth + 110)
            .attr("height", canvasHeight - (lableFontSize + lableDistance))
            .attr("fill", "#292929")
            .attr("opacity", 1);



        // Y AXIS
        const yAxis = d3.scaleBand()
            .domain(genres)
            .range([0, graphHeight])
            .paddingInner(0.01)
            .paddingOuter(0.1);

        const yAxisGroup = chartGroup.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(-${lableDistance}, 0)`)
            .call(d3.axisLeft(yAxis).tickSize(0));

        yAxisGroup.selectAll("path").style("display", "none");
        yAxisGroup.selectAll(".tick text")
            .style("font-size", `${lableFontSize}px`);




        // DRAW SEATS
        chartGroup.selectAll("rect")
            .data(groupedData)
            .enter()
            .append("rect")
            .attr("x", d => xAxis(d.year) + (xAxis.bandwidth() / 2) - (seatWidth / 2))
            .attr("y", d => yAxis(d.genre) + (yAxis.bandwidth() / 2) - (seatHeight / 2))
            .attr("width", seatWidth)
            .attr("height", seatHeight)
            .attr("fill", d => colorScale(d.admissions))
            .attr("rx", 4) // rounded corners
            .attr("ry", 4);

        /*
        const printthing = [...new Set(groupedData.map(d => d.genre))].sort(d3.descending);
        printthing.forEach(g => console.log(g));
        */

        const scrollBar = document.getElementById("grafAdmissoesPorGeneroContainer");
        scrollBar.style.overflowY = "auto";

        const container = document.getElementById("grafAdmissoesPorGeneroContainer");

        container.addEventListener("scroll", () => {
            const scrollTop = container.scrollTop; // how many px

            // pin axis to top of visible area but dont let it drift past the graph
            const yPinned = Math.min(scrollTop, graphHeight) - lableDistance;
            xAxisGroup.attr("transform", `translate(0, ${yPinned})`);

            // show background only when axis overlaps the grid
            if (scrollTop > 0) {
                axisBg.style("display", "block");
            } else {
                axisBg.style("display", "none");
            }
        });

        // actually move the axis ("sticky")
        chartGroup.node().appendChild(xAxisGroup.node());

        seatHover(chartGroup.selectAll("rect"), seatWidth, seatHeight, chartGroup);
    });
}

function drawCompactGraph() {
    canvasHeight = 1080;
    canvasWidth = 1080;
    padding = 70;
    graphWidth = 650;
    graphHeight = 550;

    seatHeight = 15;
    seatWidth = 25;

    lableFontSize = 14;
    let lableDistance = 10;
    const offsetX = ((canvasWidth - graphWidth) / 2) + 45;
    const offsetY = lableFontSize + lableDistance * 2;

    d3.csv("dados/dadosFilmes.csv", d => ({
        year: +d.Year,
        genre: d.Genre.split(",").map(g => g.trim()), // split strings with multiple genres so genre is an array in some movies
        admissions: +d.Admissions

    })).then(dataset => { // make sure to wait for data to load
        let flatData = dataset.flatMap(d => // so we dont get an array of arrays
            d.genre
                .filter(g => !excludedGenres.includes(g))  //ignore unwanted genres
                .map(g => ({
                    year: d.year,
                    genre: g,
                    admissions: d.admissions
                }))
        );

        let groupedData = d3.rollups(
            flatData,
            v => d3.sum(v, d => d.admissions),  // aggregate admissions--------
            // v is the group of rows with the same year and genre
            // d is a single row in that group
            // and yeah d.admissions is making it numeric

            d => d.year,                        //group by year
            d => d.genre                        //then by genre

        ).flatMap(([year, genres]) =>
            genres.map(([genre, admissions]) => ({ year, genre, admissions }))
        );

        const colorScale = d3.scaleSequential()
            .domain([0, d3.max(groupedData, d => d.admissions)])
            .interpolator(d3.interpolateReds);

        svg = d3.select("#grafAdmissoesPorGeneroContainer")
            .append("svg")
            .attr("width", canvasWidth)
            .attr("height", canvasHeight);

        const chartGroup = svg.append("g") // so later u can apped the rects
            .attr("transform", `translate(${offsetX},${offsetY})`);

        // extract values for each axis
        const years = [...new Set(groupedData.map(d => d.year))].sort(d3.ascending);
        const genres = [...new Set(groupedData.map(d => d.genre))].sort(d3.ascending);




        // X AXIS
        const xAxis = d3.scaleBand()
            .domain(years)
            .range([0, graphWidth])
            .paddingInner(0.1)
            .paddingOuter(0.1);

        const xAxisGroup = chartGroup.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(20, -25)`)
            .call(d3.axisTop(xAxis).tickFormat(d3.format("d")).tickSize(0));

        xAxisGroup.selectAll("path").style("display", "none"); // hide axis line
        xAxisGroup.selectAll(".tick text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", `${lableFontSize}px`); // style tick labels



        // Y AXIS
        const yAxis = d3.scaleBand()
            .domain(genres)
            .range([0, graphHeight])
            .paddingInner(0.01)
            .paddingOuter(0.1);

        const yAxisGroup = chartGroup.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(-${lableDistance}, 0)`)
            .call(d3.axisLeft(yAxis).tickSize(0))
            .selectAll("path")
            .style("display", "none");

        yAxisGroup.selectAll(".tick text")
            .style("font-size", `${lableFontSize}px`);




        // DRAW SEATS
        chartGroup.selectAll("rect")
            .data(groupedData)
            .enter()
            .append("rect")
            .attr("x", d => xAxis(d.year) + (xAxis.bandwidth() / 2) - (seatWidth / 2))
            .attr("y", d => yAxis(d.genre) + (yAxis.bandwidth() / 2) - (seatHeight / 2))
            .attr("width", seatWidth)
            .attr("height", seatHeight)
            .attr("fill", d => colorScale(d.admissions))
            .attr("rx", 4) // rounded corners
            .attr("ry", 4);

        const scrollBar = document.getElementById("grafAdmissoesPorGeneroContainer");
        scrollBar.style.overflowY = "hidden";

        /*
        const printthing = [...new Set(groupedData.map(d => d.genre))].sort(d3.descending);
        printthing.forEach(g => console.log(g));
        */

        seatHover(chartGroup.selectAll("rect"), seatWidth, seatHeight, chartGroup);
    });
}

function seatHover(selection, seatWidth, seatHeight, chartGroup) {
    selection
        .on("mouseover", function (event, d) {
            const x = +d3.select(this).attr("x");
            const y = +d3.select(this).attr("y");

            // draw two crossing lines
            d3.select(this.parentNode).append("line")
                .attr("class", "hover-x")
                .attr("x1", x + 10)
                .attr("y1", y + 6)
                .attr("x2", x + seatWidth - 10)
                .attr("y2", y + seatHeight - 6)
                .attr("stroke", "blue")
                .attr("stroke-width", 4)
                .attr("stroke-linecap", "round");

            d3.select(this.parentNode).append("line")
                .attr("class", "hover-x")
                .attr("x1", x + seatWidth - 10)
                .attr("y1", y + 6)
                .attr("x2", x + 10)
                .attr("y2", y + seatHeight - 6)
                .attr("stroke", "blue")
                .attr("stroke-width", 4)
                .attr("stroke-linecap", "round");

            // highlight axis labels
            chartGroup.selectAll(".x-axis .tick text")
                .filter(t => t === d.year)
                .style("fill", "red");

            chartGroup.selectAll(".y-axis .tick text")
                .filter(t => t === d.genre)
                .style("fill", "red");

        })
        .on("mouseout", function (event, d) {
            d3.select(this.parentNode).selectAll(".hover-x").remove();

            // reset axis labels
            chartGroup.selectAll(".x-axis .tick text")
                .filter(t => t === d.year)
                .style("fill", "whitesmoke");

            chartGroup.selectAll(".y-axis .tick text")
                .filter(t => t === d.genre)
                .style("fill", "whitesmoke");

        });
}