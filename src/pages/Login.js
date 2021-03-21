import styled from "styled-components";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Typography } from "antd";

import FormLogin from "../components/FormLogin";

const { Title } = Typography;

const LoginContainer = styled.div`
  width: 50%;
  min-height: 100%;
  margin: 10% auto;
  @media (max-width: 768px) {
    width: 90%;
  }
`;

export default function App() {
  document.title = "Login to the Wheel";
  const history = useHistory();
  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      history.push("/");
    }
  }, []);

  return (
    <>
      <LoginContainer>
        <Title>Login to the Wheel</Title>
        <FormLogin />
      </LoginContainer>
    </>
  );
}
