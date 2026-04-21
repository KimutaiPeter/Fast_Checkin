import React, { useEffect, useState } from "react";
import './login.css'
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [pin, set_pin] = useState("")

    const navigate = useNavigate()
    function nav(url) {
        navigate(url);
    }

    function authenticate() {
        if (pin == "000000") {
            localStorage.setItem('auth', JSON.stringify({ user_type: 'admin' }))
            nav("/")
        } else if (pin == "123456") {
            localStorage.setItem('auth', JSON.stringify({ user_type: 'user' }))
            nav('/')
        }
        else {
            set_pin('')
        }
    }

    useEffect(() => {
        if (pin.length === 6) {
            authenticate()
        } else {
            console.log("not yet")
        }
    }, [pin])



    return (
        <main class="login-main">
            <div class="login-card">

                {/* <!-- Icon & Header --> */}
                <div class="login-hero">
                    <div class="login-hero-icon-wrap" id="loginHeroIconWrap">
                        <span class="material-symbols-outlined login-hero-icon" id="loginHeroIcon">lock</span>
                    </div>
                    <h1 class="login-title">Secure Access</h1>
                    <p class="login-subtitle login-subtitle-pin" id="loginSubtitlePin">Please enter your email and 6-digit access PIN to continue to the events portal.</p>
                    <p class="login-subtitle login-subtitle-password login-hidden" id="loginSubtitlePassword">Please enter your email and account password to continue to the events portal.</p>
                </div>

                {/* <!-- Email Input --> */}
                <div class="login-field">
                    <label class="login-field-label" for="loginEmail">Email Address</label>
                    <input class="login-input" id="loginEmail" name="email" placeholder="Enter your email address" type="email" />
                </div>

                {/* <!-- Mode Toggle --> */}
                <div class="login-toggle-wrap">
                    <div class="login-toggle">
                        <button class="login-toggle-btn login-toggle-btn-active" id="loginBtnPin" onclick="switchMode('pin')">PIN</button>
                        <button class="login-toggle-btn" id="loginBtnPassword" onclick="switchMode('password')">Password</button>
                    </div>
                </div>

                {/* <!-- PIN View --> */}
                <div class="login-pin-view" id="loginPinView">
                    {/* <!-- PIN Indicators --> */}
                    <div class="login-pin-indicators" id="loginPinIndicators">
                        <div class={pin[0]==undefined?"login-pin-dot login-pin-dot-empty":"login-pin-dot login-pin-dot-filled"} data-index="0">{pin[0]==undefined?"":pin[0]}</div>
                        <div class={pin[1]==undefined?"login-pin-dot login-pin-dot-empty":"login-pin-dot login-pin-dot-filled"} data-index="1">{pin[0]==undefined?"":pin[1]}</div>
                        <div class={pin[2]==undefined?"login-pin-dot login-pin-dot-empty":"login-pin-dot login-pin-dot-filled"} data-index="2">{pin[0]==undefined?"":pin[2]}</div>
                        <div class={pin[3]==undefined?"login-pin-dot login-pin-dot-empty":"login-pin-dot login-pin-dot-filled"} data-index="3">{pin[0]==undefined?"":pin[3]}</div>
                        <div class={pin[4]==undefined?"login-pin-dot login-pin-dot-empty":"login-pin-dot login-pin-dot-filled"} data-index="4">{pin[0]==undefined?"":pin[4]}</div>
                        <div class={pin[5]==undefined?"login-pin-dot login-pin-dot-empty":"login-pin-dot login-pin-dot-filled"} data-index="5">{pin[0]==undefined?"":pin[5]}</div>
                    </div>

                    {/* <!-- Keypad --> */}
                    <div class="login-keypad">
                        <button class="login-key" onClick={e=>{set_pin(prev=>{return prev+'1'})}}>1</button>
                        <button class="login-key" onClick={e=>{set_pin(prev=>{return prev+'2'})}}>2</button>
                        <button class="login-key" onClick={e=>{set_pin(prev=>{return prev+'3'})}}>3</button>
                        <button class="login-key" onClick={e=>{set_pin(prev=>{return prev+'4'})}}>4</button>
                        <button class="login-key" onClick={e=>{set_pin(prev=>{return prev+'5'})}}>5</button>
                        <button class="login-key" onClick={e=>{set_pin(prev=>{return prev+'6'})}}>6</button>
                        <button class="login-key" onClick={e=>{set_pin(prev=>{return prev+'7'})}}>7</button>
                        <button class="login-key" onClick={e=>{set_pin(prev=>{return prev+'8'})}}>8</button>
                        <button class="login-key" onClick={e=>{set_pin(prev=>{return prev+'9'})}}>9</button>
                        <div class="login-key-empty"></div>
                        <button class="login-key" onClick={e=>{set_pin(prev=>{return prev+'0'})}}>0</button>
                        <button class="login-key login-key-icon" onclick="pressBackspace()">
                            <span class="material-symbols-outlined">backspace</span>
                        </button>
                    </div>
                </div>

                {/* <!-- Password View --> */}
                <div class="login-password-view" id="loginPasswordView">
                    <div class="login-field">
                        <label class="login-field-label">Password</label>
                        <input class="login-input" placeholder="Enter password" type="password" />
                    </div>
                    <button class="login-submit-btn">Login</button>
                </div>

                {/* <!-- Footer Links --> */}
                <div class="login-footer-links">
                    <button class="login-forgot-btn" id="loginForgotBtn">Forgot PIN?</button>
                    
                </div>

            </div>
        </main>

    )
}