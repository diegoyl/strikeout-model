// const axios = require('axios');
import axios from "axios";
const DEBUG_MODE = false; // Toggle this for debugging
const REDUCE_REQS = false; // Toggle this for debugging

const apiKey = '8d1037efa05bb31118b8856699a3cc9b' // dyanez@mit

const ODDS_FORMAT = 'american' // decimal | american
const DATE_FORMAT = 'iso' // iso | unix

const SPORT = "baseball_mlb"
const REGIONS = "us"

let pitcherOddsDict = {}
let reqLast = 0 // reset last used
let reqRem = false
async function getEventIDs() {
    if (DEBUG_MODE) console.log("\n1. pull MLB Event IDs");
    try {
        const res = await axios.get(`https://api.the-odds-api.com/v4/sports/${SPORT}/events`, {
            params: { apiKey, regions: REGIONS }
        });

        if (DEBUG_MODE) console.log("2. pull MLB Event IDs returning Data");

        const eventIDs = extractEventIDs(res.data);

        if (DEBUG_MODE) console.log("2b array stringified:\n");
        if (DEBUG_MODE) console.log("\n\tvvv  COPY HERE  vvv\n");
        if (DEBUG_MODE) console.log("const tempEventIDs =", JSON.stringify(eventIDs));
        if (DEBUG_MODE) console.log("\n\t^^^  COPY HERE  ^^^\n");

        return eventIDs;
    } catch (error) {
        if (DEBUG_MODE) console.log('\nx x x x x x x x\nERROR in func: pull MLB Event IDs');
        if (DEBUG_MODE) console.log('\tError status', error); // Use `error.response`, not `error.res`
        // if (DEBUG_MODE) console.log('\t', error.response?.data);
        return []; 
    }
}


function extractEventIDs(game_data) {
    if (DEBUG_MODE) console.log("\n2b Extracting IDs");
    
    const IDs = game_data.map(game => game.id);

    // if (DEBUG_MODE) console.log("IDs:", IDs);
    return IDs
}


async function getPropsData(eventIDs, marketsArray) {
    if (eventIDs == "fetch") {
        eventIDs = await getEventIDs();
        if (DEBUG_MODE) console.log("got fetched ids: ",eventIDs)
    }
    if (REDUCE_REQS) eventIDs = eventIDs.slice(0,4)


    for (const curMarket of marketsArray) {
        await getSingleMarketData(eventIDs, curMarket); // Waits for one request to finish before starting the next
        if (DEBUG_MODE) console.log("\n\n*************************************************")
        if (DEBUG_MODE) console.log("Finished Getting Data for mkt=",curMarket,"\n")
    }
    
    if (DEBUG_MODE) console.log('final dot then')
    if (DEBUG_MODE) console.log(pitcherOddsDict)
    if (DEBUG_MODE) console.log('final dot then 2')
    let csvData = PODtoCSV(pitcherOddsDict)
    // SHOW REQUESTS AFTER FOR LOOP
    if (DEBUG_MODE) console.log("\n\n______________________________________________________________")
    if (DEBUG_MODE) console.log("* * * Reqs: ", reqRem, "  |  Used: ", reqLast ,"\n")


    // setup return dict
    let returnDict = {
        "oddsDict" : pitcherOddsDict,
        "reqRem" : reqRem,
        "reqLast" : reqLast,
        "csv" : csvData,
    }
    console.log("frontend: returnDict: ",returnDict)
    return returnDict


    async function getSingleMarketData(eventIDs, propMarket) {
        // PULL PROP ODDS DATA FOR GIVEN MARKET
        if (DEBUG_MODE) console.log("\n\n3. pull Prop Odds for lg=",SPORT," , mkt=",propMarket)
        
        async function getSingleEvent(curEventID, propMarket) {
            
            // HELPER FUNCS FOR CREATING UNIQUE REQUESTS FOR EACH EVENT
            function newRequestUrl(eventID) {
                return `https://api.the-odds-api.com/v4/sports/${SPORT}/events/${eventID}/odds`
            }
            function newRequestParams(market) {
                const params = {
                    apiKey,
                    regions:REGIONS,
                    // markets: market, // ONLY CHANGE IS HERE
                    markets: market, // ONLY CHANGE IS HERE
                    ODDS_FORMAT,
                    DATE_FORMAT, 
                }
                return params
            }

            const market2code = {
                "pitcher_strikeouts" : "k",
                "pitcher_outs" : "outs",
                "pitcher_strikeouts_alternate" : "k_alts",
            }

            function processMarketOdds(avgOddsDict, propMarket) {
                if (DEBUG_MODE) console.log("\nPROCESSING: ",avgOddsDict) // up to 2 pitchers with multiple lines
                const MARKET_CODE = market2code[propMarket]
    
                Object.entries(avgOddsDict).forEach(([pitcher,details]) => {
                    // check if player alr in dict from prev mkt
                    if (DEBUG_MODE) console.log("turn > ",pitcher, " : ",details)
                    if (!pitcherOddsDict.hasOwnProperty(pitcher)) {
                        pitcherOddsDict[pitcher] = {"k":{},"outs":{},"k_alts":{}}
                    }
                    
                    pitcherOddsDict[pitcher][MARKET_CODE]["line"] =  details["line"]
                    pitcherOddsDict[pitcher][MARKET_CODE]["o"] = details["o"]
                    pitcherOddsDict[pitcher][MARKET_CODE]["u"] = details["u"]

                })
            }
            const reqUrl = newRequestUrl(curEventID);
            const reqParams = newRequestParams(propMarket);

            try {
                const res = await axios.get(reqUrl, {params: reqParams});
                
                if (DEBUG_MODE) console.log("\n\n~4. PULL FOR ==================================================")
                if (DEBUG_MODE) console.log("\t* ",res.data.home_team, " vs ",res.data.away_team,)
                if (DEBUG_MODE) console.log("\t* mkt = ",propMarket,)
                // if (DEBUG_MODE) console.log(" * ",res.data.bookmakers[0],)

                if (res.data.bookmakers.length < 1) {
                    if (DEBUG_MODE) console.log("\tNo Odds for this game")
                } else {
                    let eventBookmakers = res.data.bookmakers
                    let avgOdds = processEventBookmakers(eventBookmakers)
                    processMarketOdds(avgOdds, propMarket)
                    // if (DEBUG_MODE) console.log("\t",res.data.bookmakers[0].markets[0].outcomes[0])
                }
                
                reqLast += parseInt(res.headers["x-requests-last"],10)
                reqRem = res.headers["x-requests-remaining"]

            } catch (error) {
                console.error(`Error fetching game ${curEventID}`);
                console.error(error);
            }
        }

        async function getAllEvents(eventIDs,propMarket) {

            for (const curID of eventIDs) {
                await getSingleEvent(curID, propMarket); // Waits for one request to finish before starting the next
            }
            if (DEBUG_MODE) console.log("\n\ndone gettingAllEvents in mkt=",propMarket);
            if (DEBUG_MODE) console.log("pulledData: ",pitcherOddsDict)
            
        }

        // LOOP THRU ALL EVENTS AND GET PROPS DATA ///////
        if (DEBUG_MODE) console.log("\n4. pull MLB Prop Odds returning Data")

       
        await getAllEvents(eventIDs,propMarket);
        
    }

}

function dec2american(decimal) {
    if (decimal >= 2.00) {
        return Math.round((decimal - 1) * 100); // plus odds
    } else {
        return Math.round(-100 / (decimal - 1)); // minus odds
    }
}



// let prop_market = "pitcher_strikeouts"
// let prop_market = "pitcher_outs"
// let prop_market = "pitcher_strikeouts_alternate"

const tempPOD = {
    'Kumar Rocker': {
      k: { line: '4.5', o: 1.6366666666666667, u: 1.6366666666666667 },  
      outs: { line: '14.5', o: 1.6833333333333333, u: 1.6833333333333333 },
      k_alts: {}
    },
    'David Peterson': {
      k: { line: '4.5', o: 1.9633333333333332, u: 1.9633333333333332 },  
      outs: { line: '15.5', o: 1.8883333333333336, u: 1.8883333333333336 },
      k_alts: {}
    },
    'Bowden Francis': {
      k: { line: '4.5', o: 1.76, u: 1.76 },
      outs: { line: '17.5', o: 1.9216666666666669, u: 1.9216666666666669 },
      k_alts: {}
    },
    'Michael Soroka': {
      k: { line: '3.5', o: 1.85, u: 1.85 },
      outs: { line: '13.5', o: 1.7700000000000002, u: 1.7700000000000002 },
      k_alts: {}
    },
    'Miles Mikolas': {
      k: { line: '4.5', o: 2.2359999999999998, u: 2.2359999999999998 },  
      outs: { line: '16.5', o: 1.7700000000000002, u: 1.7700000000000002 },
      k_alts: {}
    },
    'Tyler Anderson': {
      k: { line: '3.5', o: 1.7560000000000002, u: 1.7560000000000002 },  
      outs: { line: '15.5', o: 2.3525, u: 2.3525 },
      k_alts: {}
    },
    'Ronel Blanco': {
      k: { line: '5.5', o: 2.1783333333333332, u: 2.1783333333333332 },  
      outs: { line: '15.5', o: 2.194, u: 2.194 },
      k_alts: {}
    },
    'Jordan Hicks': {
      k: { line: '3.5', o: 1.9100000000000001, u: 1.9100000000000001 },  
      outs: { line: '13.5', o: 1.6900000000000002, u: 1.6900000000000002 },
      k_alts: {}
    },
    'Luis Ortiz': {
      k: { line: '3.5', o: 1.876, u: 1.876 },
      outs: { line: '14.5', o: 1.54, u: 1.54 },
      k_alts: {}
    },
    'Kyle Hart': {
      k: { line: '3.5', o: 1.7666666666666666, u: 1.7666666666666666 },  
      outs: { line: '14.5', o: 1.616666666666667, u: 1.616666666666667 },
      k_alts: {}
    },
    'Emerson Hancock': {
      k: { line: '4.5', o: 2.216, u: 2.216 },
      outs: { line: '14.5', o: 1.61, u: 1.61 },
      k_alts: {}
    },
    'Joey Estes': {
      k: { line: '3.5', o: 1.6583333333333332, u: 1.6583333333333332 },  
      outs: { line: '15.5', o: 2.4, u: 2.4 },
      k_alts: {}
    },
    'Tyler Glasnow': {
      k: { line: '6.5', o: 1.76, u: 1.76 },
      outs: { line: '15.5', o: 2.005, u: 2.005 },
      k_alts: {}
    },
    'Cade Povich': { k: { line: '7.5', o: 1.63, u: 1.63 }, outs: {}, k_alts: {} },
    'Sean Newcomb': { k: { line: '4.5', o: 1.71, u: 1.71 }, outs: {}, k_alts: {} },
    'Cristopher Sanchez': { k: { line: '4.5', o: 1.65, u: 1.65 }, outs: {}, k_alts: {} },
    'German Marquez': { k: { line: '3.5', o: 1.61, u: 1.61 }, outs: {}, k_alts: {} },
    'Cal Quantrill': {
      k: { line: '3.5', o: 2.0066666666666664, u: 2.0066666666666664 },  
      outs: {},
      k_alts: {}
    },
    'Carmen Mlodzinski': {
      k: { line: '3.5', o: 2.0733333333333333, u: 2.0733333333333333 },  
      outs: {},
      k_alts: {}
    },
    'Drew Rasmussen': {
      k: { line: '4.5', o: 1.7316666666666667, u: 1.7316666666666667 },  
      outs: {},
      k_alts: {}
    },
    'Ben Brown': {
      k: { line: '5.5', o: 2.2816666666666667, u: 2.2816666666666667 },  
      outs: {},
      k_alts: {}
    },
    'Grant Holmes': { k: { line: '3.5', o: 1.605, u: 1.605 }, outs: {}, k_alts: {} }
  }

function PODtoCSV(pod) {
    // pod = pitcherOddsDict
    // csv row

    const header = "Pitcher, K_Line, K_O, K_U,Outs_Line,Outs_O,Outs_U"; // Column headers
    const rows = Object.entries(pod).map(([pitcher, data]) => 
        `${pitcher},${data.k.line},${data.k.o},${data.k.u},${data.outs.line},${data.outs.o},${data.outs.u}`
    );

    let csvData = [header, ...rows].join("\n");

    if (DEBUG_MODE) console.log("\n\nCSV: \n\n",csvData)

    return csvData
}

function processEventBookmakers(books) {
    // MARKET AGNOSTIC
    if (DEBUG_MODE) console.log("\n\nPROCESSING BOOKS\n",books) 

    let pitcherLog = {} // should contain up to two pitchers and their odds for avging
    for (let b=0; b < books.length; b++) {
        let curBook = books[b]
        let outcomes = curBook.markets[0].outcomes
        if (DEBUG_MODE) console.log("\n\t",curBook.key,"\n")

        for (let i=0; i < outcomes.length; i++) {
            const outcome = outcomes[i] // outcome is dict
            const player = outcome.description
            
            // check if player already in log
            if (!pitcherLog.hasOwnProperty(player)) {
                pitcherLog[player] = {}
            }


            const line = outcome.point.toString()
            const price = outcome.price
            const ou = outcome.name

            // UPDATE PITCHER LOG
            
            // check if line already in log
            // if (DEBUG_MODE) console.log("checking if line exists: ",line, " in ",pitcherLog[player])
            if (!pitcherLog[player].hasOwnProperty(line)) {
                pitcherLog[player][line] = {"Over":[],"Under":[]}
                // if (DEBUG_MODE) console.log("\tNO | Added")
            } else {
                // if (DEBUG_MODE) console.log("\tYES")
            }
            // if (DEBUG_MODE) console.log("\t =>",pitcherLog[player])

            // add new price to averaging array
            pitcherLog[player][line][ou].push(price)
        }
 
    }
    // if (DEBUG_MODE) console.log("\nPITCHER LOG DONE: \n",pitcherLog)

    // calc AVGS
    let pitcherAvgs = {} // should contain up to two pitchers and their odds for avging
    let pitcherBestAvg = {}
    Object.keys(pitcherLog).forEach(key => {
        pitcherAvgs[key] = {};
    });
    // if (DEBUG_MODE) console.log("\nPITCHER AVGS INIT: \n",pitcherAvgs)
    
    function average(arr) {
        if (arr.length === 0) return 0; // Avoid division by zero
        return arr.reduce((sum, num) => sum + num, 0) / arr.length;
    }
    Object.keys(pitcherAvgs).forEach(pitcher => {

        // check all lines for cur Pitcher
        Object.entries(pitcherLog[pitcher]).forEach(([line, ouDict]) => {
            let oArr = ouDict["Over"]
            let uArr = ouDict["Under"]
            let dataLength = oArr.length
            let oAvg = average(oArr)
            let uAvg = average(uArr)
            pitcherAvgs[pitcher][line] = {"o":oAvg,"u":uAvg,"length":dataLength}
            
        });

        // if (DEBUG_MODE) console.log("\tPICKING ONE FROM ",pitcherLog[pitcher])
        let bestDetails = {}
        let biggest = 0
        let smallestDelta = 9999999
        function getLineDelta(ouArr) {
            // input = [oDec, uDec] / [1.67, 2.31]
            return Math.abs(ouArr[0] - ouArr[1])
        }
        Object.entries(pitcherAvgs[pitcher]).forEach(([line, details]) => {
            // if (DEBUG_MODE) console.log("\tchecking ",line," : ",details)
            let size = details["length"]
            if (size > biggest) {
                bestDetails = {"line":line,"o":details["o"],"u":details["u"]}
                biggest = size
                smallestDelta = getLineDelta([details["o"],details["u"]])
            } 
            else if (size == biggest) {
                // tiebreak with delta
                let curDelta = getLineDelta([details["o"],details["u"]])
                if (curDelta < smallestDelta) {
                    bestDetails = {"line":line,"o":details["o"],"u":details["u"]}
                    biggest = size
                    smallestDelta = curDelta
                }
            }
        })
        // if (DEBUG_MODE) console.log("\tPICKED ",bestDetails,"\n")

        // clean bestDetails
        bestDetails["o"] = dec2american(bestDetails["o"])
        bestDetails["u"] = dec2american(bestDetails["u"])
        pitcherBestAvg[pitcher] = bestDetails
    
    });
    // if (DEBUG_MODE) console.log("\nPITCHER BEST AVGS DONE: \n",pitcherBestAvg)

    
    return pitcherBestAvg
}   


// PODtoCSV(getPropsData(tempEventIDs, markets))
// async function getEventsAndProps(markets) {
//     let newIDs = await getEventIDs();
//     if (DEBUG_MODE) console.log(newIDs)
//     if (DEBUG_MODE) console.log("\n5z GOT IDS, now getdata\n")
//     getPropsData(await getEventIDs(), markets);
// }
// DONT TOUCH
// //////////////////////////////
let markets = ["pitcher_outs", "pitcher_strikeouts"]

const copiedEventIDs = ["c551222f74f7b4d9601e63815ae9b2bf","9fccf928262c368f6ae3c665814eddb6","2ddd41b46b02cd16c9ed375028df7a99","7a548f19d8f201a25db80e19b958352e","f9ec2a43fcd569bfae4f7d99f89662ca","44625e87993ffec48d1aa9c5d0b2ebbe","37f793480a81ec9d20f967bbc69f6436","7a72c9887b1c4b4a217aa118bfa7ce0b","1334bbc7de9c51f90cc31ab656a582b2","c1dec185eb5a92602120e6c1abfc3864","8988a9ed8def3b13500b649114e8f21b","ea6553aa026316b81735af7dbb09faf8","597c4cbbced3bd76f93c08880a39f842","7f1eeb5acb8826381f76a9bf601319ec","5772a662133571afe5497751e69733ab","f7612962b365c9259fc719ca3ffb5f58","68199358dbd90233cac0f5783420752b","cf138ec0262145d80b5c4db986ea68cf","dc28a093f0d05d0aae742c2376d3a032","703e9e33168b470ba22ad980a2464036"]

// getEventIDs();
// getPropsData(copiedEventIDs, markets)

// getPropsData("fetch", markets)


// EXPORTS /////////////////////////////////////////////////////////////
// EXPORTS /////////////////////////////////////////////////////////////
// EXPORTS /////////////////////////////////////////////////////////////

export default { getEventIDs, getPropsData };
