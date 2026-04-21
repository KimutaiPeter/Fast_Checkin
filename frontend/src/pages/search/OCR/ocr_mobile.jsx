import { useState, useRef, useEffect, useCallback } from "react";
import Tesseract from "tesseract.js";
import './ocr.css'
import './layouts.css'
import data_api from "../../utility";

const styles = ``;

export default function Mobile_OCR(props) {
    const [phase, setPhase] = useState("idle"); // idle | loading | scanning | found | error
    const [statusMsg, setStatusMsg] = useState("Ready to scan");
    const [scannedText, setScannedText] = useState("");
    const [scannedID, set_scannedID] = useState('');
    const [id_search_status, set_id_search_status] = useState('not_searching');
    const [confidence, setConfidence] = useState(null);
    const [progress, setProgress] = useState(0);
    const [copied, setCopied] = useState(false);
    const [hasCam, setHasCam] = useState(true);
    const [threshold] = useState(20);
    const [checkin_status, set_checkin_status] = useState('checkin');
    const [event_data] = useState(props.event_data);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const scanningRef = useRef(false);
    const activeRef = useRef(false);
    const timeoutRef = useRef(null);
    const workerRef = useRef(null);         // persistent Tesseract worker
    const workerReadyRef = useRef(false);   // true once worker is initialised

    // ── Inject styles & initialise persistent worker ──────────────────────────
    useEffect(() => {
        const el = document.createElement("style");
        el.textContent = styles;
        document.head.appendChild(el);

        const initWorker = async () => {
            try {
                const worker = await Tesseract.createWorker("eng", 1, {
                    logger: m => {
                        if (m.status === "recognizing text") {
                            setProgress(Math.round(m.progress * 100));
                        }
                    },
                });

                // Tuned for speed: broad charset to support passports + national IDs
                await worker.setParameters({
                    tessedit_pageseg_mode: Tesseract.PSM.AUTO,
                    // Keep alphanumerics + common ID separators; drop punctuation noise
                    tessedit_char_whitelist:
                        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz< ",
                });

                workerRef.current = worker;
                workerReadyRef.current = true;
            } catch (err) {
                console.error("Worker init failed:", err);
            }
        };

        initWorker();

        return () => {
            document.head.removeChild(el);
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
                workerReadyRef.current = false;
            }
        };
    }, []);

    // ── Camera helpers ─────────────────────────────────────────────────────────
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

    // ── Capture: crop centre region + downscale to 400 px wide ────────────────
    const captureDataUrl = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return null;
        if (video.readyState < 2 || video.videoWidth === 0) return null;

        const vw = video.videoWidth;
        const vh = video.videoHeight;

        // Crop the centre 80 % wide × 40 % tall — the typical ID-card zone
        const cropW = vw * 0.80;
        const cropH = vh * 0.40;
        const cropX = (vw - cropW) / 2;
        const cropY = (vh - cropH) / 2;

        const OUT_W = 400;
        const OUT_H = Math.round((cropH / cropW) * OUT_W);

        canvas.width = OUT_W;
        canvas.height = OUT_H;
        canvas
            .getContext("2d")
            .drawImage(video, cropX, cropY, cropW, cropH, 0, 0, OUT_W, OUT_H);

        return canvas.toDataURL("image/jpeg", 0.80);
    }, []);

    // ── ID extraction helpers ──────────────────────────────────────────────────
    function findKenyanIDs(text) {
        const regex = /\b\d{7,9}\b/g;
        return text.match(regex) || [];
    }

    // ── Main scan loop ─────────────────────────────────────────────────────────
    const startScan = useCallback(async () => {
        setPhase("loading");
        setStatusMsg("Starting camera…");
        setScannedText("");
        set_scannedID('');
        set_id_search_status('not_searching');
        setConfidence(null);
        setProgress(0);
        scanningRef.current = false;
        activeRef.current = false;

        try {
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
            setStatusMsg("Scanning… point camera at ID");
            scanningRef.current = true;

            const loop = async () => {
                if (!scanningRef.current) return;

                const dataUrl = captureDataUrl();
                if (!dataUrl) {
                    timeoutRef.current = setTimeout(loop, 300);
                    return;
                }

                if (activeRef.current) {
                    timeoutRef.current = setTimeout(loop, 100);
                    return;
                }

                // Wait for worker if still initialising
                if (!workerReadyRef.current) {
                    setStatusMsg("Preparing OCR engine…");
                    timeoutRef.current = setTimeout(loop, 400);
                    return;
                }

                activeRef.current = true;
                setProgress(0);

                try {
                    // Reuse the persistent worker — no spin-up cost
                    const { data } = await workerRef.current.recognize(dataUrl);

                    activeRef.current = false;
                    if (!scanningRef.current) return;

                    const text = data.text.trim();
                    const conf = Math.round(data.confidence);
                    const KenyanID = findKenyanIDs(text);

                    if (text.length > 3 && conf >= threshold && KenyanID.length > 0) {
                        scanningRef.current = false;
                        stopCamera();
                        setScannedText(text);
                        set_scannedID(KenyanID[0]);
                        setConfidence(conf);
                        setPhase("found");
                        setStatusMsg("ID detected!");
                        setProgress(100);
                        search_id(KenyanID[0]);
                    } else {
                        setStatusMsg(
                            text.length > 3
                                ? `Low confidence (${conf}%) — keep steady`
                                : "No text detected — adjust position"
                        );
                        // Tight loop: retry quickly
                        timeoutRef.current = setTimeout(loop, 100);
                    }
                } catch (e) {
                    activeRef.current = false;
                    if (scanningRef.current) {
                        console.warn("OCR error:", e.message);
                        setStatusMsg("Retrying…");
                        timeoutRef.current = setTimeout(loop, 300);
                    }
                }
            };

            // Give video a moment to stabilise, then start immediately
            timeoutRef.current = setTimeout(loop, 600);

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

    // Cleanup on unmount
    useEffect(() => () => {
        scanningRef.current = false;
        clearTimeout(timeoutRef.current);
        stopCamera();
    }, [stopCamera]);

    // ── Misc helpers ───────────────────────────────────────────────────────────
    const copyText = async () => {
        await navigator.clipboard.writeText(scannedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setScannedText(null);
        reset();
        startScan();
    };

    async function search_id(myScannedID) {
        set_id_search_status('searching');
        const event_id = event_data.serial_no;
        const responce = await data_api('/search_id', { id_number: myScannedID, yugyiu: 50, event_id });
        console.log(responce);
        if (responce.code === 0) {
            if (responce.guest_details.checked_in === 1) {
                set_id_search_status('checkedin');
            } else {
                set_id_search_status('found');
            }
        } else if (responce.code === 1) {
            set_id_search_status('not_found');
        } else if (responce.code === 2) {
            set_checkin_status('error');
        }
    }

    async function checkinDB(scanned_ID) {
        set_checkin_status('checking_in');
        const event_id = props.event_data.serial_no;
        const responce = await data_api("/check_in", { id_number: scanned_ID, event_id });
        console.log(responce);
        if (responce.code === 0) {
            set_id_search_status('checkedin');
        }
    }

    const dotState = phase === "scanning" ? "scanning" : phase === "found" ? "found" : "idle";

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="app_two">

            <div className="scanner-container_two">
                {!hasCam ? (
                    <div className="no-camera">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M23 7l-7 5 7 5V7z" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                        <p>Camera unavailable</p>
                    </div>
                ) : (
                    <div className="video-wrapper_two">
                        <video ref={videoRef} playsInline muted autoPlay />
                        <canvas ref={canvasRef} />
                        <div className="scan-overlay">
                            <div className="corner tl" /><div className="corner tr" />
                            <div className="corner bl" /><div className="corner br" />
                            <div className={`scan-line ${phase === "scanning" ? "active" : ""}`} />
                        </div>
                    </div>
                )}
            </div>

            {phase === "found" && scannedText && (
                <div className="overlay" onClick={handleClose}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {id_search_status === 'found' ? "Found"
                                : id_search_status === 'not_found' ? "Not Found"
                                    : id_search_status === "searching" ? "Searching"
                                        : id_search_status === 'checkedin' ? "Checked In"
                                            : "..."}
                        </h3>
                        <div className="mobile_popup_image center_center_vertical">
                            <img src="/imgs/checked.svg" alt="" />
                        </div>


                        <div class="guest_details-field-group">
                            <label class="guest_details-label" for="full_name">ID/Passport Number</label>
                            <div class="guest_details-input-wrapper">
                                <input class="guest_details-input" id="full_name" name="full_name" type="text"
                                    placeholder="Enter full name" value={scannedID} />
                                <span class="guest_details-icon guest_details-input-icon guest_details-icon-sm">badge</span>
                            </div>
                        </div>

                        {props.event_data.features.tokens && (
                            <div class="guest_details-field-group">
                                <label class="guest_details-label" for="full_name">ID/Passport Number</label>
                                <div class="guest_details-input-wrapper">
                                    <input class="guest_details-input" id="full_name" name="full_name" type="text"
                                        placeholder="Enter full name" value={focused_research_result.id_number !== undefined ? focused_research_result.id_number : ""} />
                                    <span class="guest_details-icon guest_details-input-icon guest_details-icon-sm">badge</span>
                                </div>
                            </div>
                        )}

                        
                        <div class="guest_details-actions">
                            <button class="guest_details-submit-btn" type="submit" onClick={() => {
                                if (id_search_status === 'found') {
                                    checkinDB(scannedID);
                                } else {
                                    reset();
                                    startScan();
                                }
                            }}>
                                {id_search_status === 'found' ? "Check In"
                                    : id_search_status === 'not_found' ? "Continue"
                                        : id_search_status === "searching" ? "Please wait"
                                            : id_search_status === 'checkedin' ? "Checked In"
                                                : "..."}
                                <span class="guest_details-icon">check_circle</span>
                            </button>
                            {/* <button class="guest_details-cancel-btn" type="button">Cancel</button> */}
                        </div>

                    </div>
                </div>
            )}

            <div className="floating_button_container center_center_vertical">
                <div className={`status-dot ${dotState}`} />
                {phase === "idle" || phase === "error"
                    ? <img onClick={startScan} src="/imgs/play2.svg" alt="start" />
                    : phase === "scanning" || phase === "loading"
                        ? <img src="/imgs/stop2.svg" onClick={reset} alt="stop" />
                        : <img src="/imgs/play2.svg" onClick={startScan} alt="start" />
                }
                <img src="/imgs/search.svg" alt="manual search" onClick={() => props.set_page('manual_search')} />
            </div>

            <div className="event_label_main_container center_center_vertical">
                <div className="event_label_container">
                    <h3>{props.event_data.name}</h3>
                    <h5>{props.event_data.venue}</h5>
                    <span>Point your camera at the ID card</span>
                    <img src="/imgs/back2.svg" alt="back" onClick={() => props.nav('/')} />

                    {phase === "scanning" && (
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}