const gameEngine = new GameEngine();

/**
 * Bind js to HTML elements, start game engine if necessary.
 * Called automatically when window is finished loading.
 */
function bindElements() {
    //Common elements
    document.getElementById("getData").addEventListener("click", () => {
        if (!params.dbConnectSuccess) {
            databaseConnectSetup();
        }
        getDataFromDB();
    });

    document.getElementById("dlData").addEventListener("click", () => {
        if (params.lastDBResponse) {
            console.log('Preparing download.');
            downloadObjectAsJSON("data.json");
        } else {
            console.log('No data to download');
        }
    });

    //Elements only in /graphs
    if (window.location.pathname.includes('graphs')) {
        document.getElementById("graphData").addEventListener("click", () => {
            if (params.lastDBResponse) {
                console.log('Preparing graphs.');
                graphResponse();
            } else {
                console.log('No data to graph');
            }
        });
        return;
    }

    //Elements only in /index
    if (!window.location.pathname.includes('graphs')) {
        document.getElementById("reset").addEventListener("click", () => {
            reset();
        });

        document.getElementById("start_sim").addEventListener("click", () => {
            startSim();
        });
    }
}

/**
 * Load simulation entities and begin initial run.
 */
function loadSim() {
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");

    var circle;
    for (var i = 0; i < 50; i++) {
        circle = new Circle(gameEngine, true);
        gameEngine.addEntity(circle);
    }
    for (var i = 0; i < 5; i++) {
        circle = new Circle(gameEngine, false);
        gameEngine.addEntity(circle);
    }
    gameEngine.weakened = gameEngine.entities[0];
    gameEngine.weakened.debug = true;
    gameEngine.weakened.MaxSpeed *= 0.70;
    gameEngine.weakened.color = "teal";

    gameEngine.init(ctx);
    gameEngine.start();
}

/**
 * Begin binding HTML elements once page is finished loading.
 */
window.onload = () => {
    bindElements();
    if (!window.location.pathname.includes('graphs')) loadSim();
};

/**
 * Start simulation without hooks for data collection.
 */
function reset() {
    gameEngine.entities = [];

    gameEngine.ticks = 0;

    for (var i = 0; i < 50; i++) {
        circle = new Circle(gameEngine, true);
        gameEngine.addEntity(circle);
    }
    for (var i = 0; i < 5; i++) {
        circle = new Circle(gameEngine, false);
        gameEngine.addEntity(circle);
    }

    gameEngine.weakened = gameEngine.entities[0];
    gameEngine.weakened.debug = true;
    gameEngine.weakened.MaxSpeed *= 0.70;
    gameEngine.weakened.color = "teal";
}

/**
 * Connect to remote database.
 */
function databaseConnectSetup() {
    socket = io.connect('http://73.225.31.4:8888'); //connect out

    socket.on("find", function (array) {
        if (array.length > 0) parseResponse(array);
        else console.log("Empty data.");
    });

    params.dbConnectSuccess = true; //log that we've successfully connected
}

/**
 * Start simulation with data hooks for data collection.
 */
function startSim() {
    //first run setup
    if (!params.simMode) {

        //verify user isn't a meanie
        var runCountInput = document.getElementById("numberInput").value;
        if (runCountInput == '' || isNaN(runCountInput) || runCountInput < 1) {
            console.log('Invalid run count input');
            return;
        }

        var targetTickInput = document.getElementById("tickTarget").value;
        if (targetTickInput == '' || isNaN(targetTickInput) || targetTickInput < 100) {
            console.log('Invalid tick count input');
            return;
        }

        var runTypeInput = document.getElementById("typeInput").value;
        if (runTypeInput == '') {
            console.log('Invalid type input');
            return;
        }

        //turn on data collection mode
        params.simMode = true; //ensure sim mode is on
        params.runTarget = runCountInput;
        params.tickTarget = targetTickInput;
        params.runType = runTypeInput;
        params.runCount = 0;

        //setup socket stuff if not previously performed
        if (!params.dbConnectSuccess && document.getElementById('useDB').checked) {
            databaseConnectSetup();
        }

        //save the slider values this set of runs is for
        params.slider = { //grab this run's slider values
            cohesion: parseFloat(document.getElementById("coh_weight").value),
            alignment: parseFloat(document.getElementById("ali_weight").value),
            separation: parseFloat(document.getElementById("sep_weight").value)
        };

    } else { //mode already engaged, begin next run
        params.runCount++;
    }

    console.log('Starting run #' + params.runCount);

    //we do this both when a new setup happens, and when a new run happens
    params.posData = []; //build/empty list for positional data lists
    params.isPrey = [];
    params.insertCol = 0; //where in the lists we insert data
    gameEngine.entities = [];
    gameEngine.ticks = 0;

    for (var i = 0; i < 50; i++) {
        circle = new Circle(gameEngine, true);
        gameEngine.addEntity(circle);
        params.posData[i] = []; //build list for positional data
        params.isPrey[i] = true;
    }
    for (var i = 0; i < 5; i++) {
        circle = new Circle(gameEngine, false);
        gameEngine.addEntity(circle);
        params.posData[i + 50] = []; //build list for positional data
        params.isPrey[i + 50] = false;
    }

    gameEngine.weakened = gameEngine.entities[0];
    gameEngine.weakened.debug = true;
    gameEngine.weakened.MaxSpeed *= 0.70;
    gameEngine.weakened.color = "teal";
}

/**
 * Upload results to DB.
 */
function simUpload() {
    console.log('Uploading run #' + params.runCount);
    //collect data in JSON to yeet out
    var data = {
        db: "tcss435",
        collection: "red3",
        data: {
            runType: params.runType,
            runNumber: params.runCount,
            sliders: params.slider,
            preyList: params.isPrey,
            positions: params.posData
        }
    };

    //yeet, to console or DB
    if (document.getElementById('useDB').checked) {
        socket.emit("insert", data);
    } else {
        printData(data);
    }
}

/**
 * Below are print functions for data which are used if DB is not used.
 * @param {params.posData} positions 
 */
function printData(data) {
    console.log('database: ' + data.db);
    console.log('collection: ' + data.collection);
    console.log('run type: ' + data.data.runType);
    console.log('run number: ' + data.data.runNumber);
    console.log('cohesion slider: ' + data.data.sliders.cohesion);
    console.log('alignment slider: ' + data.data.sliders.alignment);
    console.log('separation slider: ' + data.data.sliders.separation);
    console.log('prey list: ' + data.data.preyList);
    console.log('entity position data:');
    printPosData(data.data.positions);
}

function printPosData(positions) {
    for (let i = 0; i < positions.length; i++) {
        var thisLine = 'i:' + i + ': ';
        for (let j = 0; j < positions[i].length; j++) {
            thisLine += '{' + posDataGet(positions[i][j]) + '}, ';
        }
        console.log(thisLine);
    }
}

function posDataGet(obj) {
    return ('x: ' + obj.x + ', y: ' + obj.y);
}

/**
 * Parse server response of data.
 * @param {array} array 
 */
function parseResponse(array) {
    console.log('Server has responded to query.');
    if (array.length == 0) {
        console.log('Response array was empty, no data to parse.');
    }

    console.log('Raw Response:');
    console.log(array); //raw response from server
    console.log('Response package size:' + JSON.stringify(array).length);

    if (document.getElementById('verboseResponse').checked) {
        console.log('Parsed Response:');
        for (let i = 0; i < array.length; i++) {
            console.log('Data from result ' + i);
            printDataDB(array[i]);
        }
    }

    params.lastDBResponse = array;
}

/**
 * Print data from server response.
 * @param {array} data 
 */
function printDataDB(data) {
    console.log('run type: ' + data.runType);
    console.log('run number: ' + data.runNumber);
    console.log('cohesion slider: ' + data.sliders.cohesion);
    console.log('alignment slider: ' + data.sliders.alignment);
    console.log('separation slider: ' + data.sliders.separation);
    console.log('prey list: ' + data.preyList);
    console.log('entity position data:');
    printPosDataDB(data.positions);
}

function printPosDataDB(positions) {
    for (let i = 0; i < positions.length; i++) {
        var thisLine = 'i:' + i + ': ';
        for (let j = 0; j < positions[i].length; j++) {
            thisLine += '{' + posDataGet(positions[i][j]) + '}, ';
        }
        console.log(thisLine);
    }
}

/**
 * Call to DB to get data matching sliders.
 */
function getDataFromDB() {
    var runTypeQuery = document.getElementById("getRunType").value;
    var cohesionQuery = parseFloat(document.getElementById("getCohesionVal").value);
    var alignmentQuery = parseFloat(document.getElementById("getAlignmentVal").value);
    var separationQuery = parseFloat(document.getElementById("getSeparationVal").value);

    console.log('Attempting to contact server for data matching query.');

    socket.emit("find",
        {
            db: "tcss435",
            collection: "red3",
            query: {
                "runType": runTypeQuery,
                "sliders.cohesion": cohesionQuery,
                "sliders.alignment": alignmentQuery,
                "sliders.separation": separationQuery,
            },
        }); //to limit runs received, add: "runNumber": { $lt: 8}
}

/**
 * Download last server response as JSON.
 * @param {JSON} fileName 
 */
function downloadObjectAsJSON(fileName) {
    const jsonContent = JSON.stringify(params.lastDBResponse);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();

    // Clean up the URL object to free up resources
    URL.revokeObjectURL(url);
}
