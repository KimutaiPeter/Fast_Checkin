import React from "react";
import { resolvePath, useNavigate } from "react-router-dom";

export default function Master_record_management(){
    const navigate = useNavigate()
    function nav(url) {
        navigate(url);
    }

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
                    <button class="data_view-icon-btn" onClick={e=>{nav('/event')}}>
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
                        <div class="data_view-page-title">Guest Records</div>
                        <div class="data_view-page-subtitle">Manage and monitor event attendee data in real-time.</div>
                    </div>
                    <div class="data_view-header-actions">
                        <button class="data_view-btn-secondary">
                            <span class="data_view-icon" style={{fontSize:"1.125rem"}}>ios_share</span>
                            Export
                        </button>
                        <button class="data_view-btn-primary">
                            <span class="data_view-icon" style={{fontSize:"1.125rem"}}>upload</span>
                            Upload Data
                        </button>
                    </div>
                </div>

                {/* <!-- Utility Bar --> */}
                <div class="data_view-utility-bar">
                    <div class="data_view-search-group">
                        <div class="data_view-search-wrapper">
                            <span class="data_view-icon data_view-search-icon">search</span>
                            <input class="data_view-search-input" placeholder="Search guests by name, email or source..." type="text" />
                        </div>
                        <button class="data_view-filter-btn">
                            <span class="data_view-icon" style={{fontSize:"1.125rem"}}>filter_list</span>
                            Filter
                        </button>
                    </div>
                    <div class="data_view-record-count">Showing 1-12 of 1,248 Records</div>
                </div>

                {/* <!-- Table --> */}
                <div class="data_view-table-container">
                    <div class="data_view-table-scroll">
                        <table class="data_view-table">

                            <thead class="data_view-thead">
                                <tr class="data_view-thead-row">
                                    <th class="data_view-th-checkbox">
                                        <input class="data_view-checkbox" type="checkbox" />
                                    </th>
                                    <th class="data_view-th data_view-th-name">
                                        <div class="data_view-sort-wrapper">
                                            <button class="data_view-sort-btn"><span>Name</span><span class="data_view-icon"
                                                style={{fontSize:"0.875rem"}}>unfold_more</span></button>
                                            <div class="data_view-sort-menu">
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_upward</span>Sort Ascending</button>
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_downward</span>Sort Descending</button>
                                            </div>
                                        </div>
                                    </th>
                                    <th class="data_view-th data_view-th-email">
                                        <div class="data_view-sort-wrapper">
                                            <button class="data_view-sort-btn"><span>Email</span><span class="data_view-icon"
                                                style={{fontSize:"0.875rem"}}>unfold_more</span></button>
                                            <div class="data_view-sort-menu">
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_upward</span>Sort Ascending</button>
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_downward</span>Sort Descending</button>
                                            </div>
                                        </div>
                                    </th>
                                    <th class="data_view-th data_view-th-phone">
                                        <div class="data_view-sort-wrapper">
                                            <button class="data_view-sort-btn"><span>Phone</span><span class="data_view-icon"
                                                style={{fontSize:"0.875rem"}}>unfold_more</span></button>
                                            <div class="data_view-sort-menu">
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_upward</span>Sort Ascending</button>
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_downward</span>Sort Descending</button>
                                            </div>
                                        </div>
                                    </th>
                                    <th class="data_view-th data_view-th-company">
                                        <div class="data_view-sort-wrapper">
                                            <button class="data_view-sort-btn"><span>Company</span><span class="data_view-icon"
                                                style={{fontSize:"0.875rem"}}>unfold_more</span></button>
                                            <div class="data_view-sort-menu">
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_upward</span>Sort Ascending</button>
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_downward</span>Sort Descending</button>
                                            </div>
                                        </div>
                                    </th>
                                    <th class="data_view-th data_view-th-jobtitle">
                                        <div class="data_view-sort-wrapper">
                                            <button class="data_view-sort-btn"><span>Job Title</span><span class="data_view-icon"
                                                style={{fontSize:"0.875rem"}}>unfold_more</span></button>
                                            <div class="data_view-sort-menu">
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_upward</span>Sort Ascending</button>
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_downward</span>Sort Descending</button>
                                            </div>
                                        </div>
                                    </th>
                                    <th class="data_view-th data_view-th-status">
                                        <div class="data_view-sort-wrapper">
                                            <button class="data_view-sort-btn"><span>Status</span><span class="data_view-icon"
                                                style={{fontSize:"0.875rem"}}>unfold_more</span></button>
                                            <div class="data_view-sort-menu">
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_upward</span>Sort Ascending</button>
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_downward</span>Sort Descending</button>
                                            </div>
                                        </div>
                                    </th>
                                    <th class="data_view-th data_view-th-checkin">
                                        <div class="data_view-sort-wrapper">
                                            <button class="data_view-sort-btn"><span>Check-in Time</span><span class="data_view-icon"
                                                style={{fontSize:"0.875rem"}}>unfold_more</span></button>
                                            <div class="data_view-sort-menu">
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_upward</span>Sort Ascending</button>
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_downward</span>Sort Descending</button>
                                            </div>
                                        </div>
                                    </th>
                                    <th class="data_view-th data_view-th-regdate">
                                        <div class="data_view-sort-wrapper">
                                            <button class="data_view-sort-btn"><span>Reg. Date</span><span class="data_view-icon"
                                                style={{fontSize:"0.875rem"}}>unfold_more</span></button>
                                            <div class="data_view-sort-menu">
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_upward</span>Sort Ascending</button>
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_downward</span>Sort Descending</button>
                                            </div>
                                        </div>
                                    </th>
                                    <th class="data_view-th data_view-th-ticket">
                                        <div class="data_view-sort-wrapper">
                                            <button class="data_view-sort-btn"><span>Ticket Type</span><span class="data_view-icon"
                                                style={{fontSize:"0.875rem"}}>unfold_more</span></button>
                                            <div class="data_view-sort-menu">
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_upward</span>Sort Ascending</button>
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_downward</span>Sort Descending</button>
                                            </div>
                                        </div>
                                    </th>
                                    <th class="data_view-th data_view-th-source">
                                        <div class="data_view-sort-wrapper">
                                            <button class="data_view-sort-btn"><span>Source</span><span class="data_view-icon"
                                                style={{fontSize:"0.875rem"}}>unfold_more</span></button>
                                            <div class="data_view-sort-menu">
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_upward</span>Sort Ascending</button>
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_downward</span>Sort Descending</button>
                                            </div>
                                        </div>
                                    </th>
                                    <th class="data_view-th data_view-th-notes">
                                        <div class="data_view-sort-wrapper">
                                            <button class="data_view-sort-btn"><span>Notes</span><span class="data_view-icon"
                                                style={{fontSize:"0.875rem"}}>unfold_more</span></button>
                                            <div class="data_view-sort-menu">
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_upward</span>Sort Ascending</button>
                                                <button class="data_view-sort-option"><span class="data_view-icon"
                                                    style={{fontSize:"0.875rem"}}>arrow_downward</span>Sort Descending</button>
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
                                            <span class="data_view-icon" style={{fontSize:"0.875rem"}}>add_circle</span>
                                        </div>
                                    </td>
                                    <td class="data_view-td-add">
                                        <div class="data_view-name-cell">
                                            <div class="data_view-initials data_view-initials-add">
                                                <span class="data_view-icon" style={{fontSize:"0.875rem"}}>person_add</span>
                                            </div>
                                            <input class="data_view-inline-input data_view-inline-input-name" placeholder="New Name..."
                                                type="text" />
                                        </div>
                                    </td>
                                    <td class="data_view-td-add"><input class="data_view-inline-input" placeholder="email@example.com"
                                        type="email" /></td>
                                    <td class="data_view-td-add"><input class="data_view-inline-input" placeholder="+1 (555) 000-0000"
                                        type="tel" /></td>
                                    <td class="data_view-td-add"><input class="data_view-inline-input" placeholder="Company Name"
                                        type="text" /></td>
                                    <td class="data_view-td-add"><input class="data_view-inline-input" placeholder="Job Title"
                                        type="text" /></td>
                                    <td class="data_view-td-add"><span class="data_view-cell-autopending">Auto-Pending</span></td>
                                    <td class="data_view-td-add"><span class="data_view-cell-muted">--:--</span></td>
                                    <td class="data_view-td-add"><input class="data_view-inline-input" type="date" /></td>
                                    <td class="data_view-td-add">
                                        <select class="data_view-inline-select">
                                            <option value="">Ticket</option>
                                            <option value="standard">Standard</option>
                                            <option value="vip">VIP</option>
                                            <option value="press">Press</option>
                                        </select>
                                    </td>
                                    <td class="data_view-td-add">
                                        <select class="data_view-inline-select">
                                            <option value="">Select Source</option>
                                            <option value="direct">Direct Invite</option>
                                            <option value="website">Website Form</option>
                                            <option value="referral">Referral</option>
                                            <option value="manual">Manual Entry</option>
                                        </select>
                                    </td>
                                    <td class="data_view-td-add"><input class="data_view-inline-input" placeholder="Notes..." type="text" />
                                    </td>
                                    <td class="data_view-td-right-add">
                                        <button class="data_view-add-btn">
                                            <span class="data_view-icon" style={{fontSize:"1.125rem"}}>add</span>
                                        </button>
                                    </td>
                                </tr>

                                {/* <!-- Row 1 – Julianne Deidre --> */}
                                <tr class="data_view-tbody-row">
                                    <td class="data_view-td"><input class="data_view-checkbox" type="checkbox" /></td>
                                    <td class="data_view-td">
                                        <div class="data_view-name-cell">
                                            <div class="data_view-initials data_view-initials-sc">JD</div>
                                            <span class="data_view-guest-name">Julianne Deidre</span>
                                        </div>
                                    </td>
                                    <td class="data_view-td"><span class="data_view-cell-text">j.deidre@stellar.com</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">+1 (555) 092-1244</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Stellar Systems</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Product Director</span></td>
                                    <td class="data_view-td"><span class="data_view-badge data_view-badge-confirmed">Confirmed</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Oct 12, 09:15 AM</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Oct 05, 2024</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">VIP</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Direct Invite</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-italic">Requested front row seating</span></td>
                                    <td class="data_view-td-right"><button class="data_view-more-btn"><span
                                        class="data_view-icon">more_vert</span></button></td>
                                </tr>

                                {/* <!-- Row 2 – Marcus Knight --> */}
                                <tr class="data_view-tbody-row">
                                    <td class="data_view-td"><input class="data_view-checkbox" type="checkbox" /></td>
                                    <td class="data_view-td">
                                        <div class="data_view-name-cell">
                                            <div class="data_view-initials data_view-initials-tf">MK</div>
                                            <span class="data_view-guest-name">Marcus Knight</span>
                                        </div>
                                    </td>
                                    <td class="data_view-td"><span class="data_view-cell-text">m.knight@webflow.io</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">+44 20 7946 0123</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Webflow Inc.</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Lead Designer</span></td>
                                    <td class="data_view-td"><span class="data_view-badge data_view-badge-pending">Pending</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">--:--</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Oct 08, 2024</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Standard</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Website Form</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">--</span></td>
                                    <td class="data_view-td-right"><button class="data_view-more-btn"><span
                                        class="data_view-icon">more_vert</span></button></td>
                                </tr>

                                {/* <!-- Row 3 – Sarah Chen --> */}
                                <tr class="data_view-tbody-row">
                                    <td class="data_view-td"><input class="data_view-checkbox" type="checkbox" /></td>
                                    <td class="data_view-td">
                                        <div class="data_view-name-cell">
                                            <div class="data_view-initials data_view-initials-sf">SC</div>
                                            <span class="data_view-guest-name">Sarah Chen</span>
                                        </div>
                                    </td>
                                    <td class="data_view-td"><span class="data_view-cell-text">schen@techglobal.com</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">+65 9123 4567</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Tech Global</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Senior Engineer</span></td>
                                    <td class="data_view-td"><span class="data_view-badge data_view-badge-confirmed">Confirmed</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Oct 12, 08:45 AM</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Oct 02, 2024</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">VIP</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Referral</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Keynote Speaker</span></td>
                                    <td class="data_view-td-right"><button class="data_view-more-btn"><span
                                        class="data_view-icon">more_vert</span></button></td>
                                </tr>

                                {/* <!-- Row 4 – Elena Belova --> */}
                                <tr class="data_view-tbody-row">
                                    <td class="data_view-td"><input class="data_view-checkbox" type="checkbox" /></td>
                                    <td class="data_view-td">
                                        <div class="data_view-name-cell">
                                            <div class="data_view-initials data_view-initials-ov">EB</div>
                                            <span class="data_view-guest-name">Elena Belova</span>
                                        </div>
                                    </td>
                                    <td class="data_view-td"><span class="data_view-cell-text">elena.b@marvel.com</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">+7 495 123-45-67</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Marvel Studios</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Analyst</span></td>
                                    <td class="data_view-td"><span class="data_view-badge data_view-badge-cancelled">Cancelled</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">--:--</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Sep 30, 2024</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Standard</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Manual Entry</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Travel conflict</span></td>
                                    <td class="data_view-td-right"><button class="data_view-more-btn"><span
                                        class="data_view-icon">more_vert</span></button></td>
                                </tr>

                                {/* <!-- Row 5 – Thomas Grier --> */}
                                <tr class="data_view-tbody-row">
                                    <td class="data_view-td"><input class="data_view-checkbox" type="checkbox" /></td>
                                    <td class="data_view-td">
                                        <div class="data_view-name-cell">
                                            <div class="data_view-initials data_view-initials-pd">TG</div>
                                            <span class="data_view-guest-name">Thomas Grier</span>
                                        </div>
                                    </td>
                                    <td class="data_view-td"><span class="data_view-cell-text">thomas.g@fintech.co</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">+1 (212) 555-0198</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Fintech Co.</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Partner</span></td>
                                    <td class="data_view-td"><span class="data_view-badge data_view-badge-confirmed">Confirmed</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Oct 12, 10:02 AM</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">Oct 10, 2024</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">VIP</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">LinkedIn Ads</span></td>
                                    <td class="data_view-td"><span class="data_view-cell-text">--</span></td>
                                    <td class="data_view-td-right"><button class="data_view-more-btn"><span
                                        class="data_view-icon">more_vert</span></button></td>
                                </tr>

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
                            <span class="data_view-page-info">Page 1 of 52</span>
                            <div class="data_view-page-btns">
                                <button class="data_view-page-btn" disabled>
                                    <span class="data_view-icon">chevron_left</span>
                                </button>
                                <button class="data_view-page-btn">
                                    <span class="data_view-icon">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

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
                        <span class="data_view-icon" style={{fontSize:"1.125rem"}}>delete_sweep</span>
                        Bulk Delete
                    </button>
                </div>

            </div>



        </div>
    )
}