import React, { useEffect, useState } from "react";

import './team_management.css'
import { useNavigate } from "react-router-dom";
import data_api, { data_get } from "../utility";

export default function Team_management() {
    const [new_member_email, set_new_member_email] = useState('')
    const [new_member_name, set_new_member_name] = useState('')
    const [new_member_user_type, set_new_member_user_type] = useState('event_user')
    const [new_member_pin, set_new_member_pin] = useState('')

    const [new_member, set_new_member] = useState(false)
    const [new_member_security_type, set_new_member_security_type] = useState('password')

    const [team, set_team] = useState([])

    const navigate = useNavigate()
    function nav(url) {
        navigate(url);
    }


    useEffect(() => {
        get_members()
    }, [])

    async function get_members() {
        var responce = await data_get("/get_members")
        console.log(responce)
        if (responce.code == 0) {
            set_team(responce.data)
        }
    }

    async function add_new_member() {
        if (new_member_name.length > 0) {
            if (new_member_security_type == 'pin_only') {
                if (new_member_pin.length == 6) {
                    console.log('sd')
                    var body = {
                        name: new_member_name,
                        password: new_member_pin,
                        role: new_member_user_type,
                        security_protocol: new_member_security_type,
                        added_by: 4
                    }
                    var responce = await data_api('/register_member', body)
                    console.log(responce)
                } else {
                    alert('Please choose a 6 digit pin')
                }
            } else if (new_member_security_type == 'password') {
                if (isValidEmail(new_member_email)) {
                    console.log('sendingit')
                    var body = {
                        name: new_member_name,
                        email: new_member_email,
                        role: new_member_user_type,
                        security_protocol: new_member_security_type,
                        added_by: 4
                    }
                    var responce = await data_api('/register_member', body)
                    console.log(responce)
                } else {
                    alert('please use a valid email')
                }


            }
        } else {
            alert('name and email required')
        }

    }

    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email) ? true : false;
    }

    return (
        <div class="team-page">
            {/* <!-- ═══════════════════════ HEADER --> */}
            <header class="team-header">
                {/* <!-- Brand --> */}
                <div class="team-header-brand">
                    <div class="team-logo-icon">
                        <span class="team-icon">account_balance</span>
                    </div>
                    <span class="team-logo-label">Events</span>
                </div>



                {/* <!-- Actions --> */}
                <div class="team-header-actions">
                    <button class="team-icon-btn" aria-label="Download" onClick={e => { nav('/') }}>
                        <span class="team-icon">arrow_back</span>
                    </button>
                    <button class="team-icon-btn" aria-label="Download">
                        <span class="team-icon">download</span>
                    </button>
                    <button class="team-icon-btn" aria-label="Logout" onClick={e => { localStorage.clear(); nav('/'); }}>
                        <span class="team-icon">logout</span>
                    </button>
                </div>
            </header>

            {/* <!-- ══════════════════════════════════════════════════════════ MAIN --> */}
            <main class="team-main">

                {/* <!-- ── Page Header ── --> */}
                <div class="team-page-header">
                    <div>
                        <h1 class="team-page-title">Team Management</h1>
                        <p class="team-page-subtitle">Organize staff members, roles, and security protocols across all
                            operations.</p>
                    </div>

                    <button class="team-btn-primary" onClick={e => { set_new_member(prev => { return !prev }) }}>
                        <span class="team-icon">{new_member ? 'arrow_drop_up' : 'arrow_drop_down'}</span>
                        <span>Register Member</span>
                    </button>
                </div>

                {/* <!-- ── Add Team Member Card ── --> */}
                {(() => {
                    if (new_member) {
                        return (
                            <div class="team-card team-add-card">
                                <div class="team-card-header">
                                    <h2 class="team-card-title">Add Team Member</h2>
                                </div>
                                <div class="team-form-body">
                                    <div class="team-form-grid">

                                        {/* <!-- Name & Identity --> */}
                                        <div class="team-field">
                                            <label class="team-field-label">Name &amp; Identity</label>
                                            <div class="team-name-group">
                                                <input class="team-name-input" placeholder="Full Name" type="text" value={new_member_name} onChange={e => { set_new_member_name(e.target.value) }} />
                                                <input class="team-email-input" placeholder="Email Address" type="text" value={new_member_email} onChange={e => { set_new_member_email(e.target.value) }} />
                                            </div>
                                        </div>

                                        {/* <!-- Access Role --> */}
                                        <div class="team-field">
                                            <label class="team-field-label">Access Role</label>
                                            <div class="team-select-box">
                                                <select class="team-select-input" style={{ width: "100%" }} onChange={e => { set_new_member_user_type(e.target.value) }}>
                                                    <option disabled selected>SELECT ROLE</option>
                                                    <option value="admin">ADMIN</option>
                                                    <option value="event_user">EVENT_USER</option>
                                                    <option value="viewer">EXECTUTIVE</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* <!-- Security Protocol --> */}
                                        <div class="team-field">
                                            <label class="team-field-label">Security Protocol</label>
                                            <div class="team-select-box">
                                                <select class="team-select-input" value={new_member_security_type}
                                                    style={{ width: '100%', color: "var(--team-color-on-surface-variant)" }} onChange={e => { set_new_member_security_type(e.target.value); }}>
                                                    <option disabled selected>SET SECURITY</option>
                                                    <option value="password">2FA PASSWORD</option>
                                                    <option value="pin_only">PIN ONLY</option>
                                                </select>
                                            </div>
                                        </div>

                                        {(() => {
                                            if (new_member_security_type === 'pin_only') {
                                                return (
                                                    <div class="team-name-group">
                                                        <label class="team-field-label">PIN</label>
                                                        <input class="team-email-input" placeholder="Enter 6 digit PIN" type="text" value={new_member_pin} onChange={e => { set_new_member_pin(e.target.value) }} />
                                                    </div>
                                                )
                                            }
                                        })()}


                                        {/* <!-- Submit --> */}
                                        <div class="team-form-submit">
                                            <button class="team-btn-add" onClick={e => { add_new_member() }}>Add Member</button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )

                    }
                })()}


                {/* <!-- ── Personnel Directory Card ── --> */}
                <div class="team-card">

                    {/* <!-- Toolbar --> */}
                    <div class="team-directory-toolbar">
                        <div>
                            <h2 class="team-directory-title">Personnel Directory</h2>
                        </div>
                        <div class="team-search-wrap">
                            <input class="team-search-input" placeholder="Search team members..." type="text" />
                        </div>
                    </div>

                    {/* <!-- Table --> */}
                    <div class="team-table-wrap">
                        <table class="team-table">
                            <thead>
                                <tr class="team-thead-row">
                                    <th class="team-th">Name &amp; Identity</th>
                                    <th class="team-th">Access Role</th>
                                    <th class="team-th">Status</th>
                                    <th class="team-th team-th-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>

                                {/* <!-- Row 1 – Helena Vance --> */}
                                <tr class="team-tbody-row">
                                    <td class="team-td">
                                        <input class="team-member-name-input" type="text" value="Helena Vance" />
                                        <p class="team-member-email">helena.v@eventarchitect.com</p>
                                    </td>
                                    <td class="team-td">
                                        <select class="team-role-select team-role-admin">
                                            <option selected value="LEAD ADMIN">LEAD ADMIN</option>
                                            <option value="EVENT STAFF">EVENT STAFF</option>
                                            <option value="SECURITY">SECURITY</option>
                                        </select>
                                    </td>
                                    <td class="team-td">
                                        <select class="team-security-select team-security-muted">
                                            <option selected value="RESET PIN">•••• RESET PIN</option>
                                            <option value="SECURE">SECURE</option>
                                            <option value="CHANGE">CHANGE</option>
                                        </select>
                                    </td>
                                    <td class="team-td team-td-right">
                                        <button class="team-edit-btn">Edit</button>
                                    </td>
                                </tr>

                                {(() => {
                                    return team.map((member) => {
                                        var name=member.name
                                        var email=member.email
                                        var password=member.password
                                        var changed=false

                                        function handle_change(){
                                            if(name==member.name || email==member.email || password==member.password){
                                                changed=true
                                            }
                                        }

                                        return (
                                            <tr class="team-tbody-row">
                                                <td class="team-td">
                                                    <input class="team-member-name-input" type="text" value={member.name} />
                                                    {/* <p class="team-member-email">helena.v@eventarchitect.com</p> */}
                                                    {member.security_protocol==='password'?
                                                    <input class="team-member-email team-member-name-input" type="text" value={member.email} />
                                                    :<input class="team-member-email team-member-name-input" type="text" value={password} onChange={e=>{password=e.target.value; handle_change()}} />
                                                    }
                                                    
                                                </td>
                                                <td class="team-td">
                                                    <select class={member.role=='admin'?'team-role-select team-role-admin':'team-role-select team-role-staff'} value={member.role}>
                                                        <option selected value="amdin">LEAD ADMIN</option>
                                                        <option value="event_user">EVENT USER</option>
                                                        <option value="viewer">VIEWER</option>
                                                    </select>
                                                </td>
                                                <td class="team-td">
                                                    {(() => {
                                                        if (member.status !== 'invite_pending') {
                                                            return (
                                                            <select class="team-security-select team-security-green" value={member.status}>
                                                                <option selected value="disabled">DISABLED</option>
                                                                <option value="active">ACTIVE</option>
                                                                <option value="delete">DELETE</option>
                                                            </select>
                                                            )
                                                        } else {
                                                            return (
                                                                <select class="team-security-select team-security-muted">
                                                                    <option selected value="RESET PIN">Invite Pending</option>
                                                                </select>
                                                            )
                                                        }
                                                    })()}

                                                </td>
                                                <td class="team-td team-td-right">
                                                    
                                                    <button class="team-edit-btn">{!changed?'Edit':'Save'}</button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                })()}

                                {/* <!-- Row 2 – Marcus Thorne --> */}
                                <tr class="team-tbody-row">
                                    <td class="team-td">
                                        <input class="team-member-name-input" type="text" value="Marcus Thorne" />
                                        <p class="team-member-email">m.thorne@eventarchitect.com</p>
                                    </td>
                                    <td class="team-td">
                                        <select class="team-role-select team-role-staff">
                                            <option value="LEAD ADMIN">LEAD ADMIN</option>
                                            <option selected value="EVENT STAFF">EVENT STAFF</option>
                                            <option value="SECURITY">SECURITY</option>
                                        </select>
                                    </td>
                                    <td class="team-td">
                                        <select class="team-security-select team-security-green">
                                            <option selected value="SECURE">SECURE</option>
                                            <option value="RESET PIN">RESET PIN</option>
                                            <option value="CHANGE">CHANGE</option>
                                        </select>
                                    </td>
                                    <td class="team-td team-td-right">
                                        <button class="team-edit-btn">Edit</button>
                                    </td>
                                </tr>

                                {/* <!-- Row 3 – Sarah Chen --> */}
                                <tr class="team-tbody-row">
                                    <td class="team-td">
                                        <input class="team-member-name-input" type="text" value="Sarah Chen" />
                                        <p class="team-member-email">sarah.chen@security.net</p>
                                    </td>
                                    <td class="team-td">
                                        <select class="team-role-select team-role-security">
                                            <option value="LEAD ADMIN">LEAD ADMIN</option>
                                            <option value="EVENT STAFF">EVENT STAFF</option>
                                            <option selected value="SECURITY">SECURITY</option>
                                        </select>
                                    </td>
                                    <td class="team-td">
                                        <select class="team-security-select team-security-muted">
                                            <option selected value="CHANGE">•••• CHANGE</option>
                                            <option value="SECURE">SECURE</option>
                                            <option value="RESET PIN">RESET PIN</option>
                                        </select>
                                    </td>
                                    <td class="team-td team-td-right">
                                        <button class="team-edit-btn">Edit</button>
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>

                    {/* <!-- Footer --> */}
                    <div class="team-table-footer">
                        <p class="team-result-count">Showing {team.length} results</p>
                        {/* <div class="team-pagination">
                            <button class="team-page-btn" disabled>Previous</button>
                            <button class="team-page-btn">Next</button>
                        </div> */}
                    </div>

                </div>

                {/* <!-- ── Bottom Grid ── --> */}
                <div class="team-bottom-grid">

                    {/* <!-- Permission Templates --> */}
                    <div class="team-permissions-card">
                        <h3 class="team-permissions-title">Permission Templates</h3>
                        <div class="team-permissions-list">

                            {/* <!-- Architect Access --> */}
                            <div class="team-permission-item">
                                <div class="team-permission-left">
                                    <span class="team-icon team-permission-icon">admin_panel_settings</span>
                                    <div>
                                        <p class="team-permission-name">Architect Access</p>
                                        <p class="team-permission-desc">Full system control</p>
                                    </div>
                                </div>
                                <span class="team-permission-badge">GLOBAL</span>
                            </div>

                            {/* <!-- Floor Manager --> */}
                            <div class="team-permission-item">
                                <div class="team-permission-left">
                                    <span class="team-icon team-permission-icon">stadium</span>
                                    <div>
                                        <p class="team-permission-name">Floor Manager</p>
                                        <p class="team-permission-desc">Venue management</p>
                                    </div>
                                </div>
                                <span class="team-permission-badge">VENUE</span>
                            </div>

                        </div>
                    </div>

                    {/* <!-- Team Insights --> */}
                    <div class="team-insights-card">
                        <div class="team-insights-content">
                            <h3 class="team-insights-title">Team Insights</h3>
                            <p class="team-insights-subtitle">Staff utilization is optimal for the current event cycle.</p>
                            <div class="team-insights-metrics">
                                {/* <!-- Efficiency --> */}
                                <div>
                                    <div class="team-metric-row">
                                        <span>Efficiency</span>
                                        <span>88%</span>
                                    </div>
                                    <div class="team-metric-track">
                                        <div class="team-metric-fill" style={{ width: "88%" }}></div>
                                    </div>
                                </div>
                                {/* <!-- Engagement --> */}
                                <div>
                                    <div class="team-metric-row">
                                        <span>Engagement</span>
                                        <span>95%</span>
                                    </div>
                                    <div class="team-metric-track">
                                        <div class="team-metric-fill" style={{ width: "95%" }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button class="team-audit-btn">Generate Audit Report</button>
                        <div class="team-insights-blob"></div>
                    </div>

                </div>

            </main>

        </div>
    )
}