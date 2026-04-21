import React, { useEffect, useState } from "react";
import './data_view.css'
import { data, resolvePath, useNavigate } from "react-router-dom";
import data_api from "../utility";

export default function Event_data_management() {
    const [event_data_results, set_event_data_results] = useState([])
    const [event_data, set_event_data] = useState(null)
    const [page, set_page] = useState(undefined)
    const [per_page, set_per_page] = useState(25)
    const [event_meta_data, set_event_meta_data] = useState(undefined)
    const [search_query, set_search_query] = useState('')
    const [data_retrival_status, set_data_retrival_status] = useState('loading')
    
    const navigate = useNavigate()
    function nav(url) {
        navigate(url);
    }

    function get_data(dir='') {
        if (search_query.length > 0) {
            get_search_data(dir)
        } else (
            get_event_data(dir)
        )
    }


    async function get_event_data(dir=null) {
        set_data_retrival_status('loading')
        if (event_data !== null) {
            var page_number = dir === 'next' ? page + 1 :dir === 'prev'?page-1 :1;
            var responce = await data_api('/get_event_data', { page: page_number, per_page: per_page, event_id: event_data.serial_no })
            console.log(responce,per_page,page)
            if (responce.code === 0) {
                set_data_retrival_status('done')
                set_event_data_results(responce.data)
                set_event_meta_data(responce.meta)
                set_page(responce.meta.page)
                set_per_page(responce.meta.per_page)

            }
        }
    }

    async function get_search_data() {
        if (event_data !== null && search_query.length > 0) {
            var responce = await data_api('/search_event_data', { search: search_query, event_id: event_data.serial_no })
            console.log(responce)
            if (responce.code === 0) {
                set_data_retrival_status('done')
                set_event_data_results(responce.data)
                set_event_meta_data(responce.meta)
                set_page(responce.meta.page)
                set_per_page(responce.meta.per_page)

            }
        }
    }

    useEffect(() => {
        get_event_data()
    }, [event_data])


    useEffect(() => {
        if (localStorage.getItem('event') !== undefined && localStorage.getItem('event') !== null) {
            set_event_data(prev => { return JSON.parse(localStorage.getItem('event')) })
            console.log(JSON.parse(localStorage.getItem('event')))
        } else {
            nav('/')
        }
        get_event_data()
        console.log("data")
    }, [])





    return (
        <div class="data_view-app">

            {/* <!-- ════ HEADER ════ --> */}
            <div class="data_view-header">
                <div class="data_view-header-left">

                    <div class="event_list-brand-icon">
                        <span class="material-symbols-outlined">account_balance</span>
                    </div>
                </div>
                <div class="data_view-header-right">
                    <button class="data_view-icon-btn" onClick={e => { nav('/event') }}>
                        <span class="data_view-icon">arrow_back</span>
                    </button>
                    <button class="data_view-icon-btn">
                        <span class="data_view-icon">logout</span>
                    </button>

                </div>
            </div>

            {/* <!-- ════ MAIN ════ --> */}
            <div class="data_view-main">

                {/* <!-- Page Header --> */}
                <div class="data_view-page-header">
                    <div class="data_view-title-group">
                        <div class="data_view-page-title">Event Records</div>
                        <div class="data_view-page-subtitle">Manage and monitor event attendee data in real-time.</div>
                    </div>
                    <div class="data_view-header-actions">
                        <button class="data_view-btn-secondary">
                            <span class="data_view-icon" style={{ fontSize: "1.125rem" }}>ios_share</span>
                            Export
                        </button>
                        <button class="data_view-btn-primary">
                            <span class="data_view-icon" style={{ fontSize: "1.125rem" }}>upload</span>
                            Upload Data
                        </button>
                    </div>
                </div>

                {/* <!-- Utility Bar --> */}
                <div class="data_view-utility-bar">
                    <div class="data_view-search-group">
                        <div class="data_view-search-wrapper">
                            <span class="data_view-icon data_view-search-icon">{search_query.length > 0 ? "close" : "search"}</span>
                            <input class="data_view-search-input" placeholder="Search guests by name, id or phone ..." type="text" value={search_query} onChange={e => { set_search_query(e.target.value) }} />
                        </div>
                        <button class="data_view-filter-btn" onClick={e => { get_search_data() }}>
                            <span class="data_view-icon" style={{ fontSize: "1.125rem" }}>database_search</span>
                            search
                        </button>
                    </div>
                    {data_retrival_status !== 'loading' ?
                        <div class="data_view-record-count">Showing {(event_meta_data.page - 1) * event_meta_data.per_page + 1}
                            -
                            {Math.min(
                                event_meta_data.page * event_meta_data.per_page,
                                event_meta_data.total
                            )}of {event_meta_data.total} Records</div>
                        : <div class="data_view-record-count">Loading...</div>
                    }

                </div>

                {(() => {
                    if (event_data_results !== undefined && event_data_results.length > 0) {
                        {/* <!-- Table --> */ }
                        return (
                            <div class="data_view-table-container">
                                <div class="data_view-table-scroll">
                                    <table class="data_view-table">

                                        <thead class="data_view-thead">
                                            <tr class="data_view-thead-row">
                                                <th class="data_view-th-checkbox">
                                                    <input class="data_view-checkbox" type="checkbox" />
                                                </th>
                                                {/* Name */}
                                                <th class="data_view-th data_view-th-name">
                                                    <div class="data_view-sort-wrapper">
                                                        <button class="data_view-sort-btn"><span>Name</span><span class="data_view-icon"
                                                            style={{ fontSize: "0.875rem" }}>unfold_more</span></button>
                                                        <div class="data_view-sort-menu">
                                                            <button class="data_view-sort-option"><span class="data_view-icon"
                                                                style={{ fontSize: "0.875rem" }}>arrow_upward</span>Sort Ascending</button>
                                                            <button class="data_view-sort-option"><span class="data_view-icon"
                                                                style={{ fontSize: "0.875rem" }}>arrow_downward</span>Sort Descending</button>
                                                        </div>
                                                    </div>
                                                </th>
                                                {/* Id number */}
                                                <th class="data_view-th data_view-th-email">
                                                    <div class="data_view-sort-wrapper">
                                                        <button class="data_view-sort-btn"><span>ID Number</span><span class="data_view-icon"
                                                            style={{ fontSize: "0.875rem" }}>unfold_more</span></button>
                                                        <div class="data_view-sort-menu">
                                                            <button class="data_view-sort-option"><span class="data_view-icon"
                                                                style={{ fontSize: "0.875rem" }}>arrow_upward</span>Sort Ascending</button>
                                                            <button class="data_view-sort-option"><span class="data_view-icon"
                                                                style={{ fontSize: "0.875rem" }}>arrow_downward</span>Sort Descending</button>
                                                        </div>
                                                    </div>
                                                </th>

                                                {/* phone */}
                                                <th class="data_view-th data_view-th-phone">
                                                    <div class="data_view-sort-wrapper">
                                                        <button class="data_view-sort-btn"><span>Phone</span><span class="data_view-icon"
                                                            style={{ fontSize: "0.875rem" }}>unfold_more</span></button>
                                                        <div class="data_view-sort-menu">
                                                            <button class="data_view-sort-option"><span class="data_view-icon"
                                                                style={{ fontSize: "0.875rem" }}>arrow_upward</span>Sort Ascending</button>
                                                            <button class="data_view-sort-option"><span class="data_view-icon"
                                                                style={{ fontSize: "0.875rem" }}>arrow_downward</span>Sort Descending</button>
                                                        </div>
                                                    </div>
                                                </th>
                                                {/* county */}
                                                <th class="data_view-th data_view-th-company">
                                                    <div class="data_view-sort-wrapper">
                                                        <button class="data_view-sort-btn"><span>County</span><span class="data_view-icon"
                                                            style={{ fontSize: "0.875rem" }}>unfold_more</span></button>
                                                        <div class="data_view-sort-menu">
                                                            <button class="data_view-sort-option"><span class="data_view-icon"
                                                                style={{ fontSize: "0.875rem" }}>arrow_upward</span>Sort Ascending</button>
                                                            <button class="data_view-sort-option"><span class="data_view-icon"
                                                                style={{ fontSize: "0.875rem" }}>arrow_downward</span>Sort Descending</button>
                                                        </div>
                                                    </div>
                                                </th>
                                                {/* subcounty */}
                                                <th class="data_view-th data_view-th-jobtitle">
                                                    <div class="data_view-sort-wrapper">
                                                        <button class="data_view-sort-btn"><span>Sub county</span><span class="data_view-icon"
                                                            style={{ fontSize: "0.875rem" }}>unfold_more</span></button>
                                                        <div class="data_view-sort-menu">
                                                            <button class="data_view-sort-option"><span class="data_view-icon"
                                                                style={{ fontSize: "0.875rem" }}>arrow_upward</span>Sort Ascending</button>
                                                            <button class="data_view-sort-option"><span class="data_view-icon"
                                                                style={{ fontSize: "0.875rem" }}>arrow_downward</span>Sort Descending</button>
                                                        </div>
                                                    </div>
                                                </th>
                                                {/* visits */}
                                                <th class="data_view-th data_view-th-status">
                                                    <div class="data_view-sort-wrapper">
                                                        <button class="data_view-sort-btn"><span>Checked In</span><span class="data_view-icon"
                                                            style={{ fontSize: "0.875rem" }}>unfold_more</span></button>
                                                        <div class="data_view-sort-menu">
                                                            <button class="data_view-sort-option"><span class="data_view-icon"
                                                                style={{ fontSize: "0.875rem" }}>check</span>Checked in</button>
                                                            <button class="data_view-sort-option"><span class="data_view-icon"
                                                                style={{ fontSize: "0.875rem" }}>close</span>Not checked in</button>
                                                        </div>
                                                    </div>
                                                </th>
                                                <th class="data_view-th data_view-th-checkin">
                                                    <div class="data_view-sort-wrapper">
                                                        <button class="data_view-sort-btn"><span>Check-in Time</span><span class="data_view-icon"
                                                            style={{ fontSize: "0.875rem" }}>unfold_more</span></button>
                                                        <div class="data_view-sort-menu">
                                                            <button class="data_view-sort-option"><span class="data_view-icon"
                                                                style={{ fontSize: "0.875rem" }}>arrow_upward</span>Sort Ascending</button>
                                                            <button class="data_view-sort-option"><span class="data_view-icon"
                                                                style={{ fontSize: "0.875rem" }}>arrow_downward</span>Sort Descending</button>
                                                        </div>
                                                    </div>
                                                </th>

                                                <th class="data_view-th data_view-th-ticket">
                                                    <div class="data_view-sort-wrapper">
                                                        <button class="data_view-sort-btn"><span>CheckedIn By</span><span class="data_view-icon"
                                                            style={{ fontSize: "0.875rem" }}>unfold_more</span></button>
                                                        <div class="data_view-sort-menu">
                                                            <button class="data_view-sort-option"><span class="data_view-icon"
                                                                style={{ fontSize: "0.875rem" }}>arrow_upward</span>Sort Ascending</button>
                                                            <button class="data_view-sort-option"><span class="data_view-icon"
                                                                style={{ fontSize: "0.875rem" }}>arrow_downward</span>Sort Descending</button>
                                                        </div>
                                                    </div>
                                                </th>
                                                <th class="data_view-th data_view-th-source">
                                                    <div class="data_view-sort-wrapper">
                                                        <button class="data_view-sort-btn"><span>Visits</span><span class="data_view-icon"
                                                            style={{ fontSize: "0.875rem" }}>unfold_more</span></button>
                                                        <div class="data_view-sort-menu">
                                                            <button class="data_view-sort-option"><span class="data_view-icon"
                                                                style={{ fontSize: "0.875rem" }}>arrow_upward</span>Sort Ascending</button>
                                                            <button class="data_view-sort-option"><span class="data_view-icon"
                                                                style={{ fontSize: "0.875rem" }}>arrow_downward</span>Sort Descending</button>
                                                        </div>
                                                    </div>
                                                </th>
                                                <th class="data_view-th data_view-th-actions"></th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {/* <!-- Add New Record Row --> */}
                                            <tr class="data_view-add-row">
                                                <td class="data_view-td-add">
                                                    <div class="data_view-add-icon-wrap">
                                                        <span class="data_view-icon" style={{ fontSize: "0.875rem" }}>add_circle</span>
                                                    </div>
                                                </td>
                                                <td class="data_view-td-add">
                                                    <div class="data_view-name-cell">
                                                        <div class="data_view-initials data_view-initials-add">
                                                            <span class="data_view-icon" style={{ fontSize: "0.875rem" }}>person_add</span>
                                                        </div>
                                                        <input class="data_view-inline-input data_view-inline-input-name" placeholder="New Name..."
                                                            type="text" />
                                                    </div>
                                                </td>
                                                <td class="data_view-td-add"><input class="data_view-inline-input" placeholder="Id Number"
                                                    type="email" /></td>
                                                <td class="data_view-td-add"><input class="data_view-inline-input" placeholder="Phone"
                                                    type="tel" /></td>
                                                <td class="data_view-td-add"><input class="data_view-inline-input" placeholder="County"
                                                    type="text" /></td>
                                                <td class="data_view-td-add"><input class="data_view-inline-input" placeholder="Subcounty"
                                                    type="text" /></td>
                                                <td class="data_view-td-add"><span class="data_view-cell-autopending">N/A</span></td>
                                                <td class="data_view-td-add"><span class="data_view-cell-muted">--:--</span></td>
                                                {/* <td class="data_view-td-add">
                                        <select class="data_view-inline-select">
                                            <option value="">Ticket</option>
                                            <option value="standard">Standard</option>
                                            <option value="vip">VIP</option>
                                            <option value="press">Press</option>
                                        </select>
                                    </td> */}
                                                <td class="data_view-td-add"><span class="data_view-cell-muted">N/A</span></td>
                                                <td class="data_view-td-add"><span class="data_view-cell-muted">N/A</span></td>
                                                <td class="data_view-td-right-add">
                                                    <button class="data_view-add-btn">
                                                        <span class="data_view-icon" style={{ fontSize: "1.125rem" }}>add</span>
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* <!-- Row 1 – Julianne Deidre --> */}
                                            {(() => {
                                                return event_data_results.map(record => {
                                                    return (
                                                        <tr class="data_view-tbody-row">
                                                            <td class="data_view-td"><input class="data_view-checkbox" type="checkbox" /></td>
                                                            <td class="data_view-td">
                                                                <div class="data_view-name-cell">
                                                                    <div class="data_view-initials data_view-initials-sc">{record.name.trim().split(/\s+/).slice(0, 2).map(n => n[0].toUpperCase()).join('')}</div>
                                                                    <span class="data_view-guest-name">{record.name}</span>
                                                                </div>
                                                            </td>
                                                            <td class="data_view-td"><span class="data_view-cell-text">{record.id_number}</span></td>
                                                            <td class="data_view-td"><span class="data_view-cell-text">{record.phone}</span></td>
                                                            <td class="data_view-td"><span class="data_view-cell-text">{record.county}</span></td>
                                                            <td class="data_view-td"><span class="data_view-cell-text">{record.subcounty}</span></td>
                                                            <td class="data_view-td"><span class={record.checked_in === 1 ? "data_view-badge data_view-badge-confirmed" : "data_view-badge data_view-badge-cancelled"}>{record.checked_in === 1 ? 'checked in' : 'not_checkedin'}</span></td>
                                                            <td class="data_view-td"><span class="data_view-cell-text">{record.checkin_timestamp}</span></td>
                                                            <td class="data_view-td"><span class="data_view-cell-text">{record.checked_by}</span></td>
                                                            <td class="data_view-td"><span class="data_view-cell-text">{record.visits}</span></td>
                                                            <td class="data_view-td-right"><button class="data_view-more-btn"><span
                                                                class="data_view-icon">more_vert</span></button></td>
                                                        </tr>
                                                    )
                                                })
                                            })()}




                                        </tbody>
                                    </table>
                                </div>

                                {/* <!-- Pagination --> */}
                                <div class="data_view-pagination">
                                    <div class="data_view-rows-group">
                                        <span class="data_view-rows-label">Rows per page:</span>
                                        <select class="data_view-rows-select">
                                            <option>10</option>
                                            <option selected>25</option>
                                            <option>50</option>
                                        </select>
                                    </div>
                                    <div class="data_view-page-group">
                                        <span class="data_view-page-info">Page {event_meta_data.page} of {event_meta_data.pages}</span>
                                        <div class="data_view-page-btns">
                                            <span class="data_view-icon">{data_retrival_status==='loading'?'hourglass_bottom':""}</span>
                                            <button class="data_view-page-btn" disabled={!event_meta_data.has_prev} onClick={e=>{ get_data('prev')}}>
                                                <span class="data_view-icon">chevron_left</span>
                                            </button>
                                            <button class="data_view-page-btn" disabled={!event_meta_data.has_next} onClick={e=>{ get_data('next')}}>
                                                <span class="data_view-icon">chevron_right</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )


                    } else {
                        return (
                            <div class="manual_lookup-empty-state" style={{ padding: '40px 0px', marginTop: '10px' }}>
                                <div class="manual_lookup-empty-icon">
                                    <span class="material-symbols-outlined">close</span>
                                </div>
                                <h4 class="manual_lookup-empty-title">No Data</h4>
                                <p class="manual_lookup-empty-desc">No data found in the database</p>
                                {/* <button class="manual_lookup-btn-register" type="button">Register New Guest</button> */}
                            </div>
                        )
                    }

                })()}

                {/* <!-- Data Health Cards --> */}
                <div class="data_view-cards-grid">
                    <div class="data_view-card">
                        <div class="data_view-card-inner">
                            <div class="data_view-card-label">Database Health</div>
                            <div class="data_view-card-value">99.8%</div>
                            <div class="data_view-card-desc">Verification rate across all verified guest sources.</div>
                        </div>
                        <span class="data_view-icon data_view-card-bg-icon">verified_user</span>
                    </div>
                    <div class="data_view-card">
                        <div class="data_view-card-inner">
                            <div class="data_view-card-label">Pending Requests</div>
                            <div class="data_view-card-value">124</div>
                            <div class="data_view-card-desc">Awaiting manual approval for VIP tiered access.</div>
                        </div>
                        <span class="data_view-icon data_view-card-bg-icon">pending_actions</span>
                    </div>
                    <div class="data_view-card">
                        <div class="data_view-card-inner">
                            <div class="data_view-card-label">Latest Import</div>
                            <div class="data_view-card-value">32m ago</div>
                            <div class="data_view-card-desc">Automatic sync completed from Eventbrite API.</div>
                        </div>
                        <span class="data_view-icon data_view-card-bg-icon">sync</span>
                    </div>
                </div>

                {/* <!-- Danger Zone --> */}
                <div class="data_view-danger-zone">
                    <div class="data_view-danger-text-group">
                        <div class="data_view-danger-title">Danger Zone</div>
                        <div class="data_view-danger-desc">Irreversible actions that affect your entire dataset.</div>
                    </div>
                    <button class="data_view-btn-danger">
                        <span class="data_view-icon" style={{ fontSize: "1.125rem" }}>delete_sweep</span>
                        Bulk Delete
                    </button>
                </div>

            </div>



        </div>
    )
}