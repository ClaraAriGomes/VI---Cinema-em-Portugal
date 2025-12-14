let svg;
let canvasHeight, canvasWidth, padding, graphWidth, graphHeight;
let dadosLocal;
const portugalMap = "dados/portugal_mapa_concelhos.geojson";


export function graph1() {
  d3.json(portugalMap).then(draw_map);

   //graph general attributes
   canvasHeight = 700;
   canvasWidth = 1280; //Manter este tamanho para os gráficos
   padding = 60;
   graphWidth = canvasWidth - padding * 2;
   graphHeight = canvasHeight - padding * 2;

   //variáveis para os nossos dados neste gráfico
  dadosLocal = "/dados/dadosLocal.csv";
}






//FUNCAO PARA DESENHAR COISAS SÓ
function draw_map(data) {

  //pegar só no continente
  const mainland = data.features.filter(
    (d) => !["Açores", "Madeira"].includes(d.properties.NAME_1)
  );

  //pegar só nas ilhas
  const islands = data.features.filter((d) =>
    ["Açores", "Madeira"].includes(d.properties.NAME_1)
  );

  // new svg element
svg = d3
    .select("#grafEspectadoresLocal")
    .append("svg")
    .attr("width", canvasWidth)
    .attr("height", canvasHeight);

  //CONTINENTE
  const projectionMainland = d3
    .geoMercator()
    .fitSize([graphWidth, graphHeight], {
      type: "FeatureCollection",
      features: mainland,
    });

  const pathprojectionMainland = d3.geoPath().projection(projectionMainland);

  //ILHAS
  const projectionislands = d3
    .geoMercator()
    .fitSize([canvasWidth, canvasHeight], {
      type: "FeatureCollection",
      features: islands,
    });

  const pathprojectionislands = d3.geoPath().projection(projectionislands);

  const gMainland = svg
    .append("g")
    .attr("transform", "translate(550, 50)"); // move right

  //CORES E TAL
  gMainland
    .selectAll(".mainland")
    .data(mainland)
    .enter()
    .append("path")
    .attr("class", "mainland")
    .attr("d", pathprojectionMainland)
    .attr("fill", "#008364ff")
    .attr("stroke", "white")
    .attr("stroke-width", 0.5);

  const gIslands = svg
    .append("g")
    .attr("transform", "translate(-290, 50)"); // move left
  gIslands
    .selectAll(".islands")
    .data(islands)
    .enter()
    .append("path")
    .attr("class", "islads")
    .attr("d", pathprojectionislands)
    .attr("fill", "#cf2b99ff")
    .attr("stroke", "white")
    .attr("stroke-width", 0.5);

  /*
    // Draw municipalities
    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#69b3a2")
        .attr("stroke", "white")
        .attr("stroke-width", 0.5);
        */
}
