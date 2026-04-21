import React from "react";

import './installation.css'
import { useInstallPrompt } from "../../useInstallPrompt";
import { useNavigate } from "react-router-dom";



export default function Installation() {
    const navigate = useNavigate()
    function nav(url) {
        navigate(url);
    }
    
const { canInstall, install } = useInstallPrompt();

    return (
        <div class="installation-page">

            <header class="installation-header">
                <div class="installation-header-inner">
                    <div class="installation-brand">
                        <div class="installation-brand-icon">
                            <span class="material-symbols-outlined">account_balance</span>
                        </div>
                        <h1 class="installation-brand-name">Events</h1>
                    </div>
                </div>
            </header>


            <main class="installation-main">
                <div class="installation-card">


                    <div class="installation-app-icon-wrap">
                        <div class="installation-app-icon">
                            <span class="material-symbols-outlined">download_for_offline</span>
                        </div>
                    </div>


                    <div class="installation-text-block">
                        <h2 class="installation-heading">Install the App</h2>
                        <p class="installation-description">
                            Click the button below to install the events checkin system on your device.
                        </p>
                    </div>


                    <div class="installation-action">
                        <button class="installation-install-btn" type="button" onClick={install} disabled={!canInstall}>
                            <span class="material-symbols-outlined">download</span>
                            <span>Install Now</span>
                        </button>
                    </div>


                    <div class="installation-security">
                        <div class="installation-secure-badge">
                            <span class="material-symbols-outlined">verified_user</span>
                            <span class="installation-secure-label">Secure Installation</span>
                        </div>
                    </div>

                </div>
            </main>




            <button aria-label="Go back" class="installation-back-btn" type="button" onClick={e=>{nav('/')}}>
                <span class="material-symbols-outlined">arrow_back</span>
            </button>

        </div>
    )
}