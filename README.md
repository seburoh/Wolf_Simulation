# Wolf_Simulation
Wolf Simulation for University of Washington Tacoma TCSS435: Artificial Intelligence. Goal of project is to modify the <a href="https://github.com/algorithm0r/WolfPack">provided simulation</a> to run a research experiment.

The simulation has been updated to include multiple sliders for adjusting behaviors of predators and prey, as well as updating the included code to the modern js object notation.

# Data Collection Mode
It is possible to upload data to the database by following these instructions:
* Enter values:
    * Run Type: How to categorize the run in the database for future retrieval.
    * Run Count: How many runs to do with the same settings. Value must be >= 1.
    * Target Tick: What tick to end the simulation at, inclusive. Value must be >= 100.
* Set slider values to desired positions.
* Check the box for Freeze Visual if desired for compute power.
* Check the 'Use Database' box to upload results, or leave unchecked to print to console.
* Click "DataSim" to start the data collection runs.

The simulation will then run for the desired runs, to the ticks. Position data for each entity in the simulation will be recorded every 100 ticks, to be uploaded at the end. Some basic information is given in the console while this is running, to note what run number is currently in progress.

When the runs are complete, the simulation will revert to normal and perform a normal simulation without data collection enabled.

The shape of data recorded and uploaded is as follows:
```js
    var data = {
        db: "tcss435",
        collection: "red3",
        data: {
            runType: 'test',
            //integer of which run is being uploaded
            runNumber: params.runCount,
            //values of the alignment, cohesion, and separation sliders
            sliders: params.slider,
            //a list of which entities are prey (true) or predator (false)
            preyList: params.isPrey,
            //2D list containing JSON marking x and y positions of each entity
            positions: params.posData
        }
    };
```

Notes:
* For examples on how to interact with the data shape, basic interaction with the data can be seen in the print functions at the end of *main*.
* If run through a website instead of locally, browser security measures must be overriden.

# Data Retrieval
To retrieve data from the database, enter values in each field to find matching data and click *Get Data*.

*Verbose Console* puts out slightly formatted versions of the data into the console, for manual viewing when *Get Data* is run.

*Download* only works after *Get Data* has been run at least once, and downloads the previous results from *Get Data* as a JSON file named data.json.

# Graphing Data
Graphing of data is available at the `/graphs` page. This only works when locally run as it depends on being able to communicate with the database. The method for data retrieval to then graph is the same as on the main page. The additional *Generate Graphs* button will generate four graphs based on the last retrieved data.
* Average Minimum Distance: The average distance of the closest sheep to each wolf at each recorded time step.
* Average Sheep Caught: The average number of sheep within 25 units of a wolf at each recorded time step.
* Average Minimum Wolf Distance: The average of the minimum distances between wolves at each recorded time step.
* Minimum Distance to Weakest Sheep: The average distance from the weakest sheep to the closest wolf at each recorded time step.

# Known Issues
* Database connectivity is done in a way browsers don't like, but can function if browser security is bypassed.

# Resources
* <a href="https://github.com/algorithm0r/WolfPack">WolfPack</a>: Base simulation this project forks from.
* Plot.ly: Graphing functionality.

<img src="https://github.com/cat-milk/Anime-Girls-Holding-Programming-Books/blob/master/Javascript/Doma_Umaru_Java_Script_The_Good_Parts.png?raw=true" alt="Confusion">