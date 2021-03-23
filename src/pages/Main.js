import React from "react";
import { Switch, Route } from "react-router-dom";

import Ledger from "./Ledger";
import Login from "./Login";

const Main = ({ token, member, login, logout }) => {
  return (
    <Switch>
      {" "}
      {/* The Switch decides which component to show based on the current URL.*/}
      <Route
        exact
        path="/"
        render={(props) => (
          <Ledger {...props} member={member} token={token} key={token} />
        )}
      ></Route>
      <Route
        exact
        path="/login"
        render={(props) => (
          <Login {...props} login={login} token={token} key={token} />
        )}
      ></Route>
    </Switch>
  );
};

export default Main;
