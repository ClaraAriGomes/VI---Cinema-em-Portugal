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
    .style("background-color", "#292929")
    .style("position", "absolute")
    .style("padding", "10px")
    .style("display", "none");

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
    .call(d3.axisBottom(x).ticks(21).tickFormat(d3.format("d")))
    .style("font-size", "12px");

  //texto do Eixo X
  chart
    .append("text")
    .style("text-anchor", "middle")
    .style("fill", "white")
    .attr("x", graphWidth / 2)
    .attr("y", graphHeight + 40)
    .text("Ano");

  //============ Y axis ============
  let y = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.totalGross)])
    .range([graphHeight, 0]);

  chart.append("g").call(d3.axisLeft(y)).style("font-size", "12px");

  //texto do Eixo Y
  chart
    .append("text")
    .style("text-anchor", "middle")
    .style("fill", "white")
    .attr("x", -graphHeight / 2)
    .attr("y", -50)
    .attr("transform", "rotate(-90)")
    .text("Receita total ( milhões € )");

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
  //estrelinha
  const star = d3.symbol().type(d3.symbolStar).size(170);

  //===============TOOLTIP==================
  const tooltip = d3.select(".tooltip");

  //PONTOS DE CADA ANO
  chart
    .selectAll(".dots")
    .data(dataset)
    .join((enter) => enter.append("path"))
    .attr("d", circle)
    .attr("transform", (d) => `translate(${x(d.year)}, ${y(d.totalGross)})`)
    .attr("fill", "rgba(194, 221, 248, 1)")
    .style("cursor", "pointer")

    //======Eventos Tooltip(fazer antes das animações)==========
    .on("mouseover", function (event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("d", d3.symbol().type(d3.symbolCircle).size(500));

      tooltip
        .html(
          `${d.year}<br/>
         ${d.totalGross.toFixed(1)} M €`
        )
        .style("opacity", 0)
        .transition()
        .duration(500)
        .style("opacity", 1)
        .style("display", "block");
    })

    .on("mouseout", function (event) {
      d3.select(this)
        .transition()
        .duration(500)
        .attr("d", d3.symbol().type(d3.symbolCircle).size(70));
      tooltip.style("opacity", 0).style("display", "none");
    })

    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })

    //======Animações dos pontos======
    .attr("opacity", 0)
    .transition()
    .delay(2100)
    .attr("opacity", 1);

  //ESTRELINHA MÁXIMA
  const max = d3.greatest(dataset, (d) => d.totalGross);

  const starPath = chart
    .append("path")
    .attr("d", star)
    .attr("fill", "rgba(246, 254, 0, 1)")
    .attr("transform", `translate(${x(max.year)}, ${y(max.totalGross)})`)
    .style("cursor", "pointer")
    .attr("opacity", 0);

  // animação (depois da linha)
  starPath.transition().delay(2600).duration(500).attr("opacity", 1);

  starPath
    .on("mouseover", function (event) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("d", d3.symbol().type(d3.symbolStar).size(400));

      tooltip
        .html(
          `<strong>Ano com maior receita</strong><br/>
         ${max.year}<br/>
         ${max.totalGross.toFixed(1)} M €`
        )
        .style("opacity", 0)
        .style("display", "block")
        .transition()
        .duration(300)
        .style("opacity", 1);
    })

    .on("mouseout", function () {
      d3.select(this).transition().duration(300).attr("d", star);

      tooltip.style("opacity", 0).style("display", "none");
    })

    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    });

  chart
    .append("text")
    .style("text-anchor", "middle")
    .style("fill", "white")
    .attr("x", x(2020))
    .attr("y", y(10))
    .text("Pandemia COVID-19")
    .style(
      "font-family",
      "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
    )
    .attr("opacity", 0)
    .transition()
    .delay(1200)
    .attr("opacity", 1);
}
