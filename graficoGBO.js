//ADICIONAR TITULOS AOS EIXOS
//LIMPAR CODIGO XXXXXXXXXXXXXXXXXXXXXXXXXx
//VER INTERATIVIDADE
//REDUZIR NUMEROS PARA 80
//adicionar interatividade com ver os numeros e maybe se clicar top filmes desse ano???
let svg;
let canvasHeight, canvasWidth, padding, graphWidth, graphHeight;
let dadosGBO;


window.onload = function () {
  //graph general attributes
  canvasHeight = 650;
  canvasWidth = 1000;
  padding = 100;
  graphWidth = canvasWidth - padding * 2;
  graphHeight = canvasHeight - padding * 2;

  //variável pros nossos dados neste gráfico
  dadosGBO = "/dados/dadosFilmes.csv";

  //pôr o svg do graph no main nesta div especifica
  svg = d3
    .select("#grafLinhasEspectadores")
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



//trabalhar mais a partir daqui arrumar codigo

function rollups(data) {
  //agrupar com rollups o gbo por ano (rollups para somar)
  let total = d3.rollups(data,(v) => d3.sum(v, (d) => d.gbo),(d) => d.year
  );

  //console.log(total);

  let dataset = total.map((d) => ({ year: d[0], totalGross: d[1]}));

  let chart = svg
    .append("g")
    .attr("transform", `translate(${padding}, ${padding})`);

  //Add X axis
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
    .attr("x", graphWidth)
    .attr("y", graphHeight)
    .text("YEAR");

  // Add Y axis
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
    .attr("x", 0)
    .attr("y", 0)
    .text("GBO em milhões");



  // Add the line
  chart
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
}

function draw_graph() {}
