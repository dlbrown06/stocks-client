import React from "react";
import { Switch, Route } from "react-router-dom";

import Ledger from "./Ledger";
import Login from "./Login";

const Main = ({ token, member }) => {
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
        component={Login}
        member={member}
        token={token}
      ></Route>
    </Switch>
  );
};

export default Main;
