import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import data_api from "../utility";
import './set_password.css'

export default function Set_password() {
    const { id } = useParams();
    const [password, set_password] = useState('')
    const [confirm_password, set_confirm_password] = useState('')
    const [password_visibility, set_password_visibility] = useState(false)
    const [cpassword_visibility, set_cpassword_visibility] = useState(false)
    
    const [auth_secret,set_auth_secret]=useState('')
    const [auth_secret_verified,set_auth_secret_verified]=useState(null)
    const [user_data,set_user_data]=useState({})
    const [auth_code,set_auth_code]=useState('')

    useEffect(() => {
        console.log(id, decodeId(id))
        get_member_data()
    }, [])

    function decodeId(s) {
        const SECRET = 783921;
        const mixed = parseInt(s, 36);
        return mixed - SECRET;
    }

    async function get_member_data() {
        var responce = await data_api('/get_member', { 'serial_no': decodeId(id) })
        console.log(responce)
        if(responce.code==0){
            set_auth_secret(responce.data.passphrase)
            set_auth_secret(responce.data)
        }
    }


    function hasSpecialChar(str) {
        return /[!@#$%.,*&(){}+=-]/.test(str);
    }

    function hasNumber(str) {
        return /[0-9]/.test(str);
    }


    const secret = "JBSWY3DPEHPK3PXP"; // from backend
    const issuer = "MyApp";
    const account = "john@example.com";
    const otpUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${auth_secret}&issuer=${encodeURIComponent(issuer)}`;

    async function handle_auth_verification(e){
        set_auth_code(e.target.value);
        if(e.target.value.length==6){
            set_auth_secret_verified(prev=>undefined)
            var responce=await data_api('/verify_2fa',{index:decodeId(id),auth_code:e.target.value})
            console.log(responce)
            if(responce.code==0){
                set_auth_secret_verified(true)
                set_auth_code('')
            }else{
                set_auth_secret_verified(false)
                set_auth_code('')
            }
        }
    }



    return (
        <main class="set_password-main">
            <div class="set_password-container">

                {/* <!-- Branding Header --> */}
                <div class="set_password-brand">
                    <div class="set_password-brand__icon-wrap">
                        <span class="set_password-icon set_password-brand__icon">security</span>
                    </div>
                    <h1 class="set_password-brand__title">Events</h1>
                    <p class="set_password-brand__subtitle">Complete your account security setup to continue.</p>
                </div>

                {/* <!-- Card --> */}
                <div class="set_password-card">
                    <form class="set_password-form" onsubmit="return false;">

                        {/* <!-- Section 1: Password --> */}
                        <div class="set_password-section">
                            <h2 class="set_password-section__heading">
                                Set Password
                            </h2>

                            {/* <!-- New Password --> */}
                            <div class="set_password-field">
                                <label class="set_password-field__label" for="new_password">New Password</label>
                                <div class="set_password-field__input-wrap">
                                    <input class="set_password-field__input" name="new_password" placeholder="••••••••"
                                        type={password_visibility ? "password" : 'text'} value={password} onChange={e => { set_password(e.target.value) }} />
                                    <button class="set_password-field__toggle" type="button" aria-label="Toggle visibility" onClick={e => { set_password_visibility(prev => !prev) }}>
                                        <span class="set_password-icon">{password_visibility ? 'visibility' : 'visibility_off'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* <!-- Confirm Password --> */}
                            <div class="set_password-field">
                                <label class="set_password-field__label" for="confirm_password">Confirm Password</label>
                                <div class="set_password-field__input-wrap">
                                    <input class="set_password-field__input" name="confirm_password"
                                        placeholder="••••••••" type={cpassword_visibility ? "password" : 'text'} value={confirm_password} onChange={e => { set_confirm_password(e.target.value) }} />
                                    <button class="set_password-field__toggle" type="button" aria-label="Toggle visibility" onClick={e => { set_cpassword_visibility(prev => !prev) }}>
                                        <span class="set_password-icon">{cpassword_visibility ? 'visibility' : 'visibility_off'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* <!-- Requirements --> */}
                            <div class="set_password-requirements">
                                <p class="set_password-requirements__title">Security Requirements</p>

                                <div class="set_password-req-item" id="req-length">
                                    <div class="set_password-req-item__dot set_password-req-item__dot--partial">
                                        <span class="set_password-icon set_password-icon--filled" style={{ fontSize: "16px" }}>{password.length >= 8 ? 'check' : 'circle'}</span>
                                    </div>
                                    <span class="set_password-req-item__text">At least 8 characters</span>
                                </div>

                                <div class="set_password-req-item" id="req-length">
                                    <div class="set_password-req-item__dot set_password-req-item__dot--partial">
                                        <span class="set_password-icon set_password-icon--filled" style={{ fontSize: "16px" }}>{password == confirm_password ? 'check' : 'circle'}</span>
                                    </div>
                                    <span class="set_password-req-item__text">Matching confirmation password</span>
                                </div>

                                <div class="set_password-req-item" id="req-number">
                                    <div class="set_password-req-item__dot">
                                        <span class="set_password-icon set_password-icon--filled" style={{ fontSize: "16px" }}>{hasNumber(password) ? 'check' : 'circle'}</span>
                                    </div>
                                    <span class="set_password-req-item__text">At least one number (0-9)</span>
                                </div>

                                <div class="set_password-req-item" id="req-special">
                                    <div class="set_password-req-item__dot">
                                        <span class="set_password-icon set_password-icon--filled" style={{ fontSize: "16px" }}>{hasSpecialChar(password) ? 'check' : 'circle'}</span>
                                    </div>
                                    <span class="set_password-req-item__text">One special character (!@#$%)</span>
                                </div>
                            </div>
                        </div>



                        {/* <!-- Section 3: Two-Factor Authentication --> */}
                        <div class="set_password-section">
                            <h2 class="set_password-section__heading">
                                Two-Factor Authentication
                            </h2>

                            <div class="set_password-tfa">
                                <div class="set_password-tfa__qr-wrap">
                                    <QRCode value={otpUrl} />
                                </div>
                                <div class="set_password-tfa__info">
                                    <p class="set_password-tfa__info-title">Scan with Authenticator</p>
                                    <p class="set_password-tfa__info-body">Use Google Authenticator, Authy, or Microsoft Authenticator to
                                        scan this QR code. You will need the generated 6-digit code for future logins.
                                        <a href={otpUrl}>Click this link to open with an app authenticator</a>
                                    </p>
                                    <p class="set_password-tfa__info-title">{auth_secret_verified===undefined?'Verifying...':auth_secret_verified==null?'Please verify 2FA':auth_secret_verified?'Success 2FA Verified':auth_secret_verified===false?'Please Scan and Try Again':'Error'}</p>
                                    <input class="set_password-tfa__code-input" placeholder="Enter 6-digit code" type="text" maxlength="6" value={auth_code} onChange={e=>{ handle_auth_verification(e)}}
                                        inputmode="numeric" />
                                </div>
                            </div>
                        </div>

                        {/* <!-- Submit --> */}
                        <button class="set_password-submit-btn" type="submit">
                            Complete Security Setup
                        </button>

                    </form>

                    {/* <!-- Back to Login --> */}
                    <div class="set_password-back-wrap">
                        <a class="set_password-back-link" href="#">
                            <span class="set_password-icon set_password-back-icon">arrow_back</span>
                            Back to Login
                        </a>
                    </div>
                </div>



            </div>
        </main>
    )
}