
var ctx = document.getElementById('myChart').getContext('2d');
Chart.defaults.global.elements.line.cubicInterpolationMode = "monotone"

var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: [],
        datasets: [
            {
                label: 'Infected',
                //backgroundColor: 'rgb(255, 50, 50)',
                borderColor: 'rgb(255, 50, 50)',
                data: [],
                yAxisID: 'y-axis'
            },
            {
                label: 'Recovered',
                //backgroundColor: 'rgb(150, 150, 150)',
                borderColor: 'rgb(150, 150, 150)',
                data: [],
                yAxisID: 'y-axis'
            },
            {
                label: 'Healthy',
                // backgroundColor: 'rgb(50, 255, 50, 100)',
                borderColor: 'rgb(50, 255, 50)',
                data: [],
                yAxisID: 'y-axis'
            },
            {
                label: 'Unaffected',
                //backgroundColor: 'rgb(50, 255, 50)',
                borderColor: 'rgb(50, 60, 168)',
                data: [],
                yAxisID: 'y-axis'
            }
        ]
    },

    options: {
        scales: {
            yAxes: [{
                id: 'y-axis',
                type: 'linear'
            }]
        }
    }
});

function addData(c, data, dataset) {
    c.data.datasets[dataset].data.push(data)
    c.update();
}

function addLabel(c, label) {
    c.data.labels.push(label);
}




let dx = (k, m, r) => (x) => k * (m - (x + r)) / m * (x);

function clearData(c) {
    c.data.labels = [];
    c.data.datasets.forEach(element => {
        element.data = [];
    });
}

function runSimulation(k, population, recoveryPeriod, hGraph, iGraph, uGraph, rGraph) {
    clearData(chart);

    let recovered = 0;
    let unaffected = population;
    let healthy = population;

    let x = 1; // Patient 0
    let t = 1; // Day 0
    
    // Case history
    let p = [];
    p.push(1);


    while (true) {
        addLabel(chart, t);
        let newCases = (dx(k, population, recovered)(x))
        if (x + newCases > population) newCases = population - x;
        x += newCases;
        p.push(newCases);
        console.log({ newCases, x });
        healthy -= newCases;
        unaffected -= newCases;

        if (t >= recoveryPeriod) {
            let revoverRate = p[t - recoveryPeriod]
            x -= revoverRate;
            recovered += revoverRate;
            healthy += revoverRate;
            if(rGraph) addData(chart, recovered, 1);
        } else {
            if(rGraph) addData(chart, 0, 1);
        }

        if (hGraph) addData(chart, healthy, 2);
        if (uGraph) addData(chart, unaffected, 3);

        if (x < 1) {
            x = 0;
            if (iGraph) addData(chart, 0, 0);
            break;
        }
        if(iGraph) addData(chart, x, 0);

        
        t++;
    }
}


runSimulation(1, 10000, 7, true, true, true, true);


// HTML Reactivity
const runButton = document.getElementById("run");

// Graph Options
const showHealthyButton = document.getElementById("healthy");
const showInfectedButton = document.getElementById("infected");
const showUnaffectedButton = document.getElementById("unaffected");
const showRecoveredButton = document.getElementById("recovered");

// Simulation Options
const kValInput = document.getElementById("kval");
const recoveryPeriodInput = document.getElementById("recoverTime");
const populationInput = document.getElementById("population");

runButton.onclick = () => {
    console.log("Running Simulation")
    if (document.getElementById("logarithmic").checked) {
        chart.options.scales.yAxes[0].type = "logarithmic"
    } else {
        chart.options.scales.yAxes[0].type = "linear"
    }

    runSimulation(
        Number(kValInput.value),
        Number(populationInput.value),
        Number(recoveryPeriodInput.value),
        showHealthyButton.checked,
        showInfectedButton.checked,
        showUnaffectedButton.checked, 
        showRecoveredButton.checked
    );
}

