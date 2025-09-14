import React, { useState } from "react";
import { Component } from 'react';


import Search from "./pages/Manual_search/search";
import Found from "./pages/Manual_search/found";


class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by error boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div>
          <h2>Something went wrong.</h2>
          {this.state.errorInfo && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Manual_search(props) {
  const [focus_data, set_focus_data] = useState([])
  const [my_state, set_my_state] = useState("search")
  const [query, set_query] = useState("")
  const [search_results, set_search_results] = useState([])

  if (my_state == "found") {
    return (
      <ErrorBoundary>
        <Found set_my_state={set_my_state} focus_data={focus_data}/>
      </ErrorBoundary>
    )
  } else {
    return (
      <ErrorBoundary>
        <Search set_mode={props.set_mode} focus_data={focus_data} set_focus_data={set_focus_data} set_my_state={set_my_state} set_query={set_query} query={query} search_results={search_results} />
      </ErrorBoundary>
    )

  }
}