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

export default function Login({ token, login }) {
  document.title = "Login to the Wheel Ledger";
  const history = useHistory();

  useEffect(() => {
    if (token) {
      history.push("/");
    }
  }, []);

  return (
    <>
      <LoginContainer>
        <Title>The Wheel Ledger</Title>
        <FormLogin login={login} />
      </LoginContainer>
    </>
  );
}
