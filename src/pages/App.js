import { useHistory } from "react-router-dom";
import styled from "styled-components";
import React, { useState, useEffect } from "react";
import { LogoutOutlined } from "@ant-design/icons";
import { Button, Divider } from "antd";
import axios from "axios";

import { GRAPHQL } from "../config/constants";
import Main from "./Main";

const AppContainer = styled.section`
  height: 100%;
  width: 100%;
`;

const Header = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1;
`;

const HeaderItem = styled(Button)``;

const MainContainer = styled.div`
  width: 100%;
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
                login(email: "${values.email
                  .toLowerCase()
                  .trim()}", password: "${values.password.trim()}") {
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

  document.title = "Welcome to the Wheel";

  return (
    <AppContainer>
      <Header>
        {token ? (
          <>
            {/* <HeaderItem to="#" onClick={logout} type="primary" shape="circle">
              <LogoutOutlined />
            </HeaderItem>
            <Divider type="vertical" /> */}
            <HeaderItem to="#" onClick={logout} type="primary" shape="circle">
              <LogoutOutlined />
            </HeaderItem>
          </>
        ) : null}
      </Header>
      <MainContainer>
        <Main token={token} member={member} key={token} login={login} />
      </MainContainer>
    </AppContainer>
  );
}
