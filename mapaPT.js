export function graph1(){
        d3.json(portugalMap).then(draw_map);

}

const portugalMap = "dados/portugal_mapa_concelhos.geojson";


function draw_map(data) {
    //graph general attributes
   const  canvasHeight = 700;
   const  canvasWidth = 1280; //Manter este tamanho para os gráficos
   const  padding = 60;
   const  graphWidth = canvasWidth - padding * 2;
   const  graphHeight = canvasHeight - padding * 2;

const mainland = data.features.filter(d =>
  !["Açores", "Madeira"].includes(d.properties.regiao)
);

const islands = data.features.filter(d =>
  ["Açores", "Madeira"].includes(d.properties.regiao)
);

    // new svg element
    const svg = d3.select('#grafEspectadoresLocal')
        .append('svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight);

const projection = d3.geoMercator()
  .fitSize([canvasWidth, canvasHeight], {
    type: "FeatureCollection",
    features: mainland
  });

const path = d3.geoPath().projection(projection);

  /*      
    // Projection focused on Portugal
    const projection = d3.geoMercator()
        .fitSize([canvasWidth, canvasHeight], data); // auto-zoom to Portugal

    const path = d3.geoPath().projection(projection);
*/
svg.selectAll(".mainland")
  .data(mainland)
  .enter()
  .append("path")
  .attr("class", "mainland")
  .attr("d", path)
  .attr("fill", "#69b3a2")
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

        svg.selectAll(".islands")
  .data(islands)
  .enter()
  .append("path")
  .attr("class", "islands")
  .attr("d", path)
  .attr("fill", "#69b3a2")
  .attr("stroke", "white")
  .attr("stroke-width", 0.5)
  .attr("transform", "translate(250, 350) scale(1.8)");
}


