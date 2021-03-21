import React from "react";
import { Switch, Route } from "react-router-dom";

import Ledger from "./Ledger";
import Login from "./Login";

const Main = (token, member) => {
  return (
    <Switch>
      {" "}
      {/* The Switch decides which component to show based on the current URL.*/}
      <Route
        exact
        path="/"
        component={Ledger}
        member={member}
        token={token}
      ></Route>
      <Route
        exact
        path="/login"
        component={Login}
        member={member}
        token={token}
      ></Route>
      {/* <Route exact path='/signup' component={Signup}></Route> */}
    </Switch>
  );
};

export default Main;
