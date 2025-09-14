import React, { useEffect, useState } from "react";
import { data_get } from "../utility";
import { data } from "react-router-dom";



export default function Desktop_app() {
    const [total_invited, set_total_invited]=useState(0)
    const [total_arrived,set_total_arrived]=useState(0)

    useEffect(() => {
        console.log("Hello world")
        get_count()
    }, [])


    async function get_count(){
        var my_count=await data_get("/count_guests")

        console.log(my_count)
        set_total_arrived(my_count["checkedin_rows"])
        set_total_invited(my_count['total_rows'])
    }

    return (
        <div className='center_center_vertical' style={{ width: "100vw", height: "100vh", color: "white" }}>
            <div className="main_numbers_container center_center_vertical" >
                <div className="total_numbers_container left_top_vertical" style={{ width: "100%" }}>
                    <span>Total invited:</span>
                    <span style={{ fontSize: "50px" }}>{total_invited}</span>
                </div>
                <div className="present_guest_container right_top_vertical">
                    <span style={{ fontSize: "200px" }}>{total_arrived}</span>
                </div>
                <img src="/imgs/refresh.svg" alt="" onClick={e=>{get_count()}} />

            </div>

        </div>
    )
}