import axios from 'axios'

import { useNavigate } from "react-router-dom";


const backend_url= "https://192.168.1.141:5000"

function data_api(path, data) {
    const headers = { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
    return new Promise((resolve, reject) => {
        axios.post(backend_url + path, data, headers)
            .then(res => {
                resolve(res.data)
            })
            .catch(e => { console.error(e); reject(e) })
    })
}

export function data_get(path) {
    const headers = { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
    return new Promise((resolve, reject) => {
        axios.get(backend_url + path, headers)
            .then(res => {
                resolve(res.data)
            })
            .catch(e => { console.error(e); reject(e) })
    })
}

export function encode_function(de_data) {
    let base64 = btoa(de_data);

    // Replace unsafe characters and remove padding
    return base64
        .replace(/\+/g, '-')   // Replace '+' with '-'
        .replace(/\//g, '_')   // Replace '/' with '_'
        .replace(/=+$/, '');   // Remove '=' padding
}

export function decode_function(de_data) {
    // Convert back to standard Base64
    let base64 = de_data.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding back if needed

    while (base64.length % 4) {
        base64 += '=';
    }

    return atob(base64)
}


export default data_api