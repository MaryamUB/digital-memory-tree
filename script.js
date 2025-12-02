(async function() {
  const apiRoot = "https://digitalcollections.library.maastrichtuniversity.nl/api";
  const itemSetLabel = "Maastricht History Clinic";

  const setRes = await fetch(`${apiRoot}/item_sets?search=${encodeURIComponent(itemSetLabel)}`);
  const setData = await setRes.json();
  const setId = setData[0]["o:id"];

  const peopleRes = await fetch(`${apiRoot}/item_sets/${setId}/items`);
  const people = await peopleRes.json();

  const rootData = { name: "Maastricht History Clinic", children: [] };

  for (const person of people) {
    const personNode = { name: person["o:title"], children: [] };

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
    .attr("class", "link")
    .attr("d", d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x));

  const node = svg.selectAll(".node")
    .data(root.descendants())
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y},${d.x})`);

  node.append("circle").attr("r", 6);

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
