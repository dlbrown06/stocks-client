import React from "react";
import { Switch, Route } from "react-router-dom";

import Ledger from "./Ledger";

const Main = () => {
  return (
    <Switch>
      {" "}
      {/* The Switch decides which component to show based on the current URL.*/}
      <Route exact path="/" component={Ledger}></Route>
      {/* <Route exact path='/signup' component={Signup}></Route> */}
    </Switch>
  );
};

export default Main;
