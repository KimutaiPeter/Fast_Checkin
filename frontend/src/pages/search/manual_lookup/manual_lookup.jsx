import React from "react";
import './manual_lookup.css'
import { useNavigate } from "react-router-dom";
import data_api from "../../utility";
import { useState, useEffect } from "react";
import debounce from "lodash.debounce";


export default function Manual_lookup(props) {
    const [query, set_query] = useState("")
    const [search_results, set_search_results] = useState([])
    const [checkin_popup, set_checkin_popup] = useState(false)
    const [focused_research_result, set_focused_search_result] = useState({})
    const [checkin_status, set_checkin_status] = useState('checkin')


    useEffect(() => {
        if (query > 0) {
            fetchSuggestions(query);
        }
        if (props.search_results !== null) {
            set_search_results(prev => props.search_results)
            console.log('previous results', props.search_results)
        } else {
            console.log('Previous results are null', props.search_results)
        }

    }, [])

    useEffect(() => {
        if (query === "") {

            set_search_results(props.search_results)
        } else {
            props.set_search_results(search_results)

        }

    }, [search_results])






    // Debounced API call
    const fetchSuggestions = debounce(async (q) => {
        if (!q) {
            set_search_results([]);
            return;
        }
        try {
            const data = await data_api('/search2', { "query": query, "event_id": props.event_data.serial_no })
            console.log(data)
            set_search_results(data)
        } catch (err) {
            console.error("Fetch error:", err);
        }
    }, 300); // 300ms debounce

    useEffect(() => {
        fetchSuggestions(query);
    }, [query]);



    const navigate = useNavigate()
    function nav(url) {
        navigate(url);
    }

    const handleClose = () => {
        set_checkin_popup(false)
        set_checkin_status('checkin')
    };


    async function checkinDB(scannedID) {
        set_checkin_status('checking_in')
        var responce = await data_api("/check_in", { 'id_number': scannedID, event_id: props.event_data.serial_no })
        console.log(responce)
        if (responce.code === 0) {
            set_search_results(prev =>
                prev.map(guest =>
                    guest.id_number === scannedID
                        ? { ...guest, checked_in: 1 }
                        : guest
                )
            );
            set_checkin_status(prev => { return 'checked_in' })
        }
    }


    return (
        <div class="manual_lookup-page">
            <div class="manual_lookup-layout">

                {/* <!-- HEADER --> */}
                <header class="manual_lookup-header">
                    <div class="manual_lookup-header-left">
                        <div class="manual_lookup-brand-icon">
                            <span class="material-symbols-outlined">account_balance</span>
                        </div>
                        <h2 class="manual_lookup-brand-name">Events</h2>
                    </div>
                    <div class="manual_lookup-header-right">
                        <div class="manual_lookup-header-actions" >
                            <button class="manual_lookup-icon-btn" type="button" onClick={e => { nav('/') }}>
                                <span class="material-symbols-outlined">arrow_back</span>
                            </button>
                            <button class="manual_lookup-icon-btn" type="button">
                                <span class="material-symbols-outlined">download</span>
                            </button>
                            <button class="manual_lookup-icon-btn" type="button">
                                <span class="material-symbols-outlined">logout</span>
                            </button>
                        </div>

                    </div>
                </header>

                {/* <!-- MAIN --> */}
                <main class="manual_lookup-main">
                    <div class="manual_lookup-content">

                        {/* <!-- Breadcrumb & Title --> */}
                        <div>

                            <h1 class="manual_lookup-page-title">Manual Guest Lookup</h1>
                            <p class="manual_lookup-page-desc">Search, verify, and check-in guests manually using their credentials.</p>
                        </div>

                        {/* <!-- Method Toggle --> */}
                        <div class="manual_lookup-toggle-wrap">
                            <button class="manual_lookup-toggle-btn" type="button" onClick={e => { props.set_page('ocr') }}>
                                <span class="material-symbols-outlined">document_scanner</span>
                                OCR Check-in
                            </button>
                            <button class="manual_lookup-toggle-btn manual_lookup-toggle-btn-active" type="button">
                                <span class="material-symbols-outlined">search</span>
                                Manual Lookup
                            </button>
                        </div>

                        {/* <!-- Search --> */}
                        <div class="manual_lookup-search-wrap">
                            <div class="manual_lookup-search-icon">
                                <span class="material-symbols-outlined">search</span>
                            </div>
                            <input
                                value={query} onChange={e => { set_query(e.target.value) }}
                                class="manual_lookup-search-input"
                                type="text"
                                placeholder="Search by name, ID, or phone..."
                            />
                        </div>

                        {/* <!-- Filters Row --> */}
                        <div class="manual_lookup-filters-row">
                            <h3 class="manual_lookup-section-label">Recent &amp; Matched Guests</h3>
                            <div>
                                <button class="manual_lookup-filter-btn" type="button">
                                    <span class="material-symbols-outlined">filter_list</span>
                                    Filter
                                </button>
                            </div>
                        </div>

                        {/* <!-- Guest List --> */}
                        <div class="manual_lookup-guest-list">
                            {(() => {
                                if (search_results.length > 0) {
                                    return search_results.map((result) => {
                                        return (
                                            <div class="manual_lookup-guest-card" key={result.serial_no}>
                                                <div class="manual_lookup-guest-info">
                                                    <div class="manual_lookup-guest-details">
                                                        <span class="manual_lookup-guest-name">{result.name}</span>
                                                        <div class="manual_lookup-guest-meta">
                                                            <div class="manual_lookup-meta-item">
                                                                <span class="material-symbols-outlined">badge</span>
                                                                <span>{result.id_number}</span>
                                                            </div>
                                                            <div class="manual_lookup-meta-item">
                                                                <span class="material-symbols-outlined">call</span>
                                                                <span>{result.phone_number}</span>
                                                            </div>
                                                        </div>
                                                        <div class="manual_lookup-guest-meta">
                                                            <div class="manual_lookup-meta-item">
                                                                <span class="material-symbols-outlined">calendar_clock</span>
                                                                <span>{result.total_invitations} visit</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="manual_lookup-guest-actions">
                                                    {result.checked_in == 1 ?
                                                        <button class="manual_lookup-btn-checkin" type="button">
                                                            <span class="material-symbols-outlined">login</span>
                                                            Checked in
                                                        </button>
                                                        :
                                                        <button class="manual_lookup-btn-checkin" type="button" onClick={e => { props.set_focused_search_result(prev => result); set_focused_search_result(prev => result); console.log(result, props.focused_research_result); set_checkin_popup(true) }}>
                                                            <span class="material-symbols-outlined">login</span>
                                                            Check In
                                                        </button>
                                                    }

                                                    <button class="manual_lookup-btn-more" type="button" onClick={e => { props.set_focused_search_result(prev => result); props.set_page('found') }}>More</button>
                                                </div>
                                            </div>
                                        )
                                    })
                                } else if (query.length < 2) {
                                    return (
                                        <></>
                                    )
                                } else {
                                    return (

                                        <div class="manual_lookup-empty-state">
                                            <div class="manual_lookup-empty-icon">
                                                <span class="material-symbols-outlined">close</span>
                                            </div>
                                            <h4 class="manual_lookup-empty-title">Not Found</h4>
                                            <p class="manual_lookup-empty-desc">The guest is not found in the system</p>
                                            {/* <button class="manual_lookup-btn-register" type="button">Register New Guest</button> */}
                                        </div>
                                    )
                                }
                            })()}
                        </div>



                    </div>
                </main>

                {(() => {
                    if (checkin_popup && focused_research_result !== undefined) {
                        return (
                            <div className="overlay" onClick={handleClose}>
                                <div className="modal" onClick={(e) => e.stopPropagation()}>
                                    <h3>Found</h3>
                                    <div className="mobile_popup_image center_center_vertical">
                                        <img src="/imgs/checked.svg" alt="" />
                                    </div>

                                    <div class="guest_details-field-group">
                                        <label class="guest_details-label" for="full_name">ID/Passport Number</label>
                                        <div class="guest_details-input-wrapper">
                                            <input class="guest_details-input" id="full_name" name="full_name" type="text"
                                                placeholder="Enter full name" value={focused_research_result.id_number !== undefined ? focused_research_result.id_number : ""} />
                                            <span class="guest_details-icon guest_details-input-icon guest_details-icon-sm">edit</span>
                                        </div>
                                    </div>

                                    {(() => {
                                        if (props.event_data.features.tokens) {
                                            return (
                                                <div class="guest_details-field-group">
                                                    <label class="guest_details-label" for="full_name">ID/Passport Number</label>
                                                    <div class="guest_details-input-wrapper">
                                                        <input class="guest_details-input" id="full_name" name="full_name" type="text"
                                                            placeholder="Enter full name" value={focused_research_result.id_number !== undefined ? focused_research_result.id_number : ""} />
                                                        <span class="guest_details-icon guest_details-input-icon guest_details-icon-sm">badge</span>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    })()}


                                    

                                    <div class="guest_details-actions" onClick={e => { if (checkin_status === 'checked_in') { set_checkin_popup(false) } else if (checkin_status === 'checked_in') { set_checkin_status('checkin') } else { checkinDB(focused_research_result.id_number) } }}>
                                        <button class="guest_details-submit-btn" type="submit">
                                            {checkin_status === 'checkin' ? 'Check in' : checkin_status === 'checking_in' ? 'Please wait...' : checkin_status === 'checked_in' ? 'Continue' : 'Check in'}
                                            <span class="guest_details-icon">check_circle</span>
                                        </button>
                                        {/* <button class="guest_details-cancel-btn" type="button">Cancel</button> */}
                                    </div>

                                </div>
                            </div>
                        )
                    } else if (checkin_popup) {
                        return ("Hello world")
                    }
                })()}



            </div>
        </div>
    )
}