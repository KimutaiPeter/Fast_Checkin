import React from "react";

export default function Not_found(props){

    return (
    <div class="main_scan_container1 center_center_vertical">
            <div class="title_container center_top_vertical">
                <h3>Guest Not Found</h3>
                <span>Guest is not in the list</span>
            </div>

            <div class="logo_container">
                <img src="/imgs/no.svg" alt="" />
            </div>

            <div class="details_container center_top_vertical">
                <div class="detail_container left_top_vertical">
                    <span>ID Number</span>
                    <input type="text" value={props.id_number} />
                </div>
                <button onClick={e => { props.set_mode("search") }}>Search</button>
                <button onClick={e => { props.set_page("scan") }}>Continue</button>

            </div>
        </div>
    )
}