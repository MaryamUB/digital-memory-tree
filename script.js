(async function () {
  try {
    const res = await fetch("data.json");
    const rootData = await res.json();

    const width = 1000;
    const height = 700;

    // Tree layout (bottom-up)
    const treeLayout = d3.tree().size([width - 200, height - 200]);
    const root = d3.hierarchy(rootData);
    treeLayout(root);

    // Reverse Y coordinates so it grows upward
    root.descendants().forEach(d => d.y = height - d.y - 100);

    const svg = d3.select("#memoryTree")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "white")
      .append("g")
      .attr("transform", "translate(100,0)");

    // Draw golden connectors
    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#D4AF37") // gold
      .attr("stroke-width", 3)
      .attr("d", d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y)
      );

    // Draw nodes
    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("r", d => d.depth === 0 ? 14 : d.children ? 10 : 7)
      .attr("fill", d => {
        if (d.depth === 0) return "#D4AF37";   // root = gold
        if (d.children) return "#FF69B4";      // people = pink
        return "#4CAF50";                      // objects = green
      });

    node.append("text")
      .attr("dy", -16)
      .attr("text-anchor", "middle")
      .style("font-family", "sans-serif")
      .style("font-size", "13px")
      .style("fill", "#333")
      .style("cursor", d => d.data.url ? "pointer" : "default")
      .text(d => d.data.name)
      .on("click", (e, d) => {
        if (d.data.url) window.open(d.data.url, "_blank");
      });

  } catch (err) {
    console.error("Error rendering stylized tree:", err);
  }
})();
