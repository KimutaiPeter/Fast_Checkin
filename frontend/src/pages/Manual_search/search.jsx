import React from "react";
import debounce from "lodash.debounce";

import data_api from "../../utility.jsx";
import { useState, useEffect } from "react";
import "./css/search.css"



export default function Search(props) {
    const [query, set_query] = useState("")
    const [search_results, set_search_results] = useState([])

    useEffect(() => {
        if (props.query > 0) {
            fetchSuggestions(props.query);
        }
    }, [])



    // Debounced API call
    const fetchSuggestions = debounce(async (q) => {
        if (!q) {
            set_search_results([]);
            return;
        }

        try {
            const data = await data_api('/search', { "query": props.query })
            console.log(data)
            set_search_results(data)
        } catch (err) {
            console.error("Fetch error:", err);
        }
    }, 300); // 300ms debounce

    useEffect(() => {
        fetchSuggestions(props.query);
    }, [props.query]);

    useEffect(() => {
        if (props.focus_data !== null || props.focus_data !== undefined) {
            //props.set_my_state("found")
        }

    }, [props.focus_data])

    return (
        <div class="main_container center_top_vertical">
            <div class="title_container center_top_vertical">
                <h3>Manual Guest Lookup</h3>
                <span>Enter a guest id,name or phone</span>
            </div>

            <div class="left_center_horizontal search_bar_container">
                <img src="/imgs/search1.svg" alt="" />
                <input type="text" placeholder="Search" value={props.query} onChange={e => { props.set_query(e.target.value) }} />
            </div>

            <div class="results_container center_top_vertical">

                {(() => {
                    if (search_results.length > 0) {
                        return search_results.map((result) => {
                            console.log(result)
                            return (
                                <div class="result_container center_top_horizontal" key={result.id_number}>
                                    <div class="left_top_vertical result_details_container">
                                        <span>{result.name}</span>
                                        <span>{result.id_number}</span>
                                        <span>{result.phone_number}</span>
                                    </div>

                                    <div class="result_options left_top_vertical">
                                        <button class="button1" style={{ backgroundColor: result.checked_in == 1 ? "green" : "" }} >{result.checked_in == 1 ? "Checked in" : "Check in"}</button>
                                        <button class="button2" onClick={e => { props.set_focus_data(result); props.set_my_state("found"); }}>More</button>
                                    </div>
                                </div>
                            )
                        })
                    } else {
                        if (props.query.length > 3) {
                            return (
                                <div class="result_not_found_container center_top_vertical">
                                    <h3>Not found</h3>
                                    <span>Guest not found</span>
                                </div>
                            )
                        }

                    }
                })()}


            </div>

            <div class="toggle_buttons_container center_center_horizontal" >
                <div class="left_toggle_button center_center_horizontal" onClick={e => { props.set_mode('ocr') }}>
                    <img src="/imgs/scan.svg" alt="" />
                    <span >Scan</span>
                </div>
                <div class="right_toggle_button center_center_horizontal">
                    <img src="/imgs/search.svg" alt="" />
                    <span>Manual Search</span>
                </div>
            </div>


        </div>
    )
}