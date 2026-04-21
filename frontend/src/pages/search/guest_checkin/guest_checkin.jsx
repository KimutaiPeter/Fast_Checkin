import React from "react";
import './guest_checkin.css'
import { useState, useEffect } from "react";
import data_api from '../../utility'

export default function Guest_checkin(props) {
  const [add_other_details, set_add_other_details] = useState(false)
  const [view_history, set_view_history] = useState(false)
  const [name, set_name] = useState(props.focused_search_result.name)
  const [id_number, set_id_number] = useState(props.focused_search_result.id_number)
  const [phone_number, set_phone_number] = useState(props.focused_search_result.phone_number)
  const [update_needed, set_update_needed] = useState(false)
  const [checked_in, set_checked_in] = useState(false)
  const [request_sent, set_request_sent] = useState(false)
  const [button_text, set_button_text] = useState("Checkin")
  const [event_history, set_event_history] = useState([])

  useEffect(() => {
    set_name(props.focused_search_result.name)
    set_phone_number(props.focused_search_result.phone_number)
    set_id_number(props.focused_search_result.id_number)
    get_event_history()
  }, [])


  async function get_event_history() {
    var responce = await data_api('/get_person_event_history', { id_number: id_number })
    console.log(responce)
    if (responce.code == 0) {
      set_event_history(responce.data)
    }

  }


  async function handle_update_checkin() {
    console.log("Sending request")
    set_request_sent(true)
    if (update_needed) {

      return
    } else {
      var request_result = await data_api("/update_guest",
        {
          no: props.focus_data.no,
          name: props.focus_data.name,
          phone_number: props.focus_data.phone_number,
          id_number: props.focus_data.id_number,
          checked_in: 1
        })
      console.log(request_result)
      set_checked_in(true)
    }
    set_request_sent(false)

  }


  return (
    <div class="guest_details-page-wrapper">
      <div class="guest_details-container">

        {/* <!-- Top Navigation Bar --> */}
        <header class="guest_details-header">
          <div class="guest_details-header-left">
            <button class="guest_details-back-btn" aria-label="Go back" onClick={e => { props.set_page('manual_search') }}>
              <span class="guest_details-icon">arrow_back</span>
            </button>
            <h1 class="guest_details-page-title">Update Guest Details</h1>
          </div>

        </header>

        {/* <!-- Form Body --> */}
        <main class="guest_details-main">
          <div class="guest_details-form-inner">

            {/* <!-- Success Banner --> */}
            <div class="guest_details-success-banner" role="alert">
              <span class="guest_details-icon guest_details-success-icon">check_circle</span>
              <p class="guest_details-success-text">Guest details updated successfully!</p>
            </div>

            {/* <!-- Section: Personal Information --> */}
            <div class="guest_details-section-header">
              <h2 class="guest_details-section-title">Personal Information</h2>
              <p class="guest_details-section-subtitle">Please verify and update the guest information extracted from the
                document.</p>
            </div>

            <form class="guest_details-form">

              {/* <!-- Full Name --> */}
              <div class="guest_details-field-group">
                <label class="guest_details-label" for="full_name">Full Name</label>
                <div class="guest_details-input-wrapper">
                  <input class="guest_details-input" id="full_name" name="full_name" type="text"
                    placeholder="Enter full name" value={props.focused_search_result.name} />
                  <span class="guest_details-icon guest_details-input-icon guest_details-icon-sm">edit</span>
                </div>
              </div>

              {/* <!-- ID / Passport Number --> */}
              <div class="guest_details-field-group">
                <label class="guest_details-label" for="id_number">ID/Passport Number</label>
                <div class="guest_details-input-wrapper">
                  <input class="guest_details-input" id="id_number" name="id_number" type="text"
                    placeholder="Enter ID or Passport number" value={props.focused_search_result.id_number} />
                  <span class="guest_details-icon guest_details-input-icon guest_details-icon-sm">badge</span>
                </div>
              </div>

              {/* <!-- Phone + Email --> */}
              <div class="guest_details-grid-2">
                <div class="guest_details-field-group">
                  <label class="guest_details-label" for="phone">Phone Number</label>
                  <div class="guest_details-input-wrapper">
                    <input class="guest_details-input" id="phone" name="phone" type="tel" placeholder="Enter phone number"
                      value={props.focused_search_result.phone_number} />
                  </div>
                </div>
                <div class="guest_details-field-group">
                  <label class="guest_details-label" for="email">County</label>
                  <div class="guest_details-input-wrapper">
                    <input class="guest_details-input" id="email" name="email" type="email"
                      placeholder="Enter email address" value={props.focused_search_result.county} />
                  </div>
                </div>
              </div>

              {/* <!-- Guest Category + Organization --> */}
              <div class="guest_details-grid-2">
                <div class="guest_details-field-group">
                  <label class="guest_details-label" for="guest_category">Sub county</label>
                  <div class="guest_details-input-wrapper">
                    <input class="guest_details-input" id="guest_category" name="guest_category" type="text"
                      placeholder="e.g. VIP, Standard" value={props.focused_search_result.subcounty} />
                    <span class="guest_details-icon guest_details-input-icon guest_details-icon-sm">label</span>
                  </div>
                </div>
                <div class="guest_details-field-group">
                  <label class="guest_details-label" for="organization">Ward</label>
                  <div class="guest_details-input-wrapper">
                    <input class="guest_details-input" id="organization" name="organization" type="text"
                      placeholder="Enter organization name" value={props.focused_search_result.ward} />
                    <span class="guest_details-icon guest_details-input-icon guest_details-icon-sm">corporate_fare</span>
                  </div>
                </div>
              </div>

              {/* <!-- Additional Information Section --> */}
              <div class="guest_details-divider">
                <div class="guest_details-additional-header">
                  <div>
                    <h2 class="guest_details-section-title">Additional Information</h2>
                    <p class="guest_details-section-subtitle">Add or update custom fields specific to this guest.</p>
                  </div>
                  <button class="guest_details-add-field-btn" type="button">
                    <span class="guest_details-icon guest_details-icon-sm">add_circle</span>
                    Add New Field
                  </button>
                </div>

                <div class="guest_details-custom-fields">

                  {/* <!-- Add New Field Card --> */}
                  <div class="guest_details-new-field-card">
                    <div class="guest_details-grid-3-auto">
                      <div class="guest_details-field-group">
                        <label class="guest_details-custom-label" for="new_field_name">Field Name</label>
                        <input class="guest_details-new-field-input" id="new_field_name" type="text"
                          placeholder="e.g. Preferred Language" />
                      </div>
                      <div class="guest_details-field-group">
                        <label class="guest_details-custom-label" for="new_field_value">Field Value</label>
                        <input class="guest_details-new-field-input" id="new_field_value" type="text"
                          placeholder="e.g. English, Swahili" />
                      </div>
                      <button class="guest_details-save-btn" type="button">Save</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* <!-- Recent Event History Section --> */}
              <div class="guest_details-divider">
                <div class="guest_details-section-header" onClick={e => { set_view_history(prev => { return !prev }) }}>
                  <div class='left_center_horizontal'><h2 class="guest_details-section-title">{props.focused_search_result.total_invitations} Recent Events </h2><span class="material-symbols-outlined">{view_history ? 'expand_circle_up' : 'expand_circle_down'}</span></div>
                  <p class="guest_details-section-subtitle">Activity log for this guest across recent registered events.
                  </p>
                </div>


                {(() => {
                  if (view_history) {
                    return (
                      <div class="guest_details-table-wrapper">
                        <div class="guest_details-table-scroll">
                          <table class="guest_details-table">
                            <thead class="guest_details-table-head">
                              <tr>
                                <th class="guest_details-table-th">Event Name</th>
                                <th class="guest_details-table-th">Date</th>
                                <th class="guest_details-table-th">Check-in Time</th>
                                <th class="guest_details-table-th">Location</th>
                                <th class="guest_details-table-th">Status</th>
                                <th class="guest_details-table-th guest_details-table-th-right">Action</th>
                              </tr>
                            </thead>
                            <tbody class="guest_details-table-body">
                              {/* <!-- Row 1 --> */}
                              {(() => {
                                if (event_history.length > 0) {
                                  return event_history.map(event => {
                                    return (
                                      <tr>
                                        <td class="guest_details-table-td">
                                          <div class="guest_details-event-name">{event.name}</div>
                                        </td>
                                        <td class="guest_details-table-td">
                                          <div class="guest_details-event-date">{event.date}</div>
                                          {/* <div class="guest_details-event-time-sub">09:12 AM</div> */}
                                        </td>
                                        <td class="guest_details-table-td">
                                          <div class="guest_details-checkin-time">{event.checkedin_timestamp}</div>
                                        </td>
                                        <td class="guest_details-table-td">
                                          <div class="guest_details-location-cell">
                                            <span class="guest_details-icon guest_details-location-icon">location_on</span>
                                            {event.venue}
                                          </div>
                                        </td>
                                        <td class="guest_details-table-td">
                                          <span class={event.checked_in==1?"guest_details-badge guest_details-badge-attended":'guest_details-badge guest_details-badge-noshow'}>{event.checked_in==1?'checkedin':'no-show'}</span>
                                        </td>
                                        <td class="guest_details-table-td guest_details-action-cell">
                                          <button class="guest_details-row-action-btn" aria-label="More options">
                                            <span class="guest_details-icon guest_details-icon-xl">more_vert</span>
                                          </button>
                                        </td>
                                      </tr>
                                    )
                                  })
                                }
                              })()}


                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  }
                })()}



                {/* Table end */}
              </div>

              {/* <!-- OCR Verification Badge --> */}
              <div class="guest_details-ocr-badge">
                <span class="guest_details-icon guest_details-ocr-icon">verified</span>
                <div>
                  <p class="guest_details-ocr-title">Verified by OCR System</p>
                  <p class="guest_details-ocr-desc">Fields were successfully scanned from the provided ID document. Manual
                    corrections are highlighted.</p>
                </div>
              </div>

              {/* <!-- Action Buttons --> */}
              <div class="guest_details-actions">
                <button class="guest_details-submit-btn" type="submit">
                  Update Details
                  <span class="guest_details-icon">check_circle</span>
                </button>
                <button class="guest_details-cancel-btn" type="button">Cancel</button>
              </div>

              

            </form>
          </div>
        </main>



      </div>
    </div>






  )
}