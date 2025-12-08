//código para o gráfico de linhas relativo ao GBO por ano
let svg;
let canvasHeight, canvasWidth, padding, graphWidth, graphHeight;
let movies;
let year = [];

window.onload = function() {
    // graph general attributes - mudar
     canvasHeight = 980;
     canvasWidth = 1280;
     padding = 60;
     graphWidth = canvasWidth - padding * 2;
     graphHeight = canvasHeight - padding * 2;

    movies = "dados/dadosFilmes.csv";

    // create a tooltip, so later we make it visible with the data information
    d3.select('main').append("div")
        .style("opacity", '0') // it is hidden
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style('position', 'absolute')
        .style("border", "solid")
        .style('padding', '2px');

    // new svg element
    svg = d3.select('main')
        .append('svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight);


    //coisas dos dadosss
     d3.csv(movies, d => {
    //console.log(d.Year);
        return {
            year: +d.Year, // make this entry a number +d is to make it a number i think
           // pop: (d.Popularity) ? +d.Popularity : -1, // for empty values, replace with -1. if there is data, retrieve as numver, if not, as -1
          //  awards: d.Awards,
           // genre: d.Subject
        }
    }).then(graph); 
}    

function graph (data) {

    //É preciso converter os nossos valores para somar ent tipo 102,78 para 102.78
    data.forEach(d => {
        d.GBO = parseFloat(d["Gross Box Office"].replace(",", ".")); //GBO para Gross Box Office
    });
  

    //Agrupar o total por ano. https://observablehq.com/@d3/d3-group
    let total = d3.rollups(data, v => d3.sum(v, d => d.GBO), d => d.Year); //v para value??? check no d3
 
 
    //console.log(d.GBO)
}