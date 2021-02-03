// React Imports
import React, { StrictMode } from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Redux Imports
import ReduxStore from "./Store";

// Material UI Imports
import Theme from "./Theme";

render(
  <StrictMode>
    <ReduxStore>
      <BrowserRouter>
        <Theme>
          <App />
        </Theme>
      </BrowserRouter>
    </ReduxStore>
  </StrictMode>,
  document.getElementById("root")
);
