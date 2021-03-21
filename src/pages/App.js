import { Link, useHistory } from "react-router-dom";
import styled from "styled-components";
import React, { useState, useEffect } from "react";
import {
  ReloadOutlined,
  BankOutlined,
  LoginOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

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
    const token = sessionStorage.getItem("token");
    const member = sessionStorage.getItem("member");
    if (token) {
      setToken(sessionStorage.getItem("token"));
      setMember(JSON.parse(sessionStorage.getItem("member")));
    }
  }, []);

  return (
    <AppContainer>
      <SideBar>
        <SideBarItem>
          <ReloadOutlined spin />
        </SideBarItem>
        {token ? (
          <>
            <SideBarItem
              onClick={() => {
                sessionStorage.removeItem("member");
                sessionStorage.removeItem("token");
                history.push("/login");
              }}
            >
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
        <Main token={token} member={member} />
      </MainContainer>
    </AppContainer>
  );
}
