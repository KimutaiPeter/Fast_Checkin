import React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import Tesseract from "tesseract.js";
import './desktop_ocr.css'
const styles = `
`;

export default function Desktop_ocr(props) {
    const [phase, setPhase] = useState("idle"); // idle | loading | scanning | found | error
    const [statusMsg, setStatusMsg] = useState("Ready to scan");
    const [scannedText, setScannedText] = useState("");
    const [scannedID, set_scannedID] = useState('')
    const [confidence, setConfidence] = useState(null);
    const [progress, setProgress] = useState(0);
    const [copied, setCopied] = useState(false);
    const [hasCam, setHasCam] = useState(true);
    const [threshold, setThreshold] = useState(45);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const scanningRef = useRef(false); // controls the loop
    const activeRef = useRef(false);   // true while a recognize() call is in flight
    const timeoutRef = useRef(null);

    // Inject styles
    useEffect(() => {
        const el = document.createElement("style");
        el.textContent = styles;
        document.head.appendChild(el);
        return () => document.head.removeChild(el);
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
    }, []);

    const stop = useCallback(() => {
        scanningRef.current = false;
        clearTimeout(timeoutRef.current);
        stopCamera();
    }, [stopCamera]);

    const reset = useCallback(() => {
        stop();
        setPhase("idle");
        setStatusMsg("Ready to scan");
        setScannedText("");
        setConfidence(null);
        setProgress(0);
    }, [stop]);

    // Capture the current video frame as a JPEG data URL.
    const captureDataUrl = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return null;
        if (video.readyState < 2 || video.videoWidth === 0) return null;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/jpeg", 0.85);
    }, []);

    const startScan = useCallback(async () => {
        setPhase("loading");
        setStatusMsg("Loading Tesseract…");
        setScannedText("");
        setConfidence(null);
        setProgress(0);
        scanningRef.current = false;
        activeRef.current = false;

        try {
            // Start camera with progressive fallback constraints
            const cameraConstraints = [
                { video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } } },
                { video: { width: { ideal: 1280 }, height: { ideal: 720 } } },
                { video: { width: { ideal: 640 }, height: { ideal: 480 } } },
                { video: true },
            ];

            let stream = null;
            let lastErr = null;
            for (const constraints of cameraConstraints) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia(constraints);
                    break;
                } catch (e) {
                    lastErr = e;
                }
            }
            if (!stream) throw lastErr;
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setPhase("scanning");
            setStatusMsg("Scanning… point camera at text");
            scanningRef.current = true;

            // Use Tesseract.recognize() — the simple static API with no worker management.
            // Each call is fully self-contained and cleans up after itself.
            const loop = async () => {
                if (!scanningRef.current) return;

                const dataUrl = captureDataUrl();
                if (!dataUrl) {
                    timeoutRef.current = setTimeout(loop, 500);
                    return;
                }

                // Skip if a previous call is somehow still running
                if (activeRef.current) {
                    timeoutRef.current = setTimeout(loop, 300);
                    return;
                }

                activeRef.current = true;
                setProgress(0);

                try {
                    const { data } = await Tesseract.recognize(dataUrl, "eng", {
                        logger: m => {
                            if (m.status === "recognizing text") {
                                setProgress(Math.round(m.progress * 100));
                            }
                        },
                    });

                    activeRef.current = false;

                    // Bail if stopped while recognize() was running
                    if (!scanningRef.current) return;

                    const text = data.text.trim();
                    const conf = Math.round(data.confidence);
                    var KenyanID = findKenyanIDs(text)

                    if (text.length > 3 && conf >= threshold && KenyanID > 0) {
                        scanningRef.current = false;
                        stopCamera();
                        setScannedText(text);
                        set_scannedID(KenyanID[0])
                        setConfidence(conf);
                        setPhase("found");
                        setStatusMsg("Text detected!");
                        setProgress(100);
                    } else {
                        setStatusMsg(
                            text.length > 3
                                ? `Low confidence (${conf}%) — keep steady`
                                : "No text detected — adjust position"
                        );
                        timeoutRef.current = setTimeout(loop, 800);
                    }
                } catch (e) {
                    activeRef.current = false;
                    if (scanningRef.current) {
                        console.warn("OCR error:", e.message);
                        setStatusMsg("Retrying…");
                        timeoutRef.current = setTimeout(loop, 1500);
                    }
                }
            };

            timeoutRef.current = setTimeout(loop, 1000); // let video stabilise

        } catch (err) {
            console.error(err);
            if (err.name === "NotAllowedError" || err.name === "NotFoundError") {
                setHasCam(false);
                setPhase("error");
                setStatusMsg("Camera access denied or not found");
            } else {
                setPhase("error");
                setStatusMsg("Error: " + err.message);
            }
        }
    }, [captureDataUrl, stopCamera, threshold]);

    useEffect(() => () => {
        scanningRef.current = false;
        clearTimeout(timeoutRef.current);
        stopCamera();
    }, [stopCamera]);

    const copyText = async () => {
        await navigator.clipboard.writeText(scannedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const dotState = phase === "scanning" ? "scanning" : phase === "found" ? "found" : "idle";

    const floating_button_style = 's'

    function findKenyanIDs(text) {
        const regex = /\b\d{7,9}\b/g;
        return text.match(regex) || [];
    }

    const handleClose = () => {
        setScannedText(null);
    };


    return (
        <div class="desktop_ocr-page">
            {/* <!-- ── HEADER ── --> */}
            <header class="desktop_ocr-header">
                <div class="desktop_ocr-header-inner">
                    <div class="desktop_ocr-brand">
                        <div class="desktop_ocr-brand-icon">
                            <span class="material-symbols-outlined">account_balance</span>
                        </div>
                        <h2 class="desktop_ocr-brand-title">EVENTS</h2>
                    </div>
                    <div class="desktop_ocr-header-right">
                        <button class="event_list-icon-btn" onClick={e => { nav('/') }}>
                            <span class="material-symbols-outlined">arrow_back</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* <!-- ── MAIN ── --> */}
            <main class="desktop_ocr-main">
                <div class="desktop_ocr-card">

                    {/* <!-- Camera Viewfinder --> */}
                    <div class="desktop_ocr-viewfinder">

                        {/* <!-- Background image --> */}
                        <div className="scanner-container_tree">
                            {!hasCam ? (
                                <div className="no-camera">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                    <p>Camera unavailable</p>
                                </div>
                            ) : (
                                <div className="video-wrapper_three">
                                    <video ref={videoRef} playsInline muted autoPlay />
                                    <canvas ref={canvasRef} />
                                    <div className="scan-overlay">
                                        <div className="corner tldk" /><div className="corner trdk" />
                                        <div className="corner bldk" /><div className="corner brdk" />
                                        <div className={`scan-line ${phase === "scanning" ? "active" : ""}`} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* <!-- Segmented Control --> */}
                        <div class="desktop_ocr-segmented-wrap">
                            <div class="desktop_ocr-segmented">
                                <button class="desktop_ocr-seg-btn desktop_ocr-seg-btn--active">OCR SCAN</button>
                                <button class="desktop_ocr-seg-btn desktop_ocr-seg-btn--inactive" onClick={e => { props.set_page('manual_search') }}>MANUAL LOOKUP</button>
                            </div>
                        </div>

                        {/* <!-- Scan Overlay --> */}
                        {/* <div class="desktop_ocr-scan-overlay">
                            <div class="desktop_ocr-scan-frame">
                                <div class="desktop_ocr-corner desktop_ocr-corner--tl"></div>
                                <div class="desktop_ocr-corner desktop_ocr-corner--tr"></div>
                                <div class="desktop_ocr-corner desktop_ocr-corner--bl"></div>
                                <div class="desktop_ocr-corner desktop_ocr-corner--br"></div>
                                <div class="desktop_ocr-scan-line"></div>
                            </div>
                        </div> */}

                        {/* <!-- Camera Controls --> */}
                        <div class="desktop_ocr-cam-controls">
                            {/* <button class="desktop_ocr-cam-btn desktop_ocr-cam-btn--ghost" aria-label="Toggle flash">
                                <span class="material-symbols-outlined">flash_on</span>
                            </button> */}

                            {phase === "idle" || phase === "error" ? (<button onClick={startScan} class="desktop_ocr-cam-btn desktop_ocr-cam-btn--primary" aria-label="Capture photo">
                                <span class="material-symbols-outlined">play_arrow</span>
                            </button>)
                                : phase === "scanning" || phase === "loading" ? (<button onClick={reset} class="desktop_ocr-cam-btn desktop_ocr-cam-btn--primary" aria-label="Capture photo">
                                    <span class="material-symbols-outlined">stop</span>
                                </button>)
                                    : (<button onClick={reset} class="desktop_ocr-cam-btn desktop_ocr-cam-btn--primary" aria-label="Capture photo">
                                        <span class="material-symbols-outlined">stop</span>
                                    </button>)
                            }
                            <button onClick={e => { props.nav('/') }} class="desktop_ocr-cam-btn desktop_ocr-cam-btn--primary" aria-label="Capture photo" >
                                <span class="material-symbols-outlined">arrow_back</span>
                            </button>
                        </div>

                    </div>

                    {/* <!-- Instructions --> */}
                    <div class="desktop_ocr-instructions">
                        <div class="desktop_ocr-instructions-inner">
                            <h2 class="desktop_ocr-instructions-title">Scan Identity Document</h2>
                            <p class="desktop_ocr-instructions-desc">
                                Place the ID Card or Passport page inside the frame. Ensure the text is
                                clear and there is no glare from lighting.
                            </p>
                            <div class="desktop_ocr-tips-grid">
                                <div class="desktop_ocr-tip">
                                    <div class="desktop_ocr-tip-icon">
                                        <span class="material-symbols-outlined">light_mode</span>
                                    </div>
                                    <p class="desktop_ocr-tip-label">Good Lighting</p>
                                    <p class="desktop_ocr-tip-text">Avoid shadows or direct bright reflections.</p>
                                </div>

                                <div class="desktop_ocr-tip">
                                    <div class="desktop_ocr-tip-icon">
                                        <span class="material-symbols-outlined">camera_enhance</span>
                                    </div>
                                    <p class="desktop_ocr-tip-label">Hold Steady</p>
                                    <p class="desktop_ocr-tip-text">Keep the device still for optimal character reading.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>


            </main>

            {phase === "found" && scannedText && (
                <div className="overlay" onClick={handleClose}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Found</h3>
                        <div className="mobile_popup_image center_center_vertical">
                            <img src="/imgs/checked.svg" alt="" />
                        </div>
                        <div class="guest_checkin-field">
                            <label class="guest_checkin-label" for="id_number">ID/Passport Number</label>
                            <div class="guest_checkin-input-wrap">
                                <input class="guest_checkin-input guest_checkin-input-with-icon" id="id_number" name="id_number"
                                    type="text" placeholder="Enter ID or Passport number" value={scannedID} />
                                <span class="material-symbols-outlined guest_checkin-input-icon">badge</span>
                            </div>

                            <label class="guest_checkin-label" for="id_number">Token number</label>
                            <div class="guest_checkin-input-wrap">
                                <input class="guest_checkin-input guest_checkin-input-with-icon" id="id_number" name="id_number"
                                    type="text" placeholder="Enter ID or Passport number" value="" inputMode="numeric" pattern="[0-9]*" />
                                <span class="material-symbols-outlined guest_checkin-input-icon">local_activity</span>

                            </div>

                            <button class="guest_checkin-btn-submit" type="submit" onClick={e => { reset(); startScan() }}>
                                Checkin
                                <span class="material-symbols-outlined">check_circle</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}