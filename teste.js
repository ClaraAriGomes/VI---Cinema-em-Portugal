/*-----------------------------------------------------------------------------------------------
ESTE CODIGO ERA SO EXEMPLO MAS TA TODO CRAZY - apagar e esta a ser refeito no graficoGBO.js
-----------------------------------------------------------------------------------------------*/
//this is to work with the csv file -> Não esquecer a pastaaaa
d3.csv("dados/dadosFilmes.csv").then(function(data) {

    console.log(data, d => d.Year);

    //É preciso converter os nossos valores para somar ent tipo 102,78 para 102.78
    data.forEach(d => {
        d.GBO = parseFloat(d["Gross Box Office"].replace(",", ".")); //GBO para Gross Box Office
    });

    //Agrupar o total por ano. https://observablehq.com/@d3/d3-group
    let total = d3.rollups(data, v => d3.sum(v, d => d.GBO), d => d.Year); //v para value??? check no d3

    //Convert rollup to array of objects sorted by year
    const dataset = total
        .map(d => ({ year: d[0], totalGross: d[1] }))


//Parte da construção do gráfico
    var svg = d3.select("svg"),
        margin = 200,
        width = svg.attr("width") - margin,
        height = svg.attr("height") - margin;

    var g = svg.append("g")
        .attr("transform", "translate(100,100)");

    // X scale → years
    var xScale = d3.scaleLinear()
        .domain(d3.extent(dataset, d => d.year))
        .range([0, width]);

    // Y scale → Gross
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, d => d.totalGross)])
        .range([height, 0]);

    // Axes
    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d"))); // no comma formatting

    g.append("g")
        .call(d3.axisLeft(yScale));

    // Title
    svg.append("text")
        .attr("x", width/2 + 100)
        .attr("y", 60)
        .attr("text-anchor", "middle")
        .style("font-family", "Helvetica")
        .style("font-size", 20)
        .text("Total Gross Box Office by Year");

    // Labels
    svg.append("text")
        .attr("x", width/2 + 100)
        .attr("y", height + 180)
        .attr("text-anchor", "middle")
        .style("font-family", "Helvetica")
        .style("font-size", 12)
        .text("Year");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(," + (height/2 + 100) + ")rotate(-90)")
        .style("font-family", "Helvetica")
        .style("font-size", 12)
        .text("Gross Box Office (€)");

    // Draw dots
    g.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.totalGross))
        .attr("r", 4)
        .style("fill", "#CC0000");

    // Line generator
    var line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.totalGross))
        .curve(d3.curveMonotoneX);

    // Draw line
    g.append("path")
        .datum(dataset)
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", "#db8181ff")
        .style("stroke-width", "2");
});
