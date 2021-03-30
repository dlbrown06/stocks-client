import { Link, useHistory } from "react-router-dom";
import styled from "styled-components";
import React, { useState, useEffect } from "react";
import {
  SettingFilled,
  BankOutlined,
  LoginOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import axios from "axios";

import { GRAPHQL } from "../config/constants";
import Main from "./Main";

const AppContainer = styled.div`
  height: 100%;
  width: 100%;
`;

const SideBar = styled.div`
  background-color: black;
  color: white;
  min-height: 100%;
  width: 50px;
  text-align: center;
  padding-top: 10px;
  font-size: 20px;
  float: left;
`;

const SideBarItem = styled(Link)`
  padding: 10px;
  color: white;
`;

const MainContainer = styled.div`
  width: calc(100% - 50px);
  float: right;
  min-height: 100%;
`;

export default function App() {
  const history = useHistory();
  const [member, setMember] = useState({});
  const [token, setToken] = useState(undefined);

  useEffect(() => {
    const sessionToken = sessionStorage.getItem("token");
    const sessionMember = sessionStorage.getItem("member");
    if (sessionToken) {
      setToken(sessionToken);
      setMember(JSON.parse(sessionMember));
    } else {
      if (history.location.pathname !== "/login") {
        history.push("/login");
      }
    }
  }, []);

  const login = async (values) => {
    const rsp = await axios({
      method: "POST",
      url: GRAPHQL.URL,
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({
        query: `
            mutation {
                login(email: "${values.email}", password: "${values.password}") {
                    token
                    member {
                        id
                        email
                        alias
                        first_name
                        last_name
                    }
                }
            }`,
      }),
    });

    if (rsp.status === 200) {
      if (rsp.data.errors) {
        return rsp.data.errors;
      } else {
        sessionStorage.setItem("token", rsp.data.data.login.token);
        sessionStorage.setItem(
          "member",
          JSON.stringify(rsp.data.data.login.member)
        );
        setToken(rsp.data.data.login.token);
        setMember(rsp.data.data.login.member);
        history.push("/");
        return null;
      }
    }
  };

  const logout = () => {
    sessionStorage.removeItem("member");
    sessionStorage.removeItem("token");
    setToken(undefined);
    setMember({});

    history.push("/login");
  };

  return (
    <AppContainer>
      <SideBar key={token}>
        <SideBarItem to="/">
          <SettingFilled />
        </SideBarItem>
        {token ? (
          <>
            <SideBarItem to="#" onClick={logout}>
              <LogoutOutlined />
            </SideBarItem>
            <SideBarItem to="/">
              <BankOutlined />
            </SideBarItem>
          </>
        ) : (
          <SideBarItem to="/login">
            <LoginOutlined />
          </SideBarItem>
        )}
      </SideBar>
      <MainContainer>
        <Main token={token} member={member} key={token} login={login} />
      </MainContainer>
    </AppContainer>
  );
}
