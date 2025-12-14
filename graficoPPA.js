let datasetPPA;
let svgPPA
let canvasHeightPPA, canvasWidthPPA, paddingPPA, graphWidthPPA, graphHeightPPA;
const excludedCountries = ["(em branco)", "N/D", ""];

window.addEventListener("load", function () {
    graficoPPA();
});

function graficoPPA() {
    canvasHeightPPA = 600;
    canvasWidthPPA = 1280;
    paddingPPA = 70;
    graphWidthPPA = 1000;
    graphHeightPPA = 500;

    d3.csv("dados/dadosFilmes.csv", d => ({
        year: +d.Year,
        country: d.Country.split(",").map(g => g.trim()), // split strings with multiple countries so country is an array in some movies
        admissions: +d.Admissions

    })).then(datasetPPA => {
        let flatData = datasetPPA.flatMap(d => // so we dont get an array of arrays
            d.country
                .filter(g => !excludedCountries.includes(g))  //ignore unwanted countries
                .map(g => ({
                    year: d.year,
                    country: g,
                    admissions: d.admissions
                }))
        );

        let groupedData = d3.rollups(
            flatData,
            v => d3.sum(v, d => d.admissions),  // aggregate admissions--------
            // v is the group of rows with the same year and country
            // d is a single row in that group
            // and yeah d.admissions is making it numeric

            d => d.year,                        //group by year
            d => d.country                      //then by country

        ).flatMap(([year, countries]) =>
            countries.map(([country, admissions]) => ({ year, country, admissions }))
        );

        svgPPA = d3.select("#grafPaisesPorAno")
            .append("svg")
            .attr("width", canvasWidthPPA)
            .attr("height", canvasHeightPPA);




        // extract values for each axis
        const years = [...new Set(groupedData.map(d => d.year))].sort(d3.ascending);
        const maxAdmissions = d3.max(groupedData, d => d.admissions);
        const countries = d3.groups(groupedData, d => d.country);

        // X AXIS
        const yearExtent = d3.extent(years);
        const xAxis = d3.scaleLinear()
            .domain([yearExtent[0] - 0.5, yearExtent[1] + 0.5]) // extend by 1 year on each side
            .range([0, graphWidthPPA]);

        svgPPA.append("g")
            .attr("transform", `translate(${paddingPPA}, ${graphHeightPPA + paddingPPA})`)
            .call(
                d3.axisBottom(xAxis)
                    .tickFormat(d3.format("d"))
                    .tickValues(years)   // or filter years if too many
            );

        // Y AXIS
        const yAxis = d3.scaleLinear()
            .domain([0, 16000000])   // extend domain to the next "round" number
            .range([graphHeightPPA, 0]);

        svgPPA.append("g")
            .attr("transform", `translate(${paddingPPA}, ${paddingPPA})`)
            .call(d3.axisLeft(yAxis));





        // create the lines
        const line = d3.line()
            .x(d => xAxis(d.year) + paddingPPA)
            .y(d => yAxis(d.admissions) + paddingPPA);

        svgPPA.append("g")
            .attr("transform", `translate(${paddingPPA}, ${paddingPPA})`)
            .call(d3.axisLeft(yAxis));

        countries.forEach(([country, values], i) => {
            svgPPA.append("path")
                .datum(values.sort((a, b) => d3.ascending(a.year, b.year)))
                .attr("fill", "none")
                .attr("stroke", d3.schemeReds[9][i % 9])
                .attr("stroke-width", 2)
                .attr("class", "line-" + country.replace(/\s+/g, "_"))
                .attr("d", line);
        });

        //create overlay for hoovering a line
        const lineOverlay = svgPPA.append("g")
            .attr("id", "lineTooltip")
            .style("visibility", "hidden");

        // just the background
        const overlayBg = lineOverlay.append("rect")
            .attr("fill", "#353535")
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("opacity", 0.8);

        const overlayText = lineOverlay.append("text")
            .style("font-size", "14px")
            .style("font-family", "Lexend")
            .style("fill", "whitesmoke")
            .attr("x", 5)
            .attr("y", 15);


        // color scheme
        countries.forEach(([country, values], i) => {
            const color = d3.schemeReds[9][i % 9];
            const lineClass = "line-" + country.replace(/\s+/g, "_");

            svgPPA.append("path")
                .datum(values.sort((a, b) => d3.ascending(a.year, b.year)))
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", 2)
                .attr("class", lineClass)
                .attr("d", line)

                // INTERACTION FOR WHEN U HOVER A LINE -------------------------------
                .on("mouseover", function () {
                    // bring line to front
                    d3.select(this)
                        .raise()
                        .transition().duration(200)
                        .attr("stroke-width", 5)
                        .attr("stroke", "orange");

                    overlayText.text(country);

                    // measure text size
                    overlayBg
                        .attr("x", 0 - 8)
                        .attr("y", 0 - 4)
                        .attr("width", 100 + 8 * 2)   // fixed width
                        .attr("height", 20 + 4 * 2);

                    lineOverlay.style("visibility", "visible");
                })
                .on("mousemove", function (event) {
                    // move label with mouse
                    lineOverlay.attr("transform", `translate(${event.offsetX + 10}, ${event.offsetY - 10})`);
                })
                .on("mouseout", function () {
                    d3.select(this)
                        .transition().duration(200)
                        .attr("stroke-width", 2)
                        .attr("stroke", color);

                    lineOverlay.style("visibility", "hidden");
                });
        });




        // ------------- FILTERING MENU SECTION -------------- //



        // create the menu
        const filterMenu = d3.select("#grafPaisesPorAno")
            .append("div")
            .attr("id", "filterMenu")
            .style("margin-top", "20px");

        // toggle button
        const toggleButton = filterMenu.append("button")
            .text("Show Filter")
            .style("padding", "6px 12px")
            .style("border", "none")
            .style("border-radius", "12px")
            .style("font-family", "Lexend")
            .style("color", "whitesmoke")
            .style("background", "#353535")
            .style("cursor", "pointer");

        // the actual menu
        const menuContainer = filterMenu.append("div")
            .attr("id", "menuContainer")
            .style("margin-top", "10px")
            .style("padding", "12px")
            .style("border", "none")
            .style("border-radius", "6px")
            .style("color", "whitesmoke")
            .style("background", "#353535")
            .style("width", "320px")
            .style("display", "none"); // start hidden

        menuContainer.append("label")
            .text("Select countries to display:")
            .style("display", "block")
            .style("margin-bottom", "8px");

        // ccrollable list of checkboxes
        const list = menuContainer.append("div")
            .style("max-height", "200px")
            .style("overflow-y", "auto")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("gap", "5px");

        countries.forEach(([country], i) => {
            const color = d3.schemeReds[9][i % 9]; // 9 colors in the scheme preset
            const lineClass = ".line-" + country.replace(/\s+/g, "_"); // this makes a class for each country line

            const item = list.append("label")
                .style("display", "flex")
                .style("align-items", "center")
                .style("cursor", "pointer");

            item.append("input")
                .attr("type", "checkbox")
                .property("checked", true)
                .on("change", function () {
                    const checked = this.checked;

                    if (checked) {
                        d3.selectAll(lineClass).style("display", null);   // show
                    } else {
                        d3.selectAll(lineClass).style("display", "none"); // hide
                    }
                });

            item.append("span")
                .style("margin-left", "5px")
                .style("color", color)
                .style("font-size", "12px")
                .text(country);
        });

        // buttons for selecting all or none
        const buttonContainer = menuContainer.append("div")
            .style("margin-top", "10px")
            .style("display", "flex")
            .style("gap", "10px");

        buttonContainer.append("button")
            .text("Select All")
            .style("padding", "5px 10px")
            .style("border", "none")
            .style("border-radius", "4px")
            .style("font-family", "Lexend")
            .style("color", "whitesmoke")
            .style("background", "#202020")
            .style("cursor", "pointer")
            .on("click", () => {
                list.selectAll("input").property("checked", true).dispatch("change");
            });

        buttonContainer.append("button")
            .text("Deselect All")
            .style("padding", "5px 10px")
            .style("border", "none")
            .style("border-radius", "4px")
            .style("font-family", "Lexend")
            .style("color", "whitesmoke")
            .style("background", "#202020")
            .style("cursor", "pointer")
            .on("click", () => {
                list.selectAll("input").property("checked", false).dispatch("change");
            });

        // toggle logic
        toggleButton.on("click", function () {
            let isHidden;

            if (menuContainer.style("display") == "none") {
                isHidden = true;
            } else {
                isHidden = false;
            }

            if (isHidden) {
                menuContainer.style("display", "block");
                toggleButton.text("Hide Filter");
            } else {
                menuContainer.style("display", "none");
                toggleButton.text("Show Filter");
            }
        });
    });
}