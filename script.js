(async function () {
  try {
    const res = await fetch("data.json");
    const rootData = await res.json();

    const width = 1000;
    const height = 800;
    const trunkHeight = 150;
    const branchSpread = 300;
    const levelGap = 180;

    const svg = d3.select("#memoryTree")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "white");

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height - 100})`);

    const root = d3.hierarchy(rootData);

    // Step 1: Position nodes manually for a strong central trunk
    root.x = 0;
    root.y = 0;

    const firstLevel = root.children || [];
    const secondLevel = [];

    firstLevel.forEach((child, i) => {
      const angle = (-Math.PI / 2) + ((i - (firstLevel.length - 1) / 2) * 0.6);
      child.x = Math.sin(angle) * branchSpread * 0.5;
      child.y = -trunkHeight - Math.cos(angle) * levelGap;

      if (child.children) {
        child.children.forEach((grand, j) => {
          grand.x = child.x + (j - (child.children.length - 1) / 2) * 100;
          grand.y = child.y - levelGap * 0.8;
          secondLevel.push(grand);
        });
      }
    });

    // Step 2: Combine all nodes
    const allNodes = [root, ...firstLevel, ...secondLevel];

    // Step 3: Create branches (trunk + splits)
    const branches = [];

    firstLevel.forEach(child => {
      branches.push({
        source: { x: root.x, y: root.y },
        target: { x: child.x, y: child.y }
      });
      if (child.children) {
        child.children.forEach(grand => {
          branches.push({
            source: { x: child.x, y: child.y },
            target: { x: grand.x, y: grand.y }
          });
        });
      }
    });

    // Step 4: Draw curved golden branches
    const curve = d3.line()
      .curve(d3.curveBasis)
      .x(d => d.x)
      .y(d => d.y);

    svg.selectAll(".branch")
      .data(branches)
      .enter()
      .append("path")
      .attr("class", "branch")
      .attr("fill", "none")
      .attr("stroke", "#D4AF37")
      .attr("stroke-width", 4)
      .attr("d", d => curve([
        d.source,
        { x: (d.source.x + d.target.x) / 2, y: (d.source.y + d.target.y) / 2 - 40 },
        d.target
      ]));

    // Step 5: Draw nodes with consistent colors
    const node = svg.selectAll(".node")
      .data(allNodes)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${width / 2 + d.x}, ${height - 100 + d.y})`)
      .style("cursor", d => d.data.url ? "pointer" : "default")
      .on("click", (e, d) => {
        if (d.data.url) window.open(d.data.url, "_blank");
      });

    node.append("circle")
      .attr("r", d => d.depth === 0 ? 16 : d.children ? 10 : 8)
      .attr("fill", d => {
        if (d.depth === 0) return "#D4AF37";  // root (gold trunk)
        if (d.children || d.data.children) return "#FF69B4";  // people (pink)
        return "#4CAF50";  // objects (green)
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    node.append("text")
      .attr("y", d => d.depth === 0 ? 30 : -14)
      .attr("text-anchor", "middle")
      .style("font-family", "sans-serif")
      .style("font-size", "13px")
      .style("fill", "#333")
      .text(d => d.data.name);

  } catch (err) {
    console.error("Tree rendering error:", err);
  }
})();

