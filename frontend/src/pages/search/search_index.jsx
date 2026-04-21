import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import OCR_index from "./OCR/ocr_index";
import Manual_lookup from "./manual_lookup/manual_lookup";
import Guest_checkin from "./guest_checkin/guest_checkin";

export default function Search_index(){
    const [page,set_page]=useState('manual_search')
    const [previous_page,set_previous_page]=useState('')
    const [focused_search_result,set_focused_search_result]=useState(undefined)
    const [search_results, set_search_results] = useState([])
    const [event_data,set_event_data]=useState({})

    
    const navigate = useNavigate()
    function nav(url) {
        navigate(url);
    }

    useEffect(()=>{
        if(localStorage.getItem('event')!==undefined){
            set_event_data(JSON.parse(localStorage.getItem('event')))
            console.log(event_data)
        }else{
            nav('/')
        }
        
    },[])
  

    if(page==='ocr'){
        return <OCR_index set_page={set_page} set_focused_search_result={set_focused_search_result} focused_search_result={focused_search_result} event_data={event_data}/>
    }else if(page==='manual_search'){
        return <Manual_lookup set_search_results={set_search_results} search_results={search_results} set_page={set_page} set_focused_search_result={set_focused_search_result} focused_search_result={focused_search_result} event_data={event_data}/>
    }else if(page==='found'){
        console.log(focused_search_result)
        return <Guest_checkin set_page={set_page} set_focused_search_result={set_focused_search_result} focused_search_result={focused_search_result} event_data={event_data}/>
    }
}