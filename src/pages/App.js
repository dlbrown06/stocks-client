import { Link } from "react-router-dom";
import styled from "styled-components";
import { ReloadOutlined, BankOutlined } from "@ant-design/icons";

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
`;

export default function App() {
  return (
    <AppContainer>
      <SideBar>
        <SideBarItem>
          <ReloadOutlined spin />
        </SideBarItem>
        <SideBarItem>
          <BankOutlined />
        </SideBarItem>
      </SideBar>
      <MainContainer>
        <Main />
      </MainContainer>
    </AppContainer>
  );
}
