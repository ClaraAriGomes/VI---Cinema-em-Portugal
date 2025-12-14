let svg;
let canvasHeight, canvasWidth, padding, graphWidth, graphHeight;
let dadosLocal;
const portugalMap = "dados/portugal_mapa_concelhos.geojson";


export function graph1() {
  Promise.all([
    d3.json(portugalMap),
    d3.csv("/dados/dadosLocal.csv", d3.autoType)
  ]).then(([mapData, csvData]) => {
    dadosLocal = csvData;
    draw_map(mapData);
    updateMap(2004); // initial year
  });

  canvasHeight = 700;
  canvasWidth = 1280;
  padding = 60;
  graphWidth = canvasWidth - padding * 2;
  graphHeight = canvasHeight - padding * 2;
}



const colorScale = d3.scaleThreshold()
  .domain([1000, 5000, 10000, 50000, 100000, 500000])
  .range(d3.schemeBlues[7]);

function getAdmissionsByDistrict(year) {
  const filtered = dadosLocal.filter(d => d.Year === year);

  const rolled = d3.rollup(
    filtered,
    v => d3.sum(v, d => d.Admissions),
    d => d.District
  );

  return rolled; // Map: District → Admissions
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

function updateMap(year) {
  const admissionsMap = getAdmissionsByDistrict(year);

  svg.selectAll(".mainland")
    .transition()
    .duration(500)
    .attr("fill", d => {
      const name = d.properties.NAME_1; // municipality name in GeoJSON
      const value = admissionsMap.get(name) || 0;
      return value === 0 ? "#eee" : colorScale(value);
    });
}