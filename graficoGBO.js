//LIMPAR CODIGO XXXXXXXXXXXXXXXXXXXXXXXXX
//VER INTERATIVIDADE
//adicionar interatividade com ver os numeros e maybe se clicar top filmes desse ano???
//adicionar comewntario de recaida grande devido a pandemia
//adicionar tooltip
//adicionar animacao aos pontos
let svg;
let canvasHeight, canvasWidth, padding, graphWidth, graphHeight;
let dadosGBO;

window.onload = function () {
  //graph general attributes
  canvasHeight = 650;
  canvasWidth = 1280; //Manter este tamanho para os gráficos
  padding = 100;
  graphWidth = canvasWidth - padding * 2;
  graphHeight = canvasHeight - padding * 2;

  //variável pros nossos dados neste gráfico
  dadosGBO = "/dados/dadosFilmes.csv";

  //TOOLTIP DA AULA
  //create a tooltip, so later we make it visible with the data information
  d3.select("#grafLinhasReceitas")
    .append("div")
    .style("opacity", "0") // it's hidden
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("position", "absolute")
    .style("border", "solid")
    .style("padding", "2px");

  //pôr o svg do graph no main nesta div especifica
  svg = d3
    .select("#grafLinhasReceitas")
    .append("svg")
    .attr("width", canvasWidth)
    .attr("height", canvasHeight);

  //Read the data
  d3.csv(dadosGBO, (d) => {
    return {
      //Aqui é definir os dados que vamos trabalhar e dar um jeitinho
      year: +d.Year,
      gbo: parseFloat(d["Gross Box Office"].replace(",", ".")) / 1000000,
    };
  }).then(rollups);
};

function rollups(data) {
  //agrupar com rollups o gbo por ano (rollups para somar)
  let total = d3.rollups(
    data,
    (v) => d3.sum(v, (d) => d.gbo),
    (d) => d.year
  );

  //console.log(total);

  let dataset = total.map((d) => ({ year: d[0], totalGross: d[1] }));

  draw_graph(dataset);
}

//FUNCAO PARA DESENHAR COISAS SÓ
function draw_graph(dataset) {
  let chart = svg
    .append("g")
    .attr("transform", `translate(${padding}, ${padding})`);

  //============ X axis ============
  let x = d3
    .scaleLinear()
    .domain(d3.extent(dataset, (d) => d.year))
    .range([0, graphWidth]);

  chart
    .append("g") // g é um elemento do svg para agrupar elementos
    .attr("transform", `translate(0, ${graphHeight})`)
    .call(d3.axisBottom(x).ticks(21).tickFormat(d3.format("d")));

  //texto do Eixo X
  chart
    .append("text")
    .style("text-anchor", "start")
    .style("fill", "white")
    .attr("x", graphWidth - 15)
    .attr("y", graphHeight + 40)
    .text("Ano");

  //============ Y axis ============
  let y = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.totalGross)])
    .range([graphHeight, 0]);
  chart.append("g").call(d3.axisLeft(y));

  //texto do Eixo Y
  chart
    .append("text")
    .style("text-anchor", "end")
    .style("fill", "white")
    .attr("x", 65)
    .attr("y", -20)
    .text("GBO em milhões");

  // Add the line
  const path = chart
    .append("path")
    .datum(dataset)
    .attr("fill", "none")
    .attr("stroke", "rgba(120, 176, 231, 1)")
    .attr("stroke-width", 2)
    .attr(
      "d",
      d3
        .line()
        .x((d) => x(d.year))
        .y((d) => y(d.totalGross))
    );

  const totalLength = path.node().getTotalLength(); //o node é para tipo apanhar o primeiro ponto

  //aqui brincar com o path
  path
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(2000)
    .ease(d3.easeQuadInOut)
    .attr("stroke-dashoffset", 0);



  //========PONTOS AO LONGO DA LINHA========
  //pontos
  const circle = d3.symbol().type(d3.symbolCircle).size(70);
  //estrelinhas
  const star = d3.symbol().type(d3.symbolStar).size(170);

  //assinalar pontos de cada ano
  chart
    .selectAll(".dots")
    .data(dataset)
    .join((enter) => enter.append("path"))
    .attr("d", circle)
    .attr("transform", (d) => `translate(${x(d.year)}, ${y(d.totalGross)})`) //.attr("cx", d => x(d.year))
    .attr("fill", "rgba(120, 176, 231, 1)");


  //assinalar ano máximo
  const max = d3.greatest(dataset, (d) => d.totalGross);

  chart
    .append("path")
    .attr("d", star)
    .attr("fill", "rgba(246, 254, 0, 1)")
    .attr("transform", `translate(${x(max.year)}, ${y(max.totalGross)})`); //.attr("cx", d => x(d.year))

  
  //Animação dos pontos
  



  //========Tooltip========
  //tooltip da aula
  const tooltip = d3.select(".tooltip");

  /*


chart.selectAll(".dot")
  .data(dataset)
  .enter()
  .append("circle")
  .attr("class", "dot")
  .attr("cx", d => x(d.year))
  .attr("cy", d => y(d.totalGross))
  .attr("r", 4)
  .attr("fill", "rgba(120, 176, 231, 1)")
  .on("mouseover", function (e, d) {
    d3.select(this)
      .attr("r", 6)
      .attr("fill", "orange");

    tooltip
      .style("opacity", 1)
      .html(
        `<strong>${d.year}</strong><br/>
         ${d.totalGross.toFixed(1)} M`
      );
  })
  .on("mousemove", function (e) {
    tooltip
      .style("left", (e.pageX + 10) + "px")
      .style("top", (e.pageY - 10) + "px");
  })
  .on("mouseout", function () {
    d3.select(this)
      .attr("r", 4)
      .attr("fill", "rgba(120, 176, 231, 1)");

    tooltip.style("opacity", 0);
  });
*/
}
