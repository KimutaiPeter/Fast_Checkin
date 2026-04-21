import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './event_list.css'
import data_api, { data_get } from "../utility";


export default function Index(props) {
    const [auth_data, set_auth_data] = useState({})
    const user_data = useState({})
    const [new_event_name, set_new_event_name] = useState('')
    const [new_event_venue, set_new_event_venue] = useState('')
    const [new_event_description, set_new_event_description] = useState('')
    const [new_event_date, set_new_event_date] = useState('')
    const [new_event_features, set_new_event_features] = useState({ ocr: true, bar_code: false, tokens: false, manual_lookup: true, ocr_features: { regex: '' } })

    const [event_list, set_event_list] = useState([])
    const [event_view, set_event_view] = useState('open')
    const [register_event, set_register_event] = useState(false)
    const [event_search_query, set_event_search_query] = useState("")
    


    const navigate = useNavigate()
    function nav(url) {
        navigate(url);
    }

    useEffect(() => {
        var auth_data = localStorage.getItem('auth')
        console.log(auth_data,'helo word')
        if (auth_data != null && auth_data != undefined) {
            console.log(auth_data)
            set_auth_data(JSON.parse(auth_data))
        } else {
            console.log('preemptive',auth_data)
            nav('/auth')
        }
        get_events()
    }, [])


    async function get_events() {
        var responce = await data_get('/get_events', {})
        if (responce.code === 0) {
            console.log(responce)
            set_event_list(responce.events)
        }
    }



    async function add_event() {
        var responce = await data_api('/add_event', { name: new_event_name, venue: new_event_venue, description: new_event_description, features: JSON.stringify(new_event_features), date: new_event_date })
        console.log(responce)
        if (responce.code === 0) {
            get_events()
            set_new_event_name('')
            set_new_event_venue('')
            set_new_event_description('')
            set_new_event_date('')
            set_new_event_features({ ocr: true, bar_code: false, tokens: false, manual_lookup: true, ocr_features: { regex: '' } })

            alert('New event has been added')
        }

    }




    return (
        <div class="event_list-wrapper">
            <div class="event_list-layout-container">

                <header class="event_list-header">
                    <div class="event_list-header-left">
                        <div class="event_list-brand">
                            <div class="event_list-brand-icon">
                                <span class="material-symbols-outlined">account_balance</span>
                            </div>
                            <h2 class="event_list-brand-name">Events</h2>
                        </div>

                    </div>
                    <div class="event_list-header-right">

                        <div class="event_list-header-btns">
                            <button class="event_list-icon-btn" onClick={e => { nav('/team') }}>
                                <span class="material-symbols-outlined">group</span>
                            </button>
                            <button class="event_list-icon-btn" onClick={e => { localStorage.clear(); nav('/install') }}>
                                <span class="material-symbols-outlined">download</span>
                            </button>
                            <button class="event_list-icon-btn" onClick={e => { localStorage.clear(); nav('/auth') }}>
                                <span class="material-symbols-outlined">logout</span>
                            </button>
                        </div>
                    </div>
                </header>


                <main class="event_list-main">
                    <div class="event_list-content-container">
                        <div class="event_list-page-header">
                            <div class="event_list-page-title-group">
                                <h1 class="event_list-page-title">My Events</h1>
                                <p class="event_list-page-subtitle">Gatherings, national celebrations, and administrative conferences.</p>
                                <div class="event_list-search-wrap" style={{ minHeight: "30px" }}>
                                    <div class="event_list-search-inner">
                                        <div class="event_list-search-icon">
                                            <span class="material-symbols-outlined">search</span>
                                        </div>
                                        <input class="event_list-search-input" placeholder="Search events..." type="text" value={event_search_query} onChange={e => { set_event_search_query(e.target.value) }} />
                                    </div>
                                </div>
                            </div>
                            <button class="event_list-register-btn" onClick={e => { set_register_event(prev => { return !prev }) }}>
                                <span class="material-symbols-outlined">add</span>
                                <span>Register Event</span>
                            </button>
                        </div>


                        <div class="event_list-tabs-wrap">
                            <div class="event_list-tabs">
                                <a class={event_view === 'open' ? "event_list-tab event_list-tab-active" : "event_list-tab"} href="#" onClick={e => { set_event_view('open') }}>
                                    <span class="material-symbols-outlined">confirmation_number</span>
                                    Open Events
                                </a>
                                <a class={event_view === 'all' ? "event_list-tab event_list-tab-active" : "event_list-tab"} href="#" onClick={e => { set_event_view('all') }}>
                                    <span class="material-symbols-outlined">history</span>
                                    All Events
                                </a>
                            </div>
                        </div>


                        <div class="event_list-events-grid">
                            {(() => {
                                if (auth_data.user_type == 'admin' && register_event === true) {
                                    return (
                                        <div class="event_list-card">

                                            <div class="event_list-card-body">
                                                <div class="event_list-card-title-row">
                                                    <span class="material-symbols-outlined">add_circle</span>
                                                    <h3 class="event_list-card-title">Create New Event</h3>
                                                </div>
                                                <div class="event_list-form-grid">
                                                    <div class="event_list-form-field">
                                                        <label class="event_list-form-label">Event Name</label>
                                                        <input class="event_list-form-input" placeholder="e.g. Annual Tech Summit" type="text" value={new_event_name} onChange={e => { set_new_event_name(e.target.value) }} />
                                                    </div>
                                                    <div class="event_list-form-field">
                                                        <label class="event_list-form-label">Date</label>
                                                        <input class="event_list-form-input" type="date" value={new_event_date} onChange={(e) => set_new_event_date(e.target.value)} />
                                                    </div>
                                                    <div class="event_list-form-field">
                                                        <label class="event_list-form-label">Location</label>
                                                        <input class="event_list-form-input" placeholder="City or Venue" type="text" value={new_event_venue} onChange={e => { set_new_event_venue(e.target.value) }} />
                                                    </div>
                                                </div>
                                                <div class="event_list-form-grid">
                                                    <div class="event_list-form-field">
                                                        <label class="event_list-form-label">Description</label>
                                                        <input class="event_list-form-input" placeholder="e.g. Annual Tech Summit" type="text" value={new_event_description} onChange={e => { set_new_event_description(e.target.value) }} />
                                                    </div>

                                                </div>
                                                <div class="event_list-features-section">
                                                    <span class="event_list-features-label">Event Features</span>
                                                    <div class="event_list-features-list">
                                                        <label class="event_list-checkbox-label">
                                                            <input class="event_list-checkbox" type="checkbox" checked={new_event_features.ocr} onChange={(e) => set_new_event_features(prev => ({ ...prev, ocr: e.target.checked, bar_code: !e.target.checked }))} />
                                                            <span class="event_list-checkbox-text">Enable OCR Scanning</span>
                                                        </label>
                                                        <label class="event_list-checkbox-label">
                                                            <input class="event_list-checkbox" type="checkbox" checked={new_event_features.bar_code} onChange={(e) => set_new_event_features(prev => ({ ...prev, ocr: !e.target.checked, bar_code: e.target.checked }))} />
                                                            <span class="event_list-checkbox-text">Enable Barcode Scanning</span>
                                                        </label>
                                                        <label class="event_list-checkbox-label">
                                                            <input class="event_list-checkbox" type="checkbox" checked={new_event_features.tokens} onChange={(e) => set_new_event_features(prev => ({ ...prev, tokens: e.target.checked }))} />
                                                            <span class="event_list-checkbox-text">Include Tokens</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="event_list-card-footer">
                                                    <button class="event_list-create-btn" onClick={e => { add_event() }}>
                                                        <span class="material-symbols-outlined">check_circle</span>
                                                        Create Event
                                                    </button>
                                                </div>
                                            </div>


                                        </div>
                                    )
                                }
                            })()}


                            {/* Type 2 */}
                            {(() => {
                                return event_list.map((event) => {
                                    if (event_view == 'open') {
                                        if (event.status === 'active') {
                                            return (
                                                <div class="event_list-card">
                                                    <div class="event_list-event-card-body">
                                                        <div class="event_list-event-card-top">
                                                            <div class="event_list-event-card-header">
                                                                {
                                                                    event.status === 'active' ?
                                                                        <span class="event_list-badge event_list-badge-conference">Open</span>
                                                                        : <span class="event_list-badge event_list-badge-national">Closed</span>
                                                                }
                                                                <span class="event_list-views">
                                                                    <span class="material-symbols-outlined">person</span>{event.total_invites}
                                                                </span>
                                                            </div>
                                                            <h3 class="event_list-event-name">{event.name}</h3>
                                                            <div class="event_list-event-meta">
                                                                <div class="event_list-meta-row">
                                                                    <span class="material-symbols-outlined">calendar_today</span>
                                                                    <span>{event.date}</span>
                                                                </div>
                                                                <div class="event_list-meta-row">
                                                                    <span class="material-symbols-outlined">location_on</span>
                                                                    <span>{event.venue}</span>
                                                                </div>
                                                            </div>
                                                            <p class="event_list-event-desc">{event.description}</p>
                                                        </div>
                                                        <div class="event_list-event-card-actions">
                                                            <div class="event_list-status">
                                                                {/* <span class="event_list-status-dot"></span> */}
                                                                <span class="event_list-status-text"></span>
                                                            </div>

                                                            <div className="event_list-event-card-actions" style={{ gap: "10px" }}>
                                                                {auth_data.user_type === 'admin' ?
                                                                    <button class="event_list-btn-dark" onClick={e => { localStorage.setItem('event', JSON.stringify(event)); nav("/event") }}>
                                                                        <span class="material-symbols-outlined" style={{ color: "white" }}>settings</span>
                                                                        Manage
                                                                    </button> : ""
                                                                }

                                                                <button class="event_list-btn-dark" onClick={e => { localStorage.setItem('event', JSON.stringify(event)); nav("/search") }}>
                                                                    <span class="material-symbols-outlined" style={{ color: "white" }}>how_to_reg</span>
                                                                    Check-in
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    } else {
                                        return (
                                            <div class="event_list-card">
                                                <div class="event_list-event-card-body">
                                                    <div class="event_list-event-card-top">
                                                        <div class="event_list-event-card-header">
                                                            {
                                                                event.status === 'active' ?
                                                                    <span class="event_list-badge event_list-badge-conference">Open</span>
                                                                    : <span class="event_list-badge event_list-badge-national">Closed</span>
                                                            }
                                                            <span class="event_list-views">
                                                                <span class="material-symbols-outlined">visibility</span>{event.total_invites}
                                                            </span>
                                                        </div>
                                                        <h3 class="event_list-event-name">{event.name}</h3>
                                                        <div class="event_list-event-meta">
                                                            <div class="event_list-meta-row">
                                                                <span class="material-symbols-outlined">calendar_today</span>
                                                                <span>{event.date}</span>
                                                            </div>
                                                            <div class="event_list-meta-row">
                                                                <span class="material-symbols-outlined">location_on</span>
                                                                <span>{event.venue}</span>
                                                            </div>
                                                        </div>
                                                        <p class="event_list-event-desc">{event.description}</p>
                                                    </div>
                                                    <div class="event_list-event-card-actions">
                                                        <div class="event_list-status">
                                                            {/* <span class="event_list-status-dot"></span> */}
                                                            <span class="event_list-status-text"></span>
                                                        </div>

                                                        <div className="event_list-event-card-actions" style={{ gap: "10px" }}>
                                                            {auth_data.user_type === 'admin' ?
                                                                <button class="event_list-btn-dark" onClick={e => { localStorage.setItem('event', JSON.stringify(event)); nav("/event") }}>
                                                                    <span class="material-symbols-outlined" style={{ color: "white" }}>settings</span>
                                                                    Manage
                                                                </button> : ""
                                                            }

                                                            <button class="event_list-btn-dark" onClick={e => { localStorage.setItem('event', JSON.stringify(event)); nav("/search") }}>
                                                                <span class="material-symbols-outlined" style={{ color: "white" }}>how_to_reg</span>
                                                                Check-in
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                })
                            })()}



                            {/* When theres no events */}
                            {(() => {
                                if (event_list.length <= 0)
                                    return (
                                        <div class="manual_lookup-empty-state">
                                            <div class="manual_lookup-empty-icon">
                                                <span class="material-symbols-outlined">close</span>
                                            </div>
                                            <h4 class="manual_lookup-empty-title">Not Found</h4>
                                            <p class="manual_lookup-empty-desc">No events were found</p>
                                            {/* <button class="manual_lookup-btn-register" type="button">Register New Guest</button> */}
                                        </div>
                                    )
                            })()}





                        </div>
                    </div>
                </main>

            </div>
        </div>
    )
}