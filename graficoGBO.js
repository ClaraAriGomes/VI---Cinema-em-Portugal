//ADICIONAR TITULOS AOS EIXOS
//LIMPAR CODIGO
//VER INTERATIVIDADE
//REDUZIR NUMEROS PARA 80 
//adicionar interatividade com ver os numeros e maybe se clicar top filmes desse ano???

window.onload = function () {
  // set the dimensions and margins of the graph
  const width = 1200;
  const height = 500;
  const marginTop = 20;
  const marginRight = 100;
  const marginBottom = 30;
  const marginLeft = 40;

  // append the svg object to the body of the page
  const svg = d3
    .select("#grafLinhasEspectadores")
    .append("svg")
    .attr("width", width + marginLeft + marginRight)
    .attr("height", height + marginTop + marginBottom)
    .append("g")
    .attr("transform", `translate(${marginLeft + 20},${marginTop})`);

  //Read the data
  d3.csv("/dados/dadosFilmes.csv",

    // When reading the csv, I must format variables:
    function (d) {
      return {
        year: d3.timeParse("%Y")(d.Year), //tenho que dizer que é ano
        gbo: parseFloat(d["Gross Box Office"].replace(",", ".")),
      };
    }
).then(
    // Now I can use this dataset:
    function (data) {
    let total = d3.rollups(data, v => d3.sum(v, d => d.gbo), d => d.year); 

    const dataset = total
        .map(d => ({ year: d[0], totalGross: d[1] }))

    // Add X axis --> it is a date format
      const x = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => d.year))
        .range([0, width-marginRight]);

      svg
        .append("g") // g é um elemento do svg para agrupar elementos
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(15));

      // Add Y axis
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(dataset, d => d.totalGross)])
        .range([height, 0]);
      svg.append("g").call(d3.axisLeft(y));

      // Add the line
      svg
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
  );
}