import React from "react";

export default function Scan_error(props) {
    return (
        <div class="main_not_found_container">
            <div class="not_found_title_container center_top_vertical">
                <h2>No Id Number Detected</h2>
                <span>Error</span>
            </div>

            <div class="instructions_container center_top_vertical">
                <span>Ensure the id number is within the box</span>
                <span>Ensure the id number is visible</span>
                <span>Ensure the id card is well lit</span>
            </div>

            <div class="center_top_vertical">
                <img style={{width:"190px",height:"190px"}} src="/imgs/caution.svg" alt="" />
            </div>

            <div className="center_top_vertical" style={{margin:"30px"}}> 
                <img style={{"width":"50%",height:"50%"}} src={props.croppedImage} alt="" />
            </div>

            <div class="main_scan_buttons_container center_top_vertical" >

                <button onClick={e=>{props.set_page("scan")}}>Continue</button>

            </div>

            <div class="scan_toggle_buttons_container center_top_vertical">
                <img src="/imgs/scan_button.svg" alt="" />
                <img src="/imgs/search_button.svg" alt="" />
            </div>



        </div>
    )
}