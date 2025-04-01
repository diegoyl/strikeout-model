import './GameComponent.css';
import './OddsTableHeader.css';


function OddsTableHeader() {
    return (
    <div className="thDoubleRow" id='tableHeader'>
        
        <div id="thTopRow" className="thSingleRow fullTableRow">
            <div className="column c-team"></div>
            <div className="column c-pitcher"></div>

            <div className="column c-kcat">
                <p>Ks</p>
            </div>

            <div className="column c-ocat">
                <p>OUTS</p>
            </div>
        </div>
        
        <div className="thSingleRow fullTableRow">
            <div className="column c-team">
                <p>TEAM</p>
            </div>
            <div className="column c-pitcher">
                <p>PITCHER</p>
            </div>

            <div className="column c-k c-line">
                <p>LINE</p>
            </div>
            <div className="column c-k c-ou">
                <p>O</p>
            </div>
            <div className="column c-k c-ou">
                <p>U</p>
            </div>
            
            <div className="column c-outs c-line">
                <p>LINE</p>
            </div>
            <div className="column c-outs c-ou">
                <p>O</p>
            </div>
            <div className="column c-outs c-ou">
                <p>U</p>
            </div>
        </div>

      </div>
    );
}
  
export default OddsTableHeader;