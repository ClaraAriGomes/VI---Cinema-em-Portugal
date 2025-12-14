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



    // new svg element
    const svg = d3.select('#grafEspectadoresLocal')
        .append('svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight);


        
    // Projection focused on Portugal
    const projection = d3.geoMercator()
        .fitSize([canvasWidth, canvasHeight], data); // auto-zoom to Portugal

    const path = d3.geoPath().projection(projection);



    // Draw municipalities
    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#69b3a2")
        .attr("stroke", "white")
        .attr("stroke-width", 0.5);
        

        
}





