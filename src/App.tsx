// React Imports
import React, { FC } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import NavBar from "./Components/NavBar";
import Popup from "./Components/Popup";
import { useUniversalConnect } from "./Hooks";

const App: FC = () => {
  useUniversalConnect();

  return (
    <>
      <NavBar />
      <Popup />
      <Switch>
        <Route path="/home">
          <div>Hello</div>
        </Route>
        <Route path="/">
          <Redirect to="/home" />
        </Route>
      </Switch>
    </>
  );
};

export default App;
