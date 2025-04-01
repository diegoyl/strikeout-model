import React, {useState, useEffect} from 'react';
import OddsTable from './OddsTable.js';
import Loading from './Loading.js';
import CsvConfirmation from './CsvConfirmation.js';
import OddsTableHeader from './OddsTableHeader.js';
import frontendAPI from "./frontendAPI.js"; // Import functions

import axios from "axios";

import './App.css';
import './OddsTypeBar.css';


function App() {
  var [currentOddsData, setCurrentOddsData] = useState()
  var [totalsData, setTotalsData] = useState()
  var [initTotals, setInitTotals] = useState()
  var [gameIDs, setGameIDs] = useState()
  var [requestsUsed, setRequestsUsed] = useState()

  var [eventIDs, setEventIDs] = useState([])
  var [oddsDict, setOddsDict] = useState([])
  var [reqRem, setReqRem] = useState(0)
  var [reqLast, setReqLast] = useState(0)
  var [copyCSV, setCopyCSV] = useState("")


  var [loading, setLoading] = useState(false)
  var [csvConfirmation, setCsvConfirmation] = useState(false)

    
  async function updateEvents() {
    console.log("updateEvents called, awaiting")
    setLoading(true)
    const newIDs = await frontendAPI.getEventIDs();
    console.log("updateEvents returned: ",newIDs)
    setEventIDs(newIDs)
    setLoading(false)
  }

  const markets = ["pitcher_outs", "pitcher_strikeouts"]
  async function updateOdds() {
    console.log("updateOdds called, awaiting")
    console.log("with: ", eventIDs)
    setLoading(true)
    const returnDict = await frontendAPI.getPropsData(eventIDs, markets);
    setOddsDict(returnDict["oddsDict"])
    setReqRem(returnDict["reqRem"])
    setReqLast(returnDict["reqLast"])
    setCopyCSV(returnDict["csv"])
    setLoading(false)
  }
  
  

  useEffect(() => {
    console.log('1. UseEffect Initializing...')
    
  }, []);

  // useEffect(() => {
  //   if (typeof initTotals != "undefined"){
  //     setLoading(false)
  //     console.log("INIT TOTALS DONE")
  //     changeOddsSettings();
  //   }
  // }, [initTotals]);

  function handleCsvClick() {
    // let csv_text = "DAL,4.5,4\nWAS,-4.5,-4"
    navigator.clipboard.writeText(copyCSV)
    console.log(copyCSV)
    // navigator.clipboard.writeText(csv_text)
    setCsvConfirmation(true)
    setTimeout(() => {
      setCsvConfirmation(false)
    }, 1000)
  }

  return (
    <div className="App">
      {loading ? (
        <Loading></Loading>
      ) : (
        <></>
      )}

      {csvConfirmation ? (
        <CsvConfirmation></CsvConfirmation>
      ) : (
        <></>
      )}
      
      

      <div id="main-content">
        <div id="fixedContainer">

          <div style={{height:".8em"}}></div>
          <h2 style={{margin:0,marginTop:".6em"}}>MY K MODEL :)</h2>


          <div id="buttonsContainer">
            {/* <p className="navText">UPDATE</p> */}

            <button id="" className="navButton"  
              onClick={() => updateEvents()}
            >EVENTS 📅</button>

            <button id=""
              className={eventIDs.length > 0 ? "navButton" : "emptyBtn navButton"}
              onClick={eventIDs.length > 0 ? () => updateOdds() : () => {}} 
            >ODDS 📉</button>

            {/* <button id="" className="navButton"  
              onClick={() => handleCsvClick}
            >K's</button>

            <button id="" className="navButton"  
              onClick={() => handleCsvClick}
            >OUTS</button> */}


          <div className="reqDiv">
            <p className="reqText">Rem: {reqRem}</p>
            <p className="reqText">Last: {reqLast}</p>
          </div>

            {/* <p style={{marginLeft:"3em"}} className="navText">COPY</p> */}

            <button id="csvBtn"  
              className={copyCSV!="" ? "navButton" : "emptyBtn navButton"}
              onClick={copyCSV!="" ? () => handleCsvClick() : () => {}}
            >CSV</button>
          </div>

          <OddsTableHeader ></OddsTableHeader>

        </div>
        
        <OddsTable 
          oddsDict={oddsDict} 
        ></OddsTable>

      </div> 


      <div style={{height:"25em"}}></div>
      
    </div>
  );
}

export default App;



