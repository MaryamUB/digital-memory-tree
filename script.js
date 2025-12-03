// This script loads a static JSON file for the tree data, bypassing API issues.

/**
 * Loads the static data structure from the local data.json file.
 */
async function loadStaticData() {
    try {
        const response = await fetch('./data.json');
        if (!response.ok) {
            throw new Error(`Failed to load data.json. Status: ${response.status}`);
        }
        return await response.json();
    } catch (e) {
        console.error("Error loading static data:", e);
        // Fallback structure if the JSON file fails to load
        return { name: "Error Loading Data", children: [] };
    }
}

// --- D3.JS RENDERING LOGIC ---
(async function() {
  try {
    // Get data statically from the local file
    const rootData = await loadStaticData(); 

    const width = 800, height = 800;
    const radius = width / 2;

    // Build radial layout
    const treeLayout = d3.tree()
      .size([2 * Math.PI, radius - 150]); 

    const root = d3.hierarchy(rootData);
    treeLayout(root);

    // Convert polar coordinates to cartesian
    const radialPoint = (x, y) => [
      Math.cos(x - Math.PI / 2) * y,
      Math.sin(x - Math.PI / 2) * y
    ];

    // Append to the element with id="memoryTree"
    const svg = d3.select("#memoryTree")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${radius},${radius})`);

    // Draw connecting branches (Brown - Trunk/Branches)
    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#8B4513") // Dark Brown for branches 
      .attr("stroke-width", 2) 
      .attr("d", d3.linkRadial()
        .angle(d => d.x)
        .radius(d => d.y));

    // Draw nodes (People/Objects)
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
      .attr("r", d => d.depth === 0 ? 10 : 7) 
      .attr("fill", d => {
        // d.depth === 0 is the main root ("Digital Memory Tree") -> Brown/Trunk
        if (d.depth === 0) return "#A0522D"; 
        // d.children is true for people nodes (Branches) -> Brown
        if (d.children) return "#A0522D"; 
        // Leaves (Objects) -> Green
        return "#4CAF50"; 
      });
    
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
    console.error("Final Error in D3 Rendering:", err);
  }
})();
