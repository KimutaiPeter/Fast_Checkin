import React from "react";

export default function Found(props){
    return (
        <div class="phone_main_container">
        <div class="content_container2 center_bottom_vertical">
            
            <div class="center_top_vertical">
                <h1>Found</h1>
                <img src="/imgs/ok.svg" alt=""/>
                <span>Id number {props.id_number} has been found</span>
            </div>

            
                <button class="main_button1 center_center_horizontal" onClick={e=>{props.set_page("scan")}}>Continue</button>
            
            
        </div>
    </div>
    )
}