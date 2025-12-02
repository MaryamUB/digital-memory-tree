(async function() {
  // Use your exact API root and item set ID
  const apiRoot = "https://digitalcollections.library.maastrichtuniversity.nl/api";
  const itemSetId = 123; // <-- REPLACE with your real item set ID

  // Step 1: Get all people in that item set
  const peopleRes = await fetch(`${apiRoot}/item_sets/${itemSetId}/items`);
  const people = await peopleRes.json();

  // Step 2: Build tree data
  const rootData = { name: "Maastricht History Clinic", children: [] };

  for (const person of people) {
    const personNode = { name: person["o:title"] || "Unnamed", children: [] };

    // Step 3: Find all objects linked via schema:about
    const relatedUrl =
      `${apiRoot}/items?property[0][joiner]=and&property[0][property]=schema:about` +
      `&property[0][type]=resource&property[0][text]=${encodeURIComponent(person["@id"])}`;
    const relatedRes = await fetch(relatedUrl);
    const relatedObjects = await relatedRes.json();

    for (const obj of relatedObjects) {
      personNode.children.push({
        name: obj["o:title"] || "Memory Object",
        url: obj["@id"].replace("/api", "")
      });
    }

    rootData.children.push(personNode);
  }

  // Step 4: Draw D3 tree
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
})();
