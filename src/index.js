import ReactDOM from "react-dom";

import App from "./pages/App";

// You can choose your kind of history here (e.g. browserHistory)
import { BrowserRouter } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";

import "./index.css";
import "antd/dist/antd.css"; // or 'antd/dist/antd.less'

require("dotenv").config();

ReactDOM.render(
  <BrowserRouter>
    <App /> {/* The various pages will be displayed by the `Main` component. */}
  </BrowserRouter>,
  document.getElementById("root")
);

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById("root")
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
