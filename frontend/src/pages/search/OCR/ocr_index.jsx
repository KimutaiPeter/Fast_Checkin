import React from "react";
import { useNavigate } from "react-router-dom";
import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';
import Mobile_OCR from "./ocr_mobile";
import Desktop_ocr from "./ocr_desktop";

export default function OCR_index(props){
    const navigate = useNavigate()
    function nav(url) {
        navigate(url);
    }

    if(isMobile){
        return (<Mobile_OCR nav={nav} set_page={props.set_page} event_data={props.event_data}/>)
    }else{
        return (<Desktop_ocr nav={nav} set_page={props.set_page} />)
    }

    
}