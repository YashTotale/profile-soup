// React Imports
import React, { StrictMode } from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";
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
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </Theme>
      </BrowserRouter>
    </ReduxStore>
  </StrictMode>,
  document.getElementById("root")
);
