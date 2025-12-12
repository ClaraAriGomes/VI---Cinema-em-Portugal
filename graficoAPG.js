let svg;
let canvasHeight, canvasWidth, padding, graphWidth, graphHeight;
let dataset;
let year = [];
let genre = [];

window.onload = function () {
    canvasHeight = 980;
    canvasWidth = 1280;
    padding = 60;
    graphWidth = canvasWidth - padding * 2;
    graphHeight = canvasHeight - padding * 2;

    //filter the data for this graph
    d3.csv("dados/dadosFilmes.csv", d => {
        return {
            year: +d.Year,
            genre: d.Genre,
            admissions: +d.Admissions
        };

    }).then(dataset => {
        let groupedData = d3.rollups(dataset,
            v => d3.sum(v, d => d.admissions),  //aggregate admissions
            d => d.year,                        //group by year
            d => d.genre                        //then by genre

            /*
            So this looks somethiing like:
            [
                [2020, [
                        ['Action', 50000],
                        ['Comedy', 30000],
                        ...
                       ]
                ],
                [2020, [
                        ['Action', 50000],
                        ['Comedy', 30000],
                        ...
                       ]
                ],
                ...
            ]
            */

        ).flatMap(([year, genres]) =>
            genres.map(([genre, admissions]) => ({ 
                year, 
                genre, 
                admissions 
            }))

            /*
            ...and now:
            [
                { year: 2020, genre: 'Action', admissions: 50000 },
                { year: 2020, genre: 'Comedy', admissions: 30000 },
                ... 
            ]
            */
        );
    });

    // now create the actual graph/svg
    svg = d3.select("#grafAdmissoesPorGenero")
        .append("svg")
        .attr("width", canvasWidth)
        .attr("height", canvasHeight);


    /*TODO
    - define axes
    - map data to the grid using scales
    - define color encodings
    - draw cells at the right position
    - add legend and labels
    - think about interactivity (tooltip, highlight on hover, ...)
    */
}