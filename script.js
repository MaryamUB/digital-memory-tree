(async function() {
  try {
    const res = await fetch("data.json");
    const rootData = await res.json();

    const width = 1000, height = 700;
    const treeLayout = d3.tree().size([height - 80, width - 160]);
    const root = d3.hierarchy(rootData);
    treeLayout(root);

    const svg = d3.select("#memoryTree")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(80,40)");

    svg.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("fill", "none")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 1.5)
      .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x));

    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle").attr("r", 6).attr("fill", "#4caf50");

    node.append("text")
      .attr("dy", 3)
      .attr("x", d => d.children ? -10 : 10)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)
      .style("cursor", "pointer")
      .on("click", (e, d) => {
        if (d.data.url) window.open(d.data.url, "_blank");
      });
  } catch (err) {
    console.error("Error loading data:", err);
  }
})();
