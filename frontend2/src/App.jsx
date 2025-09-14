import { useState, useEffect } from 'react'
import "./assets/layouts.css"
import { io } from "socket.io-client";
import debounce from "lodash.debounce";

import data_api from './utility';

const socket = io("http://localhost:5000", { transports: ["websocket"] });

function App() {
  const [count, setCount] = useState(0)
  const [query, set_query] = useState("")
  const [search_results,set_search_results]=useState([])

  useEffect(() => {
    socket.on("welcome", (data) => console.log(data));
    socket.emit("ping", { msg: "hello" });

    return () => socket.disconnect();
  }, []);


  // Debounced API call
  const fetchSuggestions = debounce(async (q) => {
    if (!q) {
      set_search_results([]);
      return;
    }

    try {

      const data = await data_api('/search', { "query": query })
      console.log(data)
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, 300); // 300ms debounce

  useEffect(() => {
    fetchSuggestions(query);
  }, [query]);

  return (
    <>
      <div className="main_container center_top_vertical">

        <div className="main_count_container">
          <div className='left_center_horizontal'>
            <span>Total Count:</span>
            <h1>00</h1>
          </div>
          <div className='left_center_horizontal'>
            <span>Total Invited:</span>
            <h1>00</h1>
          </div>
        </div>

        <div className="main_search_content center_top_vertical" style={{ "gap": "20px" }}>
          <div className="main_search_container">
            <input type="text" placeholder='search' value={query} onChange={e => { set_query(e.target.value) }} />
          </div>
          <div className="main_search_suggestions">
            <div className="person_container left_center_vertical">
              <span>Name:Peter Kimutai</span>
              <span>Id:39012534</span>
              <span>Phone:0769795599</span>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}

export default App
