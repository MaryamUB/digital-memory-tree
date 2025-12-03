(async function () {
  try {
    const res = await fetch("data.json");
    const rootData = await res.json();

    const width = 1000;
    const height = 800;

    const svg = d3.select("#memoryTree")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "white")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height - 100})`);

    // Build a manual radial branching layout
    const root = d3.hierarchy(rootData);
    const angleSpread = Math.PI / 1.3; // spread of main branches
    const radiusStep = 150;

    // Assign positions manually (root at 0,0)
    function positionNodes(node, depth = 0, angleOffset = 0) {
      const radius = depth * radiusStep;
      node.x = Math.sin(angleOffset) * radius;
      node.y = -Math.cos(angleOffset) * radius;
      if (!node.children) return;

      const spread = (angleSpread / node.children.length) * 0.8;
      node.children.forEach((child, i) => {
        const angle = angleOffset - angleSpread / 2 + spread * (i + 0.5);
        positionNodes(child, depth + 1, angle + (Math.random() - 0.5) * 0.3); // small randomness
      });
    }
    positionNodes(root, 0, 0);

    // Draw organic branches (curved golden lines)
    const lineGen = d3.line()
      .curve(d3.curveBasis)
      .x(d => d.x)
      .y(d => d.y);

    const links = root.links().map(link => ({
      points: [
        [link.source.x, link.source.y],
        [(link.source.x + link.target.x) / 2, (link.source.y + link.target.y) / 2 - 40],
        [link.target.x, link.target.y]
      ]
    }));

    svg.selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("d", d => lineGen(d.points))
      .attr("fill", "none")
      .attr("stroke", "#D4AF37") // golden trunk/branches
      .attr("stroke-width", d => 2 + Math.random() * 1.2)
      .attr("opacity", 0.9);

    // Draw nodes (trunk → people → leaves)
    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .style("cursor", d => d.data.url ? "pointer" : "default")
      .on("click", (e, d) => {
        if (d.data.url) window.open(d.data.url, "_blank");
      });

    node.append("circle")
      .attr("r", d => d.depth === 0 ? 14 : d.children ? 10 : 7)
      .attr("fill", d => {
        if (d.depth === 0) return "#D4AF37"; // root = gold
        if (d.children) return "#FF69B4"; // people = pink
        return "#4CAF50"; // objects = green
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    node.append("text")
      .attr("y", d => (d.depth === 0 ? 25 : -12))
      .attr("text-anchor", "middle")
      .style("font-family", "sans-serif")
      .style("font-size", "13px")
      .style("fill", "#333")
      .text(d => d.data.name);

    // Subtle growth animation
    svg.selectAll("circle")
      .attr("transform", "scale(0)")
      .transition()
      .duration(1000)
      .delay((d, i) => i * 150)
      .attr("transform", "scale(1)");

  } catch (err) {
    console.error("Error rendering Living Tree:", err);
  }
})();
