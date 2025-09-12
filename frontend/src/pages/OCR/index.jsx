import React, { useRef, useState, useEffect } from "react";
import Tesseract from "tesseract.js";

import "../../assets/layouts.css"

import "./css/index.css"

import "./css/scan.css"

export default function Index(props) {
    return (
        <>
            <div class="main_scan_container">
                <div class="scan_title_container center_top_vertical">
                    <h2>OCR Guest Lookup</h2>
                    <span>scan id card</span>
                </div>

                <div class="main_scan_buttons_container center_top_vertical">
                    <button onClick={e => { props.captureAndRecognize() }}>scan</button>
                </div>

                <div class="scan_toggle_buttons_container center_top_vertical">
                    <img src="/imgs/scan_button.svg" alt="" />
                    <img src="/imgs/search_button.svg" alt="" onClick={e=>{props.set_mode("search")}} />
                </div>
            </div>

        </>
    )
}