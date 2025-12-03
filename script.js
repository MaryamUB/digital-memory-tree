(async function() {
  try {
    const res = await fetch("data.json");
    const rootData = await res.json();

    const width = 900, height = 900;
    const radius = width / 2;

    // Radial tree layout (root centered, trunk downward)
    const treeLayout = d3.tree().size([2 * Math.PI, radius - 150]);
    const root = d3.hierarchy(rootData);
    treeLayout(root);

    // Convert polar to cartesian (flip to grow upward)
    const radialPoint = (x, y) => [
      Math.cos(x + Math.PI / 2) * y,
      Math.sin(x + Math.PI / 2) * y
    ];

    const svg = d3.select("#memoryTree")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${radius},${radius})`);

    // Branch connectors
    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#8B4513")
      .attr("stroke-width", 2)
      .attr("d", d3.linkRadial()
        .angle(d => d.x)
        .radius(d => d.y));

    // Nodes
    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("transform", d => {
        const [x, y] = radialPoint(d.x, d.y);
        return `translate(${x},${y})`;
      })
      .attr("class", "node");

    node.append("circle")
      .attr("r", d => d.depth === 0 ? 12 : 8)
      .attr("fill", d => {
        if (d.depth === 0) return "#5D4037";   // Root
        if (d.children) return "#8B4513";      // People (branches)
        return "#4CAF50";                      // Objects (leaves)
      });

    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.x < Math.PI ? 14 : -14)
      .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
      .attr("transform", d => (d.x >= Math.PI ? "rotate(180)" : ""))
      .style("font-family", "sans-serif")
      .style("font-size", "13px")
      .style("fill", "#222")
      .style("cursor", d => d.data.url ? "pointer" : "default")
      .text(d => d.data.name)
      .on("click", (e, d) => {
        if (d.data.url) window.open(d.data.url, "_blank");
      });

  } catch (err) {
    console.error("Error rendering tree:", err);
  }
})();
