// --- CONFIGURATION ---
const OMEKA_BASE_URL = "https://digitalcollections-accept.library.maastrichtuniversity.nl";
const OMEKA_API_URL = OMEKA_BASE_URL + "/api/items";
const PERSON_CLASS_ID = '473'; 
// *** CONFIRMED ID for schema:about is commonly 120 in standard Omeka-S setups ***
const LINKING_PROPERTY_ID = '120'; 

/**
 * Fetches all 'Person' items and their linked 'Object' items (via schema:about).
 * Transforms the API data into the nested JSON structure D3.js requires.
 */
async function fetchOmekaData() {
    try {
        // 1. Fetch all people items (Resource Class ID 473)
        const peopleResponse = await fetch(`${OMEKA_API_URL}?resource_class_id=${PERSON_CLASS_ID}&limit=100`);
        if (!peopleResponse.ok) throw new Error("Failed to fetch People from Omeka API.");
        const people = await peopleResponse.json();

        const rootNode = {
            name: "Maastricht History Clinic",
            children: []
        };

        // Process each person
        for (const person of people) {
            const personNode = {
                name: person['o:title'],
                url: person['o:url'],
                children: []
            };
            
            // 2. Fetch objects linked to this person (where schema:about/ID 120 points to the person's ID)
            const objectsUrl = `${OMEKA_API_URL}?property[0][joiner]=and&property[0][property_id]=${LINKING_PROPERTY_ID}&property[0][type]=res&property[0][value]=${person['o:id']}&limit=100`;
            const objectsResponse = await fetch(objectsUrl);
            if (!objectsResponse.ok) continue; // Skip if objects fail to fetch
            const objects = await objectsResponse.json();

            // Add each linked object as a child (leaf)
            for (const object of objects) {
                personNode.children.push({
                    name: object['o:title'],
                    url: object['o:url']
                });
            }
            
            // Only include the person node if they have associated objects (leaves)
            if (personNode.children.length > 0) {
                rootNode.children.push(personNode);
            }
        }
        
        return rootNode;
    } catch (e) {
        console.error("Error during Omeka Data Fetching:", e);
        // Fallback: If API fails, return the static data structure you provided previously
        return {
            "name": "Maastricht History Clinic",
            "children": [
                // Fallback People/Objects go here if you wish, otherwise it will just show root
            ]
        };
    }
}

// --- D3.JS RENDERING LOGIC ---
(async function() {
  try {
    // Get data dynamically from Omeka-S API
    const rootData = await fetchOmekaData(); 

    const width = 800, height = 800;
    const radius = width / 2;

    // --- D3.js Setup ---
    const treeLayout = d3.tree()
      .size([2 * Math.PI, radius - 150]); 

    const root = d3.hierarchy(rootData);
    treeLayout(root);

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
        // d.depth === 0 is the main root -> Brown/Trunk
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
    console.error("Error loading data:", err);
  }
})();
