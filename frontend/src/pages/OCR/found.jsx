import React, { useEffect } from "react";

export default function Found(props) {


    useEffect(()=>{
        if(props.focus_data){
            console.log(props.focus_data)
        }else{
            props.set_page("scan_error")
        }
    },[])

    return (
        <div class="main_scan_container1 center_top_vertical">
            <div class="title_container center_top_vertical">
                <h3>Guest Found</h3>
                <span>{props.focus_data['checked_in']==1?"Guest has already been checked in":"Guest id has been found and has just been checked in"}</span>
            </div>

            <div class="logo_container">
                <img src="/imgs/check.svg" alt="" />
            </div>

            <div class="details_container center_top_vertical">
                <div class="detail_container left_top_vertical">
                    <span>Name</span>
                    <input type="text" value={props.focus_data['name']} />
                </div>

                <div class="detail_container left_top_vertical">
                    <span>Id</span>
                    <input type="text" value={props.focus_data['id_number']} />
                </div>

                <div class="detail_container left_top_vertical">
                    <span>Phone</span>
                    <input type="text" value={props.focus_data["phone_number"]} />
                </div>

                <button>Update</button>
                <button onClick={e => { props.set_page("scan") }}>Continue</button>

            </div>
        </div>

    )
}