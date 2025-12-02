(async function() {
  try {
    const res = await fetch("data.json");
    const rootData = await res.json();

    const width = 800, height = 600;
    const treeLayout = d3.tree().size([width - 100, height - 200]);
    const root = d3.hierarchy(rootData);
    treeLayout(root);

    const svg = d3.select("#memoryTree")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(60,60)");

    // Draw links
    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#8a8a8a")
      .attr("stroke-width", 2)
      .attr("d", d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y));

    // Draw nodes
    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("r", 8)
      .attr("fill", d => d.children ? "#4caf50" : "#2196f3");

    node.append("text")
      .attr("dy", -12)
      .attr("text-anchor", "middle")
      .style("font-family", "sans-serif")
      .style("font-size", "14px")
      .style("cursor", d => d.data.url ? "pointer" : "default")
      .style("fill", "#333")
      .text(d => d.data.name)
      .on("click", (e, d) => {
        if (d.data.url) window.open(d.data.url, "_blank");
      });

  } catch (err) {
    console.error("Error loading data:", err);
  }
})();
