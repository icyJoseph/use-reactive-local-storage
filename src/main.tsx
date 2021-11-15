import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ReactiveStorageProvider } from "./Storage";

ReactDOM.render(
  <React.StrictMode>
    <ReactiveStorageProvider>
      <App />
    </ReactiveStorageProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
