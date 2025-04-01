import './OddsTable.css';
import GameComponent from './GameComponent.js';
import {useState, useEffect} from 'react'
import Loading from './Loading.js';

function OddsTable({oddsDict}) {
    var [loading, setLoading] = useState(false)
    var [initializing, setInitializing] = useState(true)
    
    useEffect(() => {
        console.log("\t\tcW: ",oddsDict)
        
    },[])
    
    
    return (
        
      <div id="oddsTableContainer">                    
        {loading ? (
            <Loading></Loading>
        ) : (
            <></>
        )}

        {/* <div>TRACKING</div> */}


        {(typeof oddsDict === 'undefined') ? (
            <p>Loading Games...</p>
            ): (
                <>

                {Object.keys(oddsDict).map(function(pitcher) {
                    return (
                            <GameComponent key={pitcher} 
                            pitcher={pitcher} 
                            oddsData={oddsDict[pitcher]} 
                            ></GameComponent>
                        )
                    }
                )}
                </>
            )
        }

        </div>
    );
}
  
export default OddsTable;