import { useState } from 'react'

import React, { useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';

import Index from './pages/OCR'
import Loading from './pages/OCR/loading';
import Scan_error from './pages/OCR/scan_error';
import Not_found from './pages/OCR/not_found';
import Found from './pages/OCR/found';

import OCR from './OCR';
import Manual_search from './manual_search';

function App() {
  const [mode,set_mode]=useState("ocr")
  if(isMobile){
    if(mode=="ocr"){
      return <OCR set_mode={set_mode}/>
    }else{
      return <Manual_search set_mode={set_mode} />
    }
  }else{
    return (
      <h1>Desktop</h1>
    )
  }
}

export default App
