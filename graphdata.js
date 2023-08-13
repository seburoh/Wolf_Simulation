/**
 * Function that's automatically called when user hits Generate Graph button.
 */
function graphResponse() {
    if (!params.lastDBResponse) {
        console.log('No valid file to parse.');
        return;
    }

    let results = {};

    results.timeStamp = [];
    for (let i = 0; i < params.lastDBResponse[0].positions[0].length; i++) {
        results.timeStamp.push(i);
    }

    results.avgDistance = calcAverageDistance();
    results.sheepCaught = calcSheepCaught();
    results.avgWolf = calcWolfDistance();
    results.weakDist = calcWeakDistance();

    plotAverageDistance(results);
    plotSheepCaught(results);
    plotWolfDistance(results);
    plotWeakDistance(results);

    console.log('Graphs generated.')
}

/**
 * Calculates distance between two points.
 * @param {JSON Point} one 
 * @param {JSON Point} two 
 * @returns 
 */
function pointDistance(one, two) {
    return Math.sqrt(
        (one.x - two.x) ** 2 + (one.y - two.y) ** 2
    )
}

/**
 * Calculates average minimum distance from the weakest sheep to the nearest wolf.
 * @returns distance to nearest wolf as array.
 */
function calcWeakDistance() {
    const data = params.lastDBResponse;

    const avgDistance = [];
    let runCount = data.length;

    for (let i = 0; i < data[0].positions[0].length; i++) {
        avgDistance.push(0.0);
    }

    for (let run = 0; run < runCount; run++) {
        //create arrays to split posData into.
        let weak = data[run].positions[0];
        let wolfArr = [];

        const isPrey = data[run].preyList;
        const allPosition = data[run].positions;

        //put wolves and prey into their spots
        for (let i = 0; i < isPrey.length; i++) {
            if (isPrey[i] === false) {
                wolfArr.push(allPosition[i]);
            }
        }

        //for each tick, find the closest wolf to the weak sheep
        //for each tick
        for (let tic = 0; tic < weak.length; tic++) {
            let closestWolf = Number.MAX_VALUE;

            //for each wolf
            for (let wolf = 0; wolf < wolfArr.length; wolf++) {
                let thisWolf = pointDistance(wolfArr[wolf][tic], weak[tic]);
                closestWolf = Math.min(closestWolf, thisWolf);
            }

            //average the total for this tick
            avgDistance[tic] += closestWolf
        }
    }

    //divide each avgDistance by amount of runs, fill out timeStamp
    for (let i = 0; i < avgDistance.length; i++) {
        avgDistance[i] = avgDistance[i] / runCount;
    }

    return avgDistance;
}

/**
 * Calculates average minimum distance to a sheep from each wolf.
 * @returns distance to sheep as array.
 */
function calcWolfDistance() {
    const data = params.lastDBResponse;

    const avgDistance = [];
    let runCount = data.length;

    for (let i = 0; i < data[0].positions[0].length; i++) {
        avgDistance.push(0.0);
    }

    for (let run = 0; run < runCount; run++) {
        //create arrays to split posData into.
        let wolfArr = [];

        const isPrey = data[run].preyList;
        const allPosition = data[run].positions;

        //put wolves and prey into their spots
        for (let i = 0; i < isPrey.length; i++) {
            if (isPrey[i] === false) {
                wolfArr.push(allPosition[i]);
            }
        }

        //for each tick, for each wolf, find closest wolf
        //for each tick
        for (let tic = 0; tic < wolfArr[0].length; tic++) {
            let thisTickTotal = 0.0;

            //for each wolf
            for (let wolf = 0; wolf < wolfArr.length; wolf++) {
                let closestSheep = Number.MAX_VALUE;

                //find closest sheep
                for (let sheep = 0; sheep < wolfArr.length; sheep++) {
                    let thisSheep = pointDistance(wolfArr[wolf][tic], wolfArr[sheep][tic]);
                    if (thisSheep != 0) {
                        closestSheep = Math.min(closestSheep, thisSheep);
                    }
                }

                //add the distance to our rolling total
                thisTickTotal += closestSheep;
            }

            //average the total for this tick
            avgDistance[tic] += thisTickTotal / wolfArr.length;
        }
    }

    //divide each avgDistance by amount of runs, fill out timeStamp
    for (let i = 0; i < avgDistance.length; i++) {
        avgDistance[i] = avgDistance[i] / runCount;
    }

    return avgDistance;
}

/**
 * Calculates average sheep caught from each wolf.
 * @returns sheep caught as array.
 */
function calcSheepCaught() {
    const data = params.lastDBResponse;

    const avgCaught = [];
    let runCount = data.length;

    for (let i = 0; i < data[0].positions[0].length; i++) {
        avgCaught.push(0);
    }

    for (let run = 0; run < runCount; run++) {
        //create arrays to split posData into.
        let preyArr = [];
        let wolfArr = [];

        const isPrey = data[run].preyList;
        const allPosition = data[run].positions;

        //put wolves and prey into their spots
        for (let i = 0; i < isPrey.length; i++) {
            if (isPrey[i] === true) {
                preyArr.push(allPosition[i]);
            } else {
                wolfArr.push(allPosition[i]);
            }
        }

        //for each tick, for each wolf, find closest sheep
        //for each tick
        for (let tic = 0; tic < wolfArr[0].length; tic++) {
            let thisTickTotal = 0;

            //for each wolf
            for (let wolf = 0; wolf < wolfArr.length; wolf++) {

                //find closest sheep
                for (let sheep = 0; sheep < preyArr.length; sheep++) {
                    let thisSheep = pointDistance(wolfArr[wolf][tic], preyArr[sheep][tic]);
                    thisTickTotal += thisSheep < 25 ? 1 : 0;
                }
            }

            //average the total for this tick
            avgCaught[tic] += thisTickTotal / wolfArr.length;
        }
    }

    //divide each avgDistance by amount of runs, fill out timeStamp
    for (let i = 0; i < avgCaught.length; i++) {
        avgCaught[i] = avgCaught[i] / runCount;
    }

    return avgCaught;
}

/**
 * Calculates average minimum distance to a sheep from each wolf.
 * @returns distance to sheep as array.
 */
function calcAverageDistance() {
    const data = params.lastDBResponse;

    const avgDistance = [];
    let runCount = data.length;

    for (let i = 0; i < data[0].positions[0].length; i++) {
        avgDistance.push(0.0);
    }

    for (let run = 0; run < runCount; run++) {
        //create arrays to split posData into.
        let preyArr = [];
        let wolfArr = [];

        const isPrey = data[run].preyList;
        const allPosition = data[run].positions;

        //put wolves and prey into their spots
        for (let i = 0; i < isPrey.length; i++) {
            if (isPrey[i] === true) {
                preyArr.push(allPosition[i]);
            } else {
                wolfArr.push(allPosition[i]);
            }
        }

        //for each tick, for each wolf, find closest sheep
        //for each tick
        for (let tic = 0; tic < wolfArr[0].length; tic++) {
            let thisTickTotal = 0.0;

            //for each wolf
            for (let wolf = 0; wolf < wolfArr.length; wolf++) {
                let closestSheep = pointDistance(wolfArr[wolf][tic], preyArr[0][tic]);

                //find closest sheep
                for (let sheep = 1; sheep < preyArr.length; sheep++) {
                    let thisSheep = pointDistance(wolfArr[wolf][tic], preyArr[sheep][tic]);
                    closestSheep = Math.min(closestSheep, thisSheep);
                }

                //add the distance to our rolling total
                thisTickTotal += closestSheep;
            }

            //average the total for this tick
            avgDistance[tic] += thisTickTotal / wolfArr.length;
        }
    }

    //divide each avgDistance by amount of runs, fill out timeStamp
    for (let i = 0; i < avgDistance.length; i++) {
        avgDistance[i] = avgDistance[i] / runCount;
    }

    return avgDistance;
}

/**
 * Plot average minimum distance to sheep
 * @param {JSON} results 
 */
function plotAverageDistance(results) {
    if (params.distanceChart) {
        Plotly.purge('catchDistanceChart');
    }

    const trace = {
        x: results.timeStamp,
        y: results.avgDistance,
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: 'rgba(125, 220, 170, 1)' },
        fill: 'none',
        name: 'Average Distance of Closest Sheep'
    };

    const layout = {
        title: 'Average Minimum Distance',
        xaxis: {
            title: {
                text: 'Per 100 Ticks',
                standoff: 10
            }
        },
        yaxis: {
            title: {
                text: 'Average Distance',
                standoff: 10
            }
        }
    };

    params.distanceChart = Plotly.newPlot('catchDistanceChart', [trace], layout);

    document.getElementById('infoDisplay').innerHTML = "Displaying Charts for " + params.lastDBResponse.length + " runs";
    console.log("Displaying Charts for " + params.lastDBResponse.length + " runs");
}

/**
 * Plot average sheep caught
 * @param {JSON} results 
 */
function plotSheepCaught(results) {
    if (params.caughtChart) {
        Plotly.purge('catchChart');
    }

    const trace = {
        x: results.timeStamp,
        y: results.sheepCaught,
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: 'rgba(210, 75, 100, 1)' },
        fill: 'none',
        name: 'Average Sheep Caught by Wolves'
    };

    const layout = {
        title: 'Average Sheep Caught',
        xaxis: {
            title: {
                text: 'Per 100 Ticks',
                standoff: 10
            }
        },
        yaxis: {
            title: {
                text: 'Average Caught',
                standoff: 10
            }
        }
    };

    params.caughtChart = Plotly.newPlot('catchChart', [trace], layout);
}

/**
 * Plot average wolf distance
 * @param {JSON} results 
 */
function plotWolfDistance(results) {
    if (params.wolfChart) {
        Plotly.purge('wolfChart');
    }

    const trace = {
        x: results.timeStamp,
        y: results.avgWolf,
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: 'rgba(205, 130, 215, 1)' },
        fill: 'none',
        name: 'Average Minimum Distance Between Wolves'
    };

    const layout = {
        title: 'Average Minimum Wolf Distance',
        xaxis: {
            title: {
                text: 'Per 100 Ticks',
                standoff: 10
            }
        },
        yaxis: {
            title: {
                text: 'Average Distance',
                standoff: 10
            }
        }
    };

    params.wolfChart = Plotly.newPlot('wolfChart', [trace], layout);
}

/**
 * Plot average wolf distance
 * @param {JSON} results 
 */
function plotWeakDistance(results) {
    if (params.weakChart) {
        Plotly.purge('weakChart');
    }

    const trace = {
        x: results.timeStamp,
        y: results.weakDist,
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: 'rgba(130, 180, 215, 1)' },
        fill: 'none',
        name: 'Minimum Distance from the Weak Sheep to a Wolf'
    };

    const layout = {
        title: 'Minimum Distance to Weakest Sheep',
        xaxis: {
            title: {
                text: 'Per 100 Ticks',
                standoff: 10
            }
        },
        yaxis: {
            title: {
                text: 'Average Distance',
                standoff: 10
            }
        }
    };

    params.weakChart = Plotly.newPlot('weakChart', [trace], layout);
}