import {useState, useEffect} from 'react'
import './GameComponent.css';
import './TeamColors.css';
import OddsBoxTotal from './OddsBoxTotal.js';
import p2team from './p2team.js';

const team2code = {
        "Diamondbacks": "ARI",
        "Braves": "ATL",
        "Orioles": "BAL",
        "Red Sox": "BOS",
        "White Sox": "CHW",
        "Cubs": "CHC",
        "Reds": "CIN",
        "Guardians": "CLE",
        "Rockies": "COL",
        "Tigers": "DET",
        "Astros": "HOU",
        "Royals": "KC",
        "Angels": "LAA",
        "Dodgers": "LAD",
        "Marlins": "MIA",
        "Brewers": "MIL",
        "Twins": "MIN",
        "Mets": "NYM",
        "Yankees": "NYY",
        "Athletics": "OAK",
        "Phillies": "PHI",
        "Pirates": "PIT",
        "Giants": "SF",
        "Mariners": "SEA",
        "Cardinals": "STL",
        "Padres": "SD",
        "Rays": "TB",
        "Rangers": "TEX",
        "Blue Jays": "TOR",
        "Nationals": "WAS",
}

function formatName(name) {
    const nameParts = name.split(" ");
    nameParts[0] = nameParts[0][0] + ".";
    return nameParts.join("");
}

function GameComponent({pitcher, oddsData}) {
    // console.log("$ ", oddsData)
    if (oddsData === "undefined" || oddsData === undefined) {
        console.log("$ UNDEFINED ", oddsData)
        console.log("$ UNDEFINED ", pitcher)
    }
    
    var teamCode = team2code[p2team.player2team(pitcher)]
    var pitcherName = formatName(pitcher)

    var kLine = oddsData?.k?.line ?? "-";
    var kO = oddsData?.k?.o ?? "-";
    var kU = oddsData?.k?.u ?? "-";

    if (parseInt(kO) > 0) kO = "+"+kO
    if (parseInt(kU) > 0) kU = "+"+kU

    var outsLine = oddsData?.outs?.line ?? "-";
    var outsO = oddsData?.outs?.o ?? "-";
    var outsU = oddsData?.outs?.u ?? "-";

    if (parseInt(outsO) > 0) outsO = "+"+outsO
    if (parseInt(outsU) > 0) outsU = "+"+outsU


    function copyName() {
        let copyText = "'"+pitcher+"':'',"
        navigator.clipboard.writeText(copyText)
    }

    return (
      <div id="" className="fullTableRow tableRow-content">
        
            <div className={teamCode+"_baseball_mlb column c-team c-team-content"}>
                <p >{teamCode}</p>
            </div>
            <div className="column c-pitcher c-pitcher-content"
                onClick={() => copyName()}
            >
                <p>{pitcherName}</p>
            </div>

            <div className="column c-k c-line c-line-content">
                <p className="line">{kLine}</p>
            </div>
            <div className="column c-k c-ou c-ou-content">
                <p className="odd">{kO}</p>
            </div>
            <div className="column c-k c-ou c-ou-content">
                <p className="odd">{kU}</p>
            </div>
            
            <div className="column c-outs c-line c-line-content">
                <p className="line">{outsLine}</p>
            </div>
            <div className="column c-outs c-ou c-ou-content">
                <p className="odd">{outsO}</p>
            </div>
            <div className="column c-outs c-ou c-ou-content">
                <p className="odd">{outsU}</p>
            </div>

      </div>


    );
}
  
export default GameComponent;