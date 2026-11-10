const margin = {top: 80, right: 60, bottom: 60, left: 100};
const width = 1000 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
// The margin code above

// Create SVG (White Hat)
const svg = d3.select('#vis1')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

// Create SVG (Black Hat)
const svg2 = d3.select('#vis2')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);


// Loading Data and Creating Visualization
function init(){
    d3.csv("./data/data.csv", 
        // This is our callback function, applied to each item in the array
        function(d){
            return {
            // Besides converting the types from string to int,
            // we also simplify the variable
            year: +d.TIME_PERIOD,
            pollutant: d.POLLUTANT,
            location: d['Reference area'],
            unit: d.UNIT_MEASURE,
            amount: +d.OBS_VALUE,
            //arrest: d.Arrest
         }
        }) 
        .then(data => {
            console.log(data)
            allData = data
            //setupSelector()

            // Initial rendering steps:
            // P.S. You could move these into setupSelector(),
            // but calling them seperately makes the flow clearer.

            // Call White Hat and Black Hat Visualization Functions
            

        })
    .catch(error => console.error('Error loading data:', error));
}

window.addEventListener('load', init);


// Functions for White Hat Visualization


// Function for Black Hat Visualization