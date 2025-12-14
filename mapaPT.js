let svg, tooltip;
let geoData, csvData;
let years, admissionsByYear;
let colorScale;

//=============================
//  Graph General Attributes
//=============================
const canvas = {
  width: 1280,
  height: 700,
  padding: 60,
};

const portugalMap = "dados/portugal_mapa_concelhos.geojson";
const dadosLocal = "dados/dadosLocal.csv";

export async function graph1() {
  const [geo, rawText] = await Promise.all([
    d3.json(portugalMap),
    d3.text(dadosLocal),
  ]);

  geoData = geo;

  csvData = d3.dsvFormat(";").parse(rawText, (d) => ({
    Year: +d.Year,
    District: d.District?.trim(),
    Admissions: +d.Admissions,
  }));

  //Rollup pras admissions e usar os distritoss
  admissionsByYear = d3.rollup(
    csvData,
    (v) => d3.sum(v, (d) => d.Admissions),
    (d) => d.Year,
    (d) => d.District
  );

  years = Array.from(admissionsByYear.keys()).sort((a, b) => a - b);

  colorScale = d3
    .scaleLinear()
    .domain([10000, 20000, 50000 , 500000, 2000000, 2000000, 3000000, 6000000])
    .range(d3.schemeBlues[9])
    .clamp(true);

  svgGraph();
  drawMap();
  addSlider();
}


function svgGraph() {
  svg = d3
    .select("#grafEspectadoresLocal")
    .append("svg")
    .attr("width", canvas.width)
    .attr("height", canvas.height);

  tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(0,0,0,0.7)")
    .style("color", "white")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("opacity", 0);
}

//=============================
//      Desenho do Mapa
//=============================

function drawMap() {
  const mainland = geoData.features.filter(
    (d) => !["Açores", "Madeira"].includes(d.properties.NAME_1)
  );

  const islands = geoData.features.filter((d) =>
    ["Açores", "Madeira"].includes(d.properties.NAME_1)
  );

  drawRegion(mainland, 550, 50, "mainland");
  drawRegion(islands, -290, 50, "islands");

  updateMap(years[0]);
  addLegend();
}

function drawRegion(features, tx, ty, className) {
  const projection = d3
    .geoMercator()
    .fitSize(
      [canvas.width - 2 * canvas.padding, canvas.height - 2 * canvas.padding],
      { type: "FeatureCollection", features }
    );

  const path = d3.geoPath().projection(projection);

  const g = svg.append("g").attr("transform", `translate(${tx}, ${ty})`);

  g.selectAll("path")
    .data(features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", className)
    .attr("stroke", "#ffffffff")
    .attr("stroke-weight", "0.25")
    .on("mousemove", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(
          `
          <strong>${d.properties.NAME_1}</strong><br/>
          Admissions: ${d.properties.value || 0}
        `
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => tooltip.style("opacity", 0));
}

/* ---------------- Update Map ---------------- */

function updateMap(year) {
  const data = admissionsByYear.get(year) || new Map();

  svg
    .selectAll(".mainland, .islands")
    .transition()
    .duration(500)
    .attr("fill", (d) => {
      const district = d.properties.NAME_1;
      const value = data.get(district) ?? 0;
      d.properties.value = value;
      return colorScale(value);
    });
}

//=============================
//            Slider
//=============================

function addSlider() {
  const sliderWidth = 600;
  const sliderHeight = 50;

  const g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${canvas.padding}, ${canvas.height - sliderHeight})`
    );

  const x = d3.scaleBand().domain(years).range([0, sliderWidth]).padding(0.1);

  g.append("line")
    .attr("x1", 0)
    .attr("x2", sliderWidth)
    .attr("stroke", "#ddd")
    .attr("stroke-width", 6)
    .attr("stroke-linecap", "round");

  g.selectAll("text")
    .data(years)
    .enter()
    .append("text")
    .attr("x", (d) => x(d) + x.bandwidth() / 2)
    .attr("y", 20)
    .attr("text-anchor", "start")
    .attr("transform", (d) => {
      const cx = x(d) + x.bandwidth() / 2;
      const cy = 20;
      return `rotate(30, ${cx}, ${cy})`;
    })
    .style("font-size", "11px")
    .attr("fill","white")
    .text((d) => d);

  const handle = g
    .append("circle")
    .attr("r", 10)
    .attr("cx", x(years[0]) + x.bandwidth() / 2)
    .attr("fill", "#4be7c2ff");

  const label = g
    .append("text")
    .attr("y", -15)
    .attr("text-anchor", "middle")
    .text(years[0]);

  handle.call(
    d3.drag().on("drag", (event) => {
      const pos = Math.max(0, Math.min(sliderWidth, event.x));

      const year = years.reduce((a, b) =>
        Math.abs(x(b) + x.bandwidth() / 2 - pos) <
        Math.abs(x(a) + x.bandwidth() / 2 - pos)
          ? b
          : a
      );

      const cx = x(year) + x.bandwidth() / 2;
      handle.attr("cx", cx);
      label.attr("x", cx).text(year);
      updateMap(year);
    })
  );
}

//=============================
//  Legenda das cores do mapa
//=============================
function addLegend() {
  const legendWidth = 400;
  const legendHeight = 15;
  const numColors = 9;

  const colors = d3.schemeBlues[numColors];

  const g = svg.append("g")
    .attr(
      "transform",
      `translate(${canvas.width - legendWidth-40}, ${canvas.height - 50})`
    );

  /* ---------- Color blocks ---------- */
  const blockWidth = legendWidth / numColors;

  g.selectAll("rect.legend")
    .data(colors)
    .enter()
    .append("rect")
    .attr("class", "legend")
    .attr("x", (d, i) => i * blockWidth)
    .attr("width", blockWidth)
    .attr("height", legendHeight)
    .attr("fill", d => d);

  /* ---------- Axis (ticks centered) ---------- */
  const steps = [10000, 20000, 50000 , 500000, 2000000, 2000000, 3000000, 6000000];

  const scale = d3.scaleLinear()
    .domain([0, 6000000])
    .range([0, legendWidth]);

  g.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(
      d3.axisBottom(d3.scaleLinear().domain([0, steps.length]).range([0, legendWidth]))
        .tickValues(d3.range(steps.length))
        .tickFormat(i => steps[i])
        .tickSize(legendHeight)
    )
    .select(".domain")
    .remove();
}