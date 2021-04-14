import React, { useState, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
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
  Badge,
  PageHeader,
} from "antd";
import { CalculatorTwoTone } from "@ant-design/icons";
import moment from "moment";
import axios from "axios";
import Annualized from "../utils/annualized";

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
  const [visibleCostAvgCalc, setVisibleCostAvgCalc] = useState(false);
  const [ledgerColumns, setLedgerColumns] = useState([]);
  const [assignmentSummary, setAssignmentSummary] = useState(null);
  const [calcStrike, setCalcStrike] = useState(0);
  const [calcContracts, setCalcContracts] = useState(0);

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

    const assignments = optionLedger
      .filter((o) => o.status === "ASSIGNED")
      .sort((a, b) => moment(a.close_date) - moment(b.close_date));

    let collateral = 0;
    let contracts = 0;
    for (const ticker of assignments) {
      if (ticker.option_type === "Cash Secured Put") {
        collateral += parseFloat(ticker.collateral.replace(/[^0-9\.-]+/g, ""));
        contracts += ticker.contracts;
      } else if (ticker.option_type === "Covered Call") {
        collateral -= parseFloat(ticker.collateral.replace(/[^0-9\.-]+/g, ""));
        contracts -= ticker.contracts;
      }
    }
    if (contracts) {
      let totalPremium = optionLedger
        .filter((o) => o.status === "BOUGHT TO CLOSE")
        .map(
          (o) =>
            (o.credit.replace(/[^0-9\.-]+/g, "") -
              o.debit.replace(/[^0-9\.-]+/g, "")) *
            o.contracts *
            100
        );
      totalPremium = totalPremium.length
        ? totalPremium.reduce((a, b) => a + b)
        : 0;

      setAssignmentSummary({
        totalPremium,
        contracts,
        collateral,
        costBasis: collateral / contracts / 100,
        costBasisWithPremium: (collateral - totalPremium) / contracts / 100,
      });
    }

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

      {assignmentSummary ? (
        <>
          <Row>
            <Col span={24}>
              <Divider orientation="left">Ticker Summary Performance</Divider>
            </Col>
          </Row>
          <Row gutter={[16, 16]} justify="center">
            <Col span={22}>
              <Badge.Ribbon text={`${assignmentSummary.contracts} Contracts`}>
                <Card>
                  <Row style={{ textAlign: "center" }}>
                    <Col md={6} sm={12} xs={12}>
                      <Statistic
                        title="Buying Power Used"
                        value={assignmentSummary.collateral}
                        prefix="$"
                      />
                    </Col>
                    <Col md={6} sm={12} xs={12}>
                      <Statistic
                        title={
                          <span>
                            Cost Basis{" "}
                            <CalculatorTwoTone
                              style={{ cursor: "pointer" }}
                              onClick={() => setVisibleCostAvgCalc(true)}
                            />
                          </span>
                        }
                        value={assignmentSummary.costBasis}
                        precision={2}
                        prefix="$"
                      />
                    </Col>
                    <Col md={6} sm={12} xs={12}>
                      <Statistic
                        title="Total Premium"
                        value={assignmentSummary.totalPremium}
                        prefix="$"
                      />
                    </Col>
                    <Col md={6} sm={12} xs={12}>
                      <Statistic
                        title="Cost Basis w/ Premium"
                        value={assignmentSummary.costBasisWithPremium}
                        precision={2}
                        prefix="$"
                      />
                    </Col>
                    <Col md={6} sm={12} xs={12}>
                      <Statistic
                        title={`Target CC Premium Exp ${moment()
                          .endOf("week")
                          .subtract(1, "d")
                          .format("MM/DD")}`}
                        value={Annualized.minimumCoveredCallPremium(
                          assignmentSummary.costBasis,
                          moment(),
                          moment().endOf("week").subtract(1, "d")
                        )}
                        precision={2}
                        prefix="$"
                      />
                    </Col>
                    <Col md={6} sm={12} xs={12}>
                      <Statistic
                        title={`Discount Target CC Premium Exp ${moment()
                          .endOf("week")
                          .subtract(1, "d")
                          .format("MM/DD")}`}
                        value={Annualized.minimumCoveredCallPremium(
                          assignmentSummary.costBasisWithPremium,
                          moment(),
                          moment().endOf("week").subtract(1, "d")
                        )}
                        precision={2}
                        prefix="$"
                      />
                    </Col>
                    <Col md={6} sm={12} xs={12}>
                      <Statistic
                        title={`Target CC Premium Exp ${moment()
                          .endOf("week")
                          .subtract(1, "d")
                          .add(1, "weeks")
                          .format("MM/DD")}`}
                        value={Annualized.minimumCoveredCallPremium(
                          assignmentSummary.costBasis,
                          moment(),
                          moment()
                            .endOf("week")
                            .subtract(1, "d")
                            .add(1, "weeks")
                        )}
                        precision={2}
                        prefix="$"
                      />
                    </Col>
                    <Col md={6} sm={12} xs={12}>
                      <Statistic
                        title={`Discount Target CC Premium Exp ${moment()
                          .endOf("week")
                          .subtract(1, "d")
                          .add(1, "weeks")
                          .format("MM/DD")}`}
                        value={Annualized.minimumCoveredCallPremium(
                          assignmentSummary.costBasisWithPremium,
                          moment(),
                          moment()
                            .endOf("week")
                            .subtract(1, "d")
                            .add(1, "weeks")
                        )}
                        precision={2}
                        prefix="$"
                      />
                    </Col>
                  </Row>
                </Card>
              </Badge.Ribbon>
            </Col>
          </Row>
        </>
      ) : null}

      <Divider orientation="left">Ticker Ledger</Divider>

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

      {assignmentSummary ? (
        <Drawer
          title="Cost Average Calculator"
          placement="right"
          closable={false}
          onClose={() => {
            setVisibleCostAvgCalc(false);
          }}
          visible={visibleCostAvgCalc}
          width={500}
        >
          <div>Work In Progress...</div>
          {assignmentSummary ? (
            <>
              <Divider />
              <div>Total Buying Power Used: {assignmentSummary.collateral}</div>
              <div>Assigned Shares: {assignmentSummary.contracts}</div>
              <div>Cost Basis: {assignmentSummary.costBasis}</div>
              <div>
                Total Premium Collected: {assignmentSummary.totalPremium}
              </div>
              <div>
                Cost Basis w/ Premium:{" "}
                {assignmentSummary.costBasisWithPremium.toFixed(2)}
              </div>
              <Divider />
              <div>
                <span>Contracts</span>
                <InputNumber
                  min={1}
                  max={100}
                  onChange={(value) => {
                    setCalcContracts(value);
                  }}
                />
              </div>
              <div>
                <span>Strike</span>
                <InputNumber
                  onChange={(value) => {
                    setCalcStrike(value);
                  }}
                />
              </div>
            </>
          ) : null}

          <div>
            <Divider />
            <div>Contracts {calcContracts}</div>
            <div>Strike {calcStrike}</div>
            <div>Collateral {calcStrike * calcContracts * 100}</div>
            <Divider />
            <div>
              Total Contracts {calcContracts + assignmentSummary.contracts}
            </div>
            <div>
              Total Collateral{" "}
              {calcStrike * calcContracts * 100 + assignmentSummary.collateral}
            </div>
            <div>
              Cost Basis{" "}
              {parseFloat(
                (calcStrike * calcContracts * 100 +
                  assignmentSummary.collateral) /
                  (calcContracts + assignmentSummary.contracts) /
                  100
              ).toFixed(2)}
            </div>
            <div>
              Cost Basis w/ Premium{" "}
              {parseFloat(
                (calcStrike * calcContracts * 100 +
                  assignmentSummary.collateral -
                  assignmentSummary.totalPremium) /
                  (calcContracts + assignmentSummary.contracts) /
                  100
              ).toFixed(2)}
            </div>
          </div>
        </Drawer>
      ) : null}
    </div>
  );
}

export default Ticker;
