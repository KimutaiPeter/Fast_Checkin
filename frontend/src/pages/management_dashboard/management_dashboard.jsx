import React, { useEffect, useState } from "react";
import { resolvePath, useNavigate } from "react-router-dom";

import './management_dashboard.css'

import data_api from "../utility";

export default function Event_management_dashboard(props) {
    const [event_data, set_event_data] = useState({})
    const navigate = useNavigate()
    function nav(url) {
        navigate(url);
    }

    useEffect(() => {
        if (localStorage.getItem('event') !== undefined && localStorage.getItem('event') !== null) {
            set_event_data(JSON.parse(localStorage.getItem('event')))
            console.log(JSON.parse(localStorage.getItem('event')))
        } else {
            nav('/')
        }
    }, [])


    async function delete_event() {
        if (event_data !== undefined) {
            var responce = await data_api('/delete_event', { serial_no: event_data.serial_no })
            console.log(responce)
            if (responce.code === 0) {
                nav('/')
            }

        }

    }

    return (
        <div class="management-page-wrapper">

            {/* <!-- ═════════ HEADER --> */}
            <header class="management-header">
                <div class="management-header-inner">
                    {/* <!-- Left: Logo + Nav --> */}
                    <div class="management-header-left">
                        <div class="management-logo">
                            <div class="management-logo-icon">
                                <span class="management-material-symbols-outlined management-fill-1">account_balance</span>
                            </div>
                            <span class="management-logo-text">Events</span>
                        </div>

                    </div>
                    {/* <!-- Right: Actions --> */}
                    <div class="management-header-actions">
                        <button class="management-icon-btn" onClick={e => { nav('/') }}>
                            <span class="management-material-symbols-outlined">arrow_back</span>
                        </button>
                        <button class="management-icon-btn" onClick={e => { nav('/install') }}>
                            <span class="management-material-symbols-outlined">download</span>
                        </button>
                        <button class="management-icon-btn" onClick={e => { localStorage.clear(); nav('/') }}>
                            <span class="management-material-symbols-outlined">logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* <!-- MAIN --> */}
            <main class="management-main">

                {/* <!-- ── Dashboard Header ── --> */}
                <div class="management-dashboard-header">
                    <div class="management-dashboard-header-text">
                        <h1 class="management-page-title">{event_data.name}</h1>
                        <p class="management-page-subtitle">
                            {event_data.description}
                        </p>
                        <div class="management-event-location">
                            <span class="management-material-symbols-outlined">location_on</span>
                            <span>{event_data.venue}</span>
                        </div>
                    </div>
                    <div class="management-dashboard-actions">
                        <select class="management-event-select" aria-label="Set Event Status">
                            <option value="open" selected>Event: Open</option>
                            <option value="paused">Event: Paused</option>
                            <option value="closed">Event: Closed</option>
                        </select>
                        <button class="management-btn-primary">
                            <span class="management-material-symbols-outlined">add</span>
                            Register Event
                        </button>
                    </div>
                </div>

                {/* <!-- ── Two-Column Grid ── --> */}
                <div class="management-grid-layout">

                    {/* <!-- ════ LEFT COLUMN ════ --> */}
                    <div class="management-col-left">

                        {/* <!-- ── Attendance Summary Card ── --> */}
                        <div class="management-card">
                            <h3 class="management-card-title">Attendance Summary</h3>
                            <div class="management-summary-grid">
                                {/* <!-- Total Guests --> */}
                                <div>
                                    <span class="management-stat-label">Total Guests</span>
                                    <div class="management-stat-value">{event_data.total_invites}</div>
                                    <div class="management-progress-track">
                                        <div class="management-progress-fill" style={{ width: "100%" }}></div>
                                    </div>
                                </div>
                                {/* <!-- Checked-In --> */}
                                <div>
                                    <span class="management-stat-label">Checked-In</span>
                                    <div class="management-stat-value management-primary">{event_data.total_invites > 0?event_data.total_checkedin:0}</div>
                                    <div class="management-progress-track">
                                        <div class="management-progress-fill" style={{
                                            width: `${event_data.total_invites > 0
                                                ? (event_data.total_checkedin / event_data.total_invites) * 100
                                                : 0
                                                }%`
                                        }}></div>
                                    </div>
                                </div>
                                {/* <!-- Remaining --> */}
                                <div>
                                    <span class="management-stat-label">Remaining</span>
                                    <div class="management-stat-value management-muted">{event_data.total_invites > 0 ? parseInt(event_data.total_invites) - parseInt(event_data.total_checkedin):0}</div>
                                    <div class="management-progress-track">
                                        <div class="management-progress-fill management-muted-fill" style={{
                                            width: `${event_data.total_invites > 0
                                                ? ((parseInt(event_data.total_invites) - parseInt(event_data.total_checkedin)) / event_data.total_invites) * 100
                                                : 0
                                                }%`
                                        }}></div>
                                    </div>
                                </div>
                            </div>
                            <div class="management-card-actions">
                                <button class="management-btn-primary-lg" onClick={e=>{nav('/event_data')}}>
                                    <span class="management-material-symbols-outlined" >database</span>
                                    Event Data
                                </button>
                                <button class="management-btn-secondary-lg" onClick={e=>{nav('/search')}}>
                                    <span class="management-material-symbols-outlined">confirmation_number</span>
                                    Check in
                                </button>
                                <button class="management-btn-secondary-lg" onClick={e=>{nav('/event_data_upload')}}>
                                    <span class="management-material-symbols-outlined">database_upload</span>
                                    Upload Data
                                </button>
                            </div>
                        </div>

                        {/* <!-- ── Active Event Features Card ── --> */}
                        <div class="management-card">
                            <div class="management-features-header">
                                <h4 class="management-features-title">Active Event Features</h4>
                                <button class="management-features-edit-btn">Edit Configuration</button>
                            </div>
                            <div class="management-features-grid">
                                {/* <!-- OCR Scanning (active) --> */}
                                <div class="management-feature-item">
                                    <div class="management-checkbox-active">
                                        <span class="management-material-symbols-outlined">check</span>
                                    </div>
                                    <div>
                                        <div class="management-feature-name">OCR Scanning</div>
                                        <div class="management-feature-desc">Automatic guest recognition</div>
                                    </div>
                                </div>
                                {/* <!-- Barcode Scanning (active) --> */}
                                <div class="management-feature-item">
                                    <div class="management-checkbox-active">
                                        <span class="management-material-symbols-outlined">check</span>
                                    </div>
                                    <div>
                                        <div class="management-feature-name">Barcode Scanning</div>
                                        <div class="management-feature-desc">Digital ticket verification</div>
                                    </div>
                                </div>
                                {/* <!-- Include Tokens (inactive) --> */}
                                <div class="management-feature-item management-disabled">
                                    <div class="management-checkbox-inactive"></div>
                                    <div>
                                        <div class="management-feature-name">Include Tokens</div>
                                        <div class="management-feature-desc">Post-event digital rewards</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* <!-- ── Scanning Configuration Card ── --> */}
                        <div class="management-card">
                            <h4 class="management-scan-config-title">Scanning Configuration</h4>
                            <div class="management-form-group">
                                <label class="management-form-label" for="scan-regex">Scanning Pattern (Regex)</label>
                                <div class="management-input-row">
                                    <input class="management-text-input" id="scan-regex" name="scan-regex" placeholder="^[A-Z0-9]{8,12}$"
                                        type="text" />
                                    <button class="management-btn-save">
                                        <span class="management-material-symbols-outlined">save</span>
                                        Save Configuration
                                    </button>
                                </div>
                                <p class="management-form-hint">Define the regular expression for the OCR scanner.</p>
                            </div>
                        </div>

                    </div>

                    {/* <!-- ════ RIGHT COLUMN ════ --> */}
                    <div class="management-col-right">

                        {/* <!-- ── Arrival Rate / Donut Card ── --> */}
                        <div class="management-card management-donut-card">
                            <div class="management-donut-wrap">
                                <svg class="management-donut-svg" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
                                    {/* <!-- Track --> */}
                                    <circle cx="96" cy="96" r="88" fill="transparent" stroke="#e6e8ea" stroke-width="8" />
                                    {/* <!-- Progress (72.8% of circumference 552.9 ≈ 402.5 offset = 150.4) --> */}
                                    {(() => {
                                        const radius = 88;
                                        const circumference = 2 * Math.PI * radius;
                                        const percentage = event_data.total_invites > 0 ? Number(((event_data.total_checkedin / event_data.total_invites) * 100).toFixed(1)) : 0;
                                        const progress = percentage.toFixed(1); // dynamic value
                                        const offset = circumference - (progress / 100) * circumference;

                                        return (
                                            <circle cx="96" cy="96" r="88" fill="transparent" stroke="#003EB3" stroke-width="12"
                                                stroke-linecap="round" stroke-dasharray={circumference} stroke-dashoffset={offset} />
                                        )
                                    })()}

                                </svg>
                                <div class="management-donut-inner">
                                    <span class="management-donut-value">{`${event_data.total_invites > 0
                                        ? ((event_data.total_checkedin / event_data.total_invites) * 100).toFixed(1)
                                        : 0
                                        }%`}</span>
                                    <span class="management-donut-label">Attendance</span>
                                </div>
                            </div>
                            {/* <div>
                                <div class="management-live-indicator">
                                    <span class="management-pulse-dot"></span>
                                    <span class="management-live-text">Live Feed Active</span>
                                </div>
                                <p class="management-arrival-desc">Approximately 14 guests arriving every 5 minutes.</p>
                            </div> */}
                        </div>

                        {/* <!-- ── Secondary Info Card ── --> */}
                        <div class="management-card management-space-y-8">
                            {/* <!-- Staff --> */}
                            <div>
                                <span class="management-info-section-label">My Team on Duty</span>
                                <div class="management-staff-row">
                                    <div class="management-avatar-stack">
                                        
                                        <div class="management-avatar-extra">
                                            <span class="management-material-symbols-outlined">person</span>
                                            </div>
                                        <div class="management-avatar-extra">
                                            <span class="management-material-symbols-outlined">person</span>
                                        </div>
                                        <div class="management-avatar-extra">
                                            8
                                        </div>
                                    </div>
                                    <button class="management-manage-team-btn" onClick={e => { nav('/team') }}>Manage Team</button>
                                </div>
                            </div>

                            {/* <!-- Broadcast --> */}
                            <div class="management-divider-wrap">
                                <button class="management-broadcast-btn">
                                    <span class="management-broadcast-label">Broadcast Announcement</span>
                                    <span class="management-material-symbols-outlined">campaign</span>
                                </button>
                            </div>
                        </div>

                        {/* <!-- ── Dark Support Card ── --> */}
                        <div class="management-dark-card">
                            <h5 class="management-dark-card-title">Delete Event</h5>
                            <p class="management-dark-card-body">All invitation records will be deleted along with the event</p>
                            <button class="management-dark-card-btn center_center_horizontal" style={{ color: 'red' }} onClick={e => { delete_event() }}><span class="management-material-symbols-outlined" style={{ color: 'red' }}>delete</span>Delete</button>
                        </div>

                    </div>

                </div>

            </main>

            {/* <!-- ══════ FAB =============--> */}
            <button class="management-fab" aria-label="Add">
                <span class="management-material-symbols-outlined">add</span>
            </button>

        </div>

    )
}