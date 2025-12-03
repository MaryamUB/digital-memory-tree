(async function () {
  try {
    const res = await fetch("data.json");
    const rootData = await res.json();

    const width = 900;
    const height = 700;

    // Create vertical tree layout
    const treeLayout = d3.tree().size([width - 200, height - 200]);
    const root = d3.hierarchy(rootData);
    treeLayout(root);

    // Create SVG container
    const svg = d3.select("#memoryTree")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(100,50)");

    // Draw connectors (brown)
    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#8B4513")
      .attr("stroke-width", 2)
      .attr("d", d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y));

    // Draw nodes
    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .attr("class", "node");

    // Draw circles with color depending on type
    node.append("circle")
      .attr("r", d => d.depth === 0 ? 12 : d.children ? 10 : 7)
      .attr("fill", d => {
        if (d.depth === 0) return "#5D4037";   // Root (Digital Memory Tree)
        if (d.children) return "#8B4513";      // People (Branches)
        return "#4CAF50";                      // Objects (Leaves)
      });

    // Add labels (horizontal and readable)
    node.append("text")
      .attr("dy", 4)
      .attr("x", d => d.children ? -15 : 15)
      .style("text-anchor", d => d.children ? "end" : "start")
      .style("font-family", "sans-serif")
      .style("font-size", "13px")
      .style("cursor", d => d.data.url ? "pointer" : "default")
      .text(d => d.data.name)
      .on("click", (e, d) => {
        if (d.data.url) window.open(d.data.url, "_blank");
      });

  } catch (err) {
    console.error("Error rendering tree:", err);
  }
})();
