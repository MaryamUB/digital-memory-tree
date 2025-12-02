(async function() {
  try {
    const res = await fetch("data.json");
    const rootData = await res.json();

    const width = 800, height = 800;
    const radius = width / 2;

    // Build radial layout
    const treeLayout = d3.tree()
      .size([2 * Math.PI, radius - 150]); // full circle, inner radius margin

    const root = d3.hierarchy(rootData);
    treeLayout(root);

    // Convert polar coordinates to cartesian
    const radialPoint = (x, y) => [
      Math.cos(x - Math.PI / 2) * y,
      Math.sin(x - Math.PI / 2) * y
    ];

    const svg = d3.select("#memoryTree")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${radius},${radius})`);

    // Draw connecting branches
    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#8b8b8b")
      .attr("stroke-width", 1.5)
      .attr("d", d3.linkRadial()
        .angle(d => d.x)
        .radius(d => d.y));

    // Draw nodes (people & objects)
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
      .attr("r", 7)
      .attr("fill", d => d.children ? "#4caf50" : "#2196f3");

    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.x < Math.PI === !d.children ? 10 : -10)
      .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
      .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : "")
      .style("font-family", "sans-serif")
      .style("font-size", "13px")
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
