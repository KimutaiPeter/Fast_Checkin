
import { useState } from 'react'

import React, { useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';

import Index from './pages/OCR'
import Loading from './pages/OCR/loading';
import Scan_error from './pages/OCR/scan_error';
import Not_found from './pages/OCR/not_found';
import Found from './pages/OCR/found';
import data_api from './utility';


function OCR(props) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [captured, set_captured] = useState(false)
    const [page, set_page] = useState("scan")
    const [id_number, set_id_number] = useState(null)
    const [croppedImage, setCroppedImage] = useState(null);
    const [focus_data,set_focus_data]=useState(null)


    // Helper to log messages
    const logMessage = (msg) => {
        // setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
        setLogs((prev) => [...prev, msg]);
        console.log(msg)
    };


    // Start camera feed
    useEffect(() => {
        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { exact: "environment" },
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    },
                    audio: false
                });

                // Try enabling continuous autofocus if supported
                const [track] = stream.getVideoTracks();
                const capabilities = track.getCapabilities();
                if (capabilities.focusMode && capabilities.focusMode.includes("continuous")) {
                    await track.applyConstraints({ advanced: [{ focusMode: "continuous" }] });
                    logMessage("Continuous autofocus enabled.");
                }


                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    logMessage("Camera started successfully.");
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                logMessage("Camera access failed.");
            }
        }
        startCamera();
    }, []);

    function extractIdNumber(text) {
        // Match exactly 8 consecutive digits
        const match = text.match(/\b\d{8}\b/);
        return match ? match[0] : null;
    }

    // Capture frame & run OCR
    const captureAndRecognize = async () => {
        set_captured(true);
        set_page("loading");
        if (!videoRef.current || !canvasRef.current) return;

        // Pause video to "freeze" the frame
        videoRef.current.pause();

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        // Match canvas size to video resolution
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // === Define rectangle as % of video ===
        const boxWidth = canvas.width * 0.6;   // 60% width
        const boxHeight = canvas.height * 0.3; // 30% height
        const boxX = (canvas.width - boxWidth) / 2; // centered X
        const boxY = (canvas.height - boxHeight) / 2; // centered Y

        // === Crop region ===
        const imageData = context.getImageData(boxX, boxY, boxWidth, boxHeight);
        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = boxWidth;
        cropCanvas.height = boxHeight;
        cropCanvas.getContext("2d").putImageData(imageData, 0, 0);
        const croppedImageUrl = cropCanvas.toDataURL("image/png");
        setCroppedImage(croppedImageUrl);

        setLoading(true);
        logMessage("Captured ROI, starting OCR...");

        try {
            const { data: { text } } = await Tesseract.recognize(cropCanvas, "eng", {
                logger: (m) => logMessage([m.status, (m.progress * 100).toFixed(2)]),
            });

            setText(text);
            logMessage("OCR completed successfully.");
            const foundId = extractIdNumber(text);
            set_id_number(foundId);

            if (foundId) {
                var id_search_results=await data_api("/check_in",{id_number:foundId})
                console.log(id_search_results)
                if(id_search_results['success']){
                    set_focus_data(id_search_results["guest_details"])
                    set_page("found")
                    
                }else{
                    console.log("page")
                    set_page("not_found")
                }
                
            } else {
                set_page("scan_error");
            }
        } catch (err) {
            console.error("OCR error:", err);
            logMessage("OCR failed.");
            set_page("scan_error");
        }

        setLoading(false);
    };

    return (
        <>

            <video style={{ "position": "absolute", "top": "0px", "left": "0px", width: "100%", height: "100%" }}
                ref={videoRef}
                autoPlay
                playsInline
                className="rounded-xl shadow-md border mb-4"
            // width="320"
            // height="240"
            />

            {/* Hidden canvas for capturing */}
            <canvas ref={canvasRef} width="320" height="240" hidden></canvas>


            {(() => {
                if (page === "loading") {
                    return <Loading logs={logs} />
                } else if (page === "scan") {
                    if (videoRef.current || canvasRef.current) videoRef.current.play();
                    return <>
                        <Index captureAndRecognize={captureAndRecognize} set_mode={props.set_mode}/>
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: "60%",
                                height: "30%",
                                border: "1px solid #00ff00",
                                boxSizing: "border-box",
                                pointerEvents: "none",
                                zIndex: "200"
                            }}
                        ></div>
                    </>
                } else if (page == "found") {
                    return <Found set_page={set_page} id_number={id_number} focus_data={focus_data} />
                } else if (page == 'not_found') {
                    return <Not_found id_number={id_number} set_page={set_page} set_mode={props.set_mode}/>
                } else if (page == "scan_error") {
                    return <Scan_error set_page={set_page} croppedImage={croppedImage} />
                }
            })()}



        </>
    )
}

export default OCR
