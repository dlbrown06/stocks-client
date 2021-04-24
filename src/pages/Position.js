import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  Row,
  Col,
  Divider,
  Statistic,
  PageHeader,
  List,
  Descriptions,
} from "antd";
import moment from "moment";
import axios from "axios";
import Annualized from "../utils/annualized";

import CONSTANTS from "../config/constants";

function Position({
  token,
  member,
  match: {
    params: { ticker, positon_id },
  },
}) {
  const history = useHistory();
  document.title = "Wheel Ledger";

  const [optionData, setOptionData] = useState({
    credit: "",
    forecast: { days: [{ profit_unrealized: 0 }] },
  });

  useEffect(() => {
    if (!token) {
      history.push("/login");
      return;
    }
    fetchPosition();
  }, []);

  const fetchPosition = async () => {
    const rsp = await axios({
      method: "POST",
      url: CONSTANTS.GRAPHQL.URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: JSON.stringify({
        query: `
        query {
            getOptionPosition(option_id: "${positon_id}") {
            open_date
            status
            contracts
            strike
            expiration
            credit
            debit
            collateral
            close_date
            annualized_return
            net_credit
            daily_return
            option_type
            buyout_target
            target_premium
            days_open
          }
        }`,
      }),
    });

    const optionPosition = rsp.data.data.getOptionPosition;
    if (!optionPosition) {
      return;
    }

    optionPosition.gross_credit =
      parseFloat(optionPosition.credit.replace(/\$/g, "")) *
      optionPosition.contracts *
      100;
    optionPosition.forecast = Annualized.minimumPremiumForcast(
      parseFloat(optionPosition.strike.replace(/\$/g, "")),
      optionPosition.contracts,
      optionPosition.open_date,
      optionPosition.expiration
    );

    setOptionData(optionPosition);
  };
  console.log(optionData);
  console.log(optionData.forecast.days[optionData.forecast.days.length - 1]);
  return (
    <div>
      <PageHeader
        onBack={() => history.goBack()}
        title={`${ticker} | The Wheel Ledger`}
        subTitle="Position Performance"
      >
        <Descriptions size="small" column={3}>
          <Descriptions.Item label="Type">
            {optionData.option_type}
          </Descriptions.Item>
          <Descriptions.Item label="Opened">
            {optionData.open_date}
          </Descriptions.Item>
          <Descriptions.Item label="Expiration">
            {optionData.expiration}
          </Descriptions.Item>
          <Descriptions.Item label="DTE">
            {moment(optionData.expiration).diff(
              moment(optionData.open_date),
              "days"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Today's DTE">
            {moment(optionData.expiration).diff(moment(), "days")}
          </Descriptions.Item>
          <Descriptions.Item label="Strike">
            {optionData.strike}
          </Descriptions.Item>
          <Descriptions.Item label="Collateral">
            {optionData.collateral}
          </Descriptions.Item>
          <Descriptions.Item label="Contracts">
            {optionData.contracts}
          </Descriptions.Item>
          <Descriptions.Item label="Premium">
            {optionData.credit}
          </Descriptions.Item>
          <Descriptions.Item label="Gross Premium">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(
              optionData.credit.replace(/\$/g, "") * optionData.contracts * 100
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Premium Per Day (PPD)">
            {optionData.daily_return}
          </Descriptions.Item>
          <Descriptions.Item label="Target PPD">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(
              optionData.forecast.days[optionData.forecast.days.length - 1]
                .profit_unrealized
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Annualized">
            {optionData.annualized_return}%
          </Descriptions.Item>
        </Descriptions>
      </PageHeader>

      <Row style={{ margin: "10px" }}>
        <Col flex="auto">
          <List
            size="small"
            header={<div>Profit Taking Forecast</div>}
            footer={
              <div>
                Based on minimum {CONSTANTS.TARGETS.PREMIUM_ANNUALIZED}
                {"% "}
                Annualized Gain
              </div>
            }
            bordered
            dataSource={optionData.forecast.days}
            renderItem={(item) => (
              <List.Item>
                <Statistic title="Day" value={item.date_cursor} />
                <Divider type="vertical" />
                <Statistic
                  title="If Premium Realized is Greater Than"
                  value={new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(optionData.gross_credit - item.profit_unrealized)}
                />
                <Divider type="vertical" />
                <Statistic
                  title="If Premium Left is Less Than"
                  value={new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(item.profit_unrealized)}
                />
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </div>
  );
}

export default Position;
