import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  DatePicker,
  InputNumber,
  Select,
  Table,
  Divider,
  Card,
  Statistic,
  Drawer,
  PageHeader,
} from "antd";
import { ArrowUpOutlined, PlusCircleTwoTone } from "@ant-design/icons";
import moment from "moment";
import axios from "axios";

import CONSTANTS from "../config/constants";
const { Option } = Select;

function Ticker({
  token,
  member,
  match: {
    params: { ticker },
  },
}) {
  const history = useHistory();
  const dateFormat = "MM/DD/YYYY";
  document.title = "Wheel Ledger";

  const [ledgerData, setLedgerData] = useState([]);
  const [ledgerColumns, setLedgerColumns] = useState([]);

  useEffect(() => {
    if (!token) {
      history.push("/login");
      return;
    }
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
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
          getOptionLedger(tickers: "${ticker}") {
            id
            open_date
            ticker
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

    const optionLedger = rsp.data.data.getOptionLedger;
    if (!optionLedger) {
      return;
    }

    let key = 0;
    const options = optionLedger.map((option) =>
      Object.assign(option, { key: ++key })
    );

    let columns = [];
    if (options.length) {
      Object.keys(options[0]).forEach((column) => {
        if (["key", "id"].includes(column)) return;

        columns.push({
          title: column,
          dataIndex: column,
          key: column,
        });
      });

      setLedgerColumns([
        {
          key: "status",
          title: "Status",
          dataIndex: "status",
          filters: options
            .map((o) => o.status)
            .filter((item, i, ar) => ar.indexOf(item) === i)
            .map((v) => ({ text: v, value: v })),
          onFilter: (value, record) => record.status.includes(value),
        },
        {
          key: "ticker",
          title: "Ticker",
          dataIndex: "ticker",
          filters: options
            .map((o) => o.ticker)
            .filter((item, i, ar) => ar.indexOf(item) === i)
            .map((v) => ({ text: v, value: v })),
          onFilter: (value, record) => record.ticker.indexOf(value) === 0,
        },
        {
          key: "option_type",
          title: "Type",
          dataIndex: "option_type",
          filters: options
            .map((o) => o.option_type)
            .filter((item, i, ar) => ar.indexOf(item) === i)
            .map((v) => ({ text: v, value: v })),
          onFilter: (value, record) => record.option_type.indexOf(value) === 0,
        },
        {
          key: "contracts",
          title: "Contracts",
          dataIndex: "contracts",
        },
        {
          key: "strike",
          title: "Strike",
          dataIndex: "strike",
        },
        {
          key: "open_date",
          title: "Opened",
          dataIndex: "open_date",
        },
        {
          key: "close_date",
          title: "Closed",
          dataIndex: "close_date",
        },
        {
          key: "expiration",
          title: "Expiration",
          dataIndex: "expiration",
        },
        {
          key: "days_open",
          title: "Days Open",
          dataIndex: "days_open",
          responsive: ["xl"],
        },
        {
          key: "credit",
          title: "Premium",
          dataIndex: "credit",
          responsive: ["xl"],
          render: (text, record) => {
            if (text > record.target_premium) {
              return <span style={{ color: "green" }}>{text}</span>;
            }

            return <span style={{ color: "red" }}>{text}</span>;
          },
        },
        {
          key: "target_premium",
          title: "Target Premium",
          dataIndex: "target_premium",
          responsive: ["xl"],
          render: (text) => <span style={{ color: "grey" }}>{text}</span>,
        },
        {
          key: "debit",
          title: "Buy Out",
          dataIndex: "debit",
          responsive: ["xl"],
        },
        {
          key: "buyout_target",
          title: "Target Buy Out",
          dataIndex: "buyout_target",
          responsive: ["xl"],
          render: (text) => <span style={{ color: "grey" }}>{text}</span>,
        },
        {
          key: "collateral",
          title: "Collateral",
          dataIndex: "collateral",
          responsive: ["xl"],
          render: (text, record) => {
            if (record.option_type !== "Covered Call") {
              return text;
            }
          },
        },
        {
          key: "daily_return",
          title: "Daily Return",
          dataIndex: "daily_return",
          responsive: ["xl"],
          sorter: (a, b) =>
            a.daily_return.replace("$", "") - b.daily_return.replace("$", ""),
        },
        {
          key: "net_credit",
          title: "Net",
          dataIndex: "net_credit",
          responsive: ["xl"],
        },
        {
          key: "annualized_return",
          title: "Annualized",
          dataIndex: "annualized_return",
          responsive: ["xl"],
          sorter: (a, b) =>
            a.annualized_return.replace("%", "") -
            b.annualized_return.replace("%", ""),
          render: (text) => {
            if (text > CONSTANTS.TARGETS.PREMIUM_ANNUALIZED) {
              return <span style={{ color: "green" }}>{text}%</span>;
            }

            return <span style={{ color: "black" }}>{text}%</span>;
          },
        },
      ]);

      let optionKey = 0;
      const transformedOptions = options.map((option) => {
        return {
          key: ++optionKey,
          id: option.id,
          ticker: option.ticker,
          status: option.status,
          contracts: option.contracts,
          strike: option.strike,
          open_date: moment(option.open_date).format("MM/DD"),
          credit: option.credit,
          debit: option.debit,
          net_credit: option.net_credit,
          expiration: moment(option.expiration).format("MM/DD"),
          close_date: moment(option.close_date).format("MM/DD"),
          annualized_return: option.annualized_return,
          daily_return: option.daily_return,
          option_type: option.option_type,
          buyout_target: option.buyout_target,
          target_premium: option.target_premium,
          collateral: option.collateral,
          days_open: option.days_open,
        };
      });

      setLedgerData(transformedOptions);
    }
  };

  return (
    <div>
      <PageHeader
        onBack={() => history.goBack()}
        title={`${ticker} | The Wheel Ledger`}
        subTitle="Performance"
      />

      <Row style={{ margin: "10px" }}>
        <Col flex="auto">
          <Table
            dataSource={ledgerData}
            size="small"
            pagination={{ total: ledgerData.length, defaultPageSize: 100 }}
            columns={ledgerColumns}
          />
        </Col>
      </Row>
    </div>
  );
}

export default Ticker;
