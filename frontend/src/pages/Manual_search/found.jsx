import React, { useEffect, useReducer, useState } from "react";
import data_api from "../../utility";

import "./css/found.css"
import { data } from "react-router-dom";

export default function Found(props) {
    const [name, set_name] = useState(props.focus_data.name)
    const [id_number, set_id_number] = useState(props.focus_data.id_number)
    const [phone_number, set_phone_number] = useState(props.focus_data.phone_number)
    const [update_needed, set_update_needed] = useState(false)
    const [checked_in, set_checked_in] = useState(false)
    const [request_sent, set_request_sent] = useState(false)
    const [button_text, set_button_text] = useState("Checkin")



    useEffect(() => {
        set_name(props.focus_data.name)
        set_phone_number(props.focus_data.phone_number)
        set_id_number(props.focus_data.id_number)
    }, [])

    async function handle_update_checkin() {
        console.log("Sending request")
        set_request_sent(true)
        if (update_needed) {

            return
        } else {
            var request_result = await data_api("/update_guest",
                {
                    no: props.focus_data.no,
                    name: props.focus_data.name,
                    phone_number: props.focus_data.phone_number,
                    id_number: props.focus_data.id_number,
                    checked_in: 1
                })
            console.log(request_result)
            set_checked_in(true)
        }
        set_request_sent(false)

    }


    return (
        <div class="main_container center_top_vertical">
            <div class="title_container center_top_vertical">
                <h3>Guest Found</h3>
                <span>Guest id has been found</span>
            </div>

            <div class="logo_container">
                <img src="/imgs/check.svg" alt="" />
            </div>

            <div class="details_container center_top_vertical">
                <div class="detail_container left_top_vertical">
                    <span>Name</span>
                    <input type="text" value={name} onChange={e => { set_name(e.target.value); set_update_needed(true) }} />
                </div>

                <div class="detail_container left_top_vertical">
                    <span>Id Number</span>
                    <input type="text" value={id_number} disabled={false} onChange={e => { set_id_number(e.target.value); set_update_needed(true) }} />
                </div>

                <div class="detail_container left_top_vertical">
                    <span>Phone Number</span>
                    <input type="text" value={phone_number} onChange={e => { set_phone_number(e.target.value); set_update_needed(true) }} />
                </div>
                {(() => {
                    if (props.focus_data.checked_in === 0) {
                        if (update_needed) {
                            return (<>
                                {checked_in ? <button style={{ backgroundColor: "#34DD5A", color: "white" }}>checked in</button> : <button disabled={request_sent} onClick={e => { handle_update_checkin(); }}>{request_sent ? "please wait..." : "Update & Checkin"}</button>}
                            </>)
                        } else {
                            return (
                                <>
                                    {checked_in ? <button style={{ backgroundColor: "#34DD5A", color: "white" }}>checked in</button> : <button onClick={e => { handle_update_checkin(); }}>{request_sent ? "please wait..." : "Update & Checkin"}</button>}
                                </>
                            )
                        }
                    } else {
                        return <button style={{ backgroundColor: "#34DD5A", color: "white" }}>Checked in</button>
                    }
                })()}

                <button onClick={e => { props.set_my_state("") }} >Continue</button>

            </div>
        </div>
    )
}