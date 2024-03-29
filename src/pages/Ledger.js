import React, { useState, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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
  Badge,
} from "antd";
import {
  ArrowUpOutlined,
  PlusCircleTwoTone,
  DashboardOutlined,
} from "@ant-design/icons";
import moment from "moment";
import axios from "axios";

import CONSTANTS from "../config/constants";
const { Option } = Select;

function Ledger({ member, token }) {
  const history = useHistory();
  const dateFormat = "MM/DD/YYYY";
  document.title = "Wheel Ledger";

  const [form] = Form.useForm();
  const [selectedLedgerId, setSelectedLedgerId] = useState(null);
  const [ledgerData, setLedgerData] = useState([]);
  const [ledgerColumns, setLedgerColumns] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [analysisData, setAnalysisData] = useState({});
  const [visibleDrawer, setVisibleDrawer] = useState(false);

  const [monthPnL, setMonthPnL] = useState(0);
  const [monthlyPnL, setMonthlyPnL] = useState([]);
  const [monthPnLTickers, setMonthPnLTickers] = useState([]);
  const [pnlChartData, setPnLChartData] = useState(0);
  const [tickerChartData, setTickerChartData] = useState([]);

  useEffect(() => {
    if (!token) {
      history.push("/login");
      return;
    }
    fetchLedger();
    fetchLedgerPNL();
    fetchLedgerPNLbyTicker();
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
          getOptionLedger {
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

    const assignments = optionLedger
      .filter((o) => o.status === "ASSIGNED")
      .sort((a, b) => moment(a.close_date) - moment(b.close_date));
    const tickerAssignments = {};
    const ticketAssignmentSummary = [];
    assignments.forEach((a) => {
      if (!tickerAssignments[a.ticker]) {
        tickerAssignments[a.ticker] = assignments.filter(
          (o) => o.ticker === a.ticker
        );
      }
    });

    for (const ticker in tickerAssignments) {
      let collateral = 0;
      let contracts = 0;
      tickerAssignments[ticker].forEach((option) => {
        if (option.option_type === "Cash Secured Put") {
          collateral += parseFloat(
            option.collateral.replace(/[^0-9\.-]+/g, "")
          );
          contracts += option.contracts;
        } else if (option.option_type === "Covered Call") {
          collateral -= parseFloat(
            option.collateral.replace(/[^0-9\.-]+/g, "")
          );
          contracts -= option.contracts;
        }
      });

      if (contracts) {
        ticketAssignmentSummary.push({
          ticker,
          contracts,
          collateral,
          costBasis: collateral / contracts / 100,
        });
        setAssignments(ticketAssignmentSummary);
      }
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
          render: (text, record) =>
            text === "OPEN" ? (
              <Link to={`/ticker/${record.ticker}/position/${record.id}`}>
                <DashboardOutlined /> {text}
              </Link>
            ) : (
              text
            ),
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
          render: (text) => <Link to={`/ticker/${text}`}>{text}</Link>,
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
          // responsive: ["xl"],
        },
        {
          key: "credit",
          title: "Premium",
          dataIndex: "credit",
          // responsive: ["xl"],
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
          // responsive: ["xl"],
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
          // responsive: ["xl"],
          render: (text) => <span style={{ color: "grey" }}>{text}</span>,
        },
        {
          key: "collateral",
          title: "Collateral",
          dataIndex: "collateral",
          // responsive: ["xl"],
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
          // responsive: ["xl"],
          sorter: (a, b) =>
            a.daily_return.replace("$", "") - b.daily_return.replace("$", ""),
        },
        {
          key: "net_credit",
          title: "Net",
          dataIndex: "net_credit",
          // responsive: ["xl"],
        },
        {
          key: "annualized_return",
          title: "Annualized",
          dataIndex: "annualized_return",
          // responsive: ["xl"],
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

  const fetchLedgerPNLbyTicker = async () => {
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
          getOptionMonthlyPNLbyTicker {
            month
            ticker
            credit
            debit
            total
          }
        }`,
      }),
    });

    const pnl = rsp.data.data.getOptionMonthlyPNLbyTicker;
    if (!pnl) {
      return;
    }

    console.log(pnl, "first");
    let pnlChartData = [];
    let tickers = [];
    for (const i of pnl) {
      console.log(i);
      const month = pnlChartData.find((grp) => grp.name === i.month);
      if (!month) {
        let newItem = {};
        newItem.name = i.month;
        newItem[i.ticker] = parseFloat(i.total.replace(/[\$\,]/g, ""));
        pnlChartData.push(newItem);
        tickers.push(i.ticker);
      } else {
        if (!month[i.ticker]) {
          month[i.ticker] = parseFloat(i.total.replace(/[\$\,]/g, ""));
          tickers.push(i.ticker);
        }
      }
    }
    console.log(pnlChartData, "pnlChartData");
    console.log(
      tickers.filter((item, i, ar) => ar.indexOf(item) === i),
      "tickers"
    );
    setPnLChartData(pnlChartData);
    setTickerChartData(tickers.filter((item, i, ar) => ar.indexOf(item) === i)); // unqiue tickers

    setMonthPnL(
      pnl
        .filter((i) => i.month === moment().format("YYYY-MM"))
        .map((i) => i.total.replace(/\$|\,/g, ""))
        .reduce((t, i) => +t + +i, [])
    );

    setMonthPnLTickers(
      pnl.filter((i) => i.month === moment().format("YYYY-MM"))
    );
  };

  const fetchLedgerPNL = async () => {
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
          getOptionMonthlyPNL {
            month
            credit
            debit
            total
          }
        }`,
      }),
    });

    const pnl = rsp.data.data.getOptionMonthlyPNL;
    if (!pnl) {
      return;
    }

    setMonthlyPnL(pnl);
  };

  const onFinish = async (values) => {
    values.open_date = values.open_date
      ? moment(values.open_date).format(dateFormat)
      : moment().format(dateFormat);
    values.expiration = values.expiration
      ? moment(values.expiration).format(dateFormat)
      : moment().endOf("week").subtract(1, "d").format(dateFormat);
    values.close_date = values.close_date
      ? moment(values.close_date).format(dateFormat)
      : moment().endOf("week").subtract(1, "d").format(dateFormat);
    values.strike = String(values.strike);
    values.credit = String(values.credit);
    values.debit = values.debit !== undefined ? String(values.debit) : "0";

    let params = "";
    for (const key in values) {
      if (values[key] === undefined) continue;

      params += `${key}: `;
      if (typeof values[key] === "string") {
        params += `"${values[key]}"\n`;
      } else {
        params += `${values[key]}\n`;
      }
    }

    const rsp = await fetch(CONSTANTS.GRAPHQL.URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
        mutation {
          createOptionLedgerEntry(${params}) {
            ticker
            status
          }
        }`,
      }),
    });

    if (rsp.status === 200) {
      form.resetFields();
      setSelectedLedgerId(null);
      fetchLedger();
    }
  };

  const onUpdate = async () => {
    const values = form.getFieldsValue();
    values.open_date = moment(values.open_date).format(dateFormat);
    values.expiration = moment(values.expiration).format(dateFormat);
    values.close_date = moment(values.close_date).format(dateFormat);
    values.strike = String(values.strike);
    values.credit = String(values.credit);
    values.debit = String(values.debit);

    let params = "";
    for (const key in values) {
      if (values[key] === undefined) continue;

      params += `${key}: `;
      if (typeof values[key] === "string") {
        params += `"${values[key]}"\n`;
      } else {
        params += `${values[key]}\n`;
      }
    }

    const rsp = await fetch(CONSTANTS.GRAPHQL.URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
        mutation {
          updateOptionLedgerEntry(${params}) {
            ticker
            status
          }
        }`,
      }),
    });

    if (rsp.status === 200) {
      form.resetFields();
      setSelectedLedgerId(null);
      fetchLedger();
    }
  };

  const onDelete = async () => {
    const id = form.getFieldValue("id");

    const rsp = await fetch(CONSTANTS.GRAPHQL.URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
        mutation {
          deleteOptionLedgerEntry(id:"${id}")
        }`,
      }),
    });

    if (rsp.status === 200) {
      form.resetFields();
      setSelectedLedgerId(null);
      fetchLedger();
    }
  };

  const onAnalysis = async () => {
    const {
      contracts,
      credit,
      debit = 0,
      strike,
      open_date = moment().format(dateFormat),
      expiration = moment().endOf("week").subtract(1, "d").format(dateFormat),
      close_date = moment().endOf("week").subtract(1, "d").format(dateFormat),
    } = form.getFieldsValue();

    /**
     *  ({Contracts} * ({Premium} * 100)) / Days Open = Premium Per Day or PPD
     *  {Contracts} * ({Strike} * 100) = Buying Power Required or BP
     *  ({PPD} * 360) / {BP} = Annualized
     */
    const premiumPerDay =
      (contracts * credit * 100) / moment(close_date).diff(open_date, "days");

    setAnalysisData({
      gross_credit: credit * 100 * contracts,
      net_credit: (credit - debit) * 100 * contracts,
      collateral: strike * contracts * 100,
      days_open: moment(expiration).diff(open_date, "days"),
      target_premium:
        strike *
        ((0.6 * moment(close_date).diff(open_date, "days")) / 360) *
        1.3,
      buyout_target: credit * 0.25,
      daily_return: premiumPerDay,
      annualized_return:
        ((((contracts * credit * 100) /
          moment(close_date).diff(open_date, "days")) *
          360) /
          (contracts * strike * 100)) *
        100,
    });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const onDateChange = (date, dateString) => {
    // console.log(date, dateString);
  };

  const cspCollateral = ledgerData
    .filter((o) => o.status === "OPEN" && o.option_type === "Cash Secured Put")
    .map((o) => parseFloat(o.collateral.replace(/[\$\,]/g, "")))
    .reduce((accum, val) => accum + val, 0);
  const assignedCollateral = assignments
    .map((a) => a.collateral)
    .reduce((accum, val) => accum + val, 0);
  const totalCollateral = cspCollateral + assignedCollateral;
  const totalOpenPremium = ledgerData
    .filter((o) => o.status === "OPEN")
    .map((o) => o.contracts * o.credit.replace(/\$/g, "") * 100)
    .reduce((accum, val) => accum + val, 0);
  const avgAnnualized =
    ledgerData
      .filter((o) => o.status === "OPEN")
      .map((o) => parseFloat(o.annualized_return))
      .reduce((accum, val) => accum + val, 0) /
    ledgerData.filter((o) => o.status === "OPEN").length;

  return (
    <div>
      <PageHeader
        // onBack={() => null}
        title="The Wheel Ledger"
        subTitle="Open Plays"
      />

      <Row>
        <Col span={12}>
          <Divider orientation="left">Monthly Wheel Profit</Divider>
          {monthlyPnL.map((i, key) => (
            <Statistic
              key={key}
              style={{ margin: "10px", display: "inline-table" }}
              title={i.month}
              value={i.total}
            />
          ))}
          {/* <ResponsiveContainer width="100%" height="100%"> */}
          <BarChart
            width={500}
            height={300}
            data={pnlChartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {tickerChartData.map((t) => (
              <Bar dataKey={t} stackId="a" fill="red" />
            ))}
          </BarChart>
          {/* </ResponsiveContainer> */}
        </Col>
        <Col span={12} style={{ textAlign: "right" }}>
          <Divider orientation="right">Profit this Month by Ticker</Divider>
          <Statistic
            style={{ margin: "10px", display: "inline-table" }}
            title="Total"
            value={monthPnL}
            prefix="$"
          />

          <Divider type="vertical" />
          {monthPnLTickers.map((i, key) => (
            <Statistic
              key={key}
              style={{ margin: "10px", display: "inline-table" }}
              title={i.ticker}
              value={i.total}
            />
          ))}
        </Col>
      </Row>

      {Object.keys(assignments).length ? (
        <>
          <Row>
            <Col span={24}>
              <Divider orientation="left">Current Assignments</Divider>
            </Col>
          </Row>
          <Row gutter={[16, 16]} justify="center">
            {assignments.map((ticker, key) => {
              return (
                <Col xxl={4} xl={6} lg={10} md={10} sm={22} xs={22} key={key}>
                  <Badge.Ribbon
                    text={`${ticker.contracts} Contracts`}
                    key={key}
                  >
                    <Card
                      title={
                        <Link to={`/ticker/${ticker.ticker}`}>
                          {ticker.ticker}
                        </Link>
                      }
                    >
                      <Row style={{ textAlign: "center" }}>
                        <Col span={12}>
                          <Statistic
                            title="Buying Power"
                            value={ticker.collateral}
                            prefix="$"
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Cost Basis"
                            value={ticker.costBasis}
                            precision={2}
                            prefix="$"
                          />
                        </Col>
                      </Row>
                    </Card>
                  </Badge.Ribbon>
                </Col>
              );
            })}
          </Row>
        </>
      ) : null}

      <Row>
        <Col span={24}>
          <Divider orientation="left">Open Play Overview</Divider>
        </Col>
      </Row>
      <Row gutter={[16, 16]} justify="center">
        <Col xxl={4} xl={6} lg={10} md={10} sm={22} xs={22}>
          <Statistic
            title="Total Buying Power in Play"
            value={totalCollateral}
            prefix="$"
          />
        </Col>
        <Col xxl={4} xl={6} lg={10} md={10} sm={22} xs={22}>
          <Statistic
            title="Total Assigned Buying Power"
            value={assignedCollateral}
            prefix="$"
          />
        </Col>
        <Col xxl={4} xl={6} lg={10} md={10} sm={22} xs={22}>
          <Statistic
            title="Total CSP Buying Power"
            value={cspCollateral}
            prefix="$"
          />
        </Col>
        <Col xxl={4} xl={6} lg={10} md={10} sm={22} xs={22}>
          <Statistic
            title="Total Unrealized Premium"
            value={totalOpenPremium}
            prefix="$"
          />
        </Col>
        <Col xxl={4} xl={6} lg={10} md={10} sm={22} xs={22}>
          <Statistic
            title="Average Open Annualized Return"
            value={avgAnnualized}
            suffix="%"
          />
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Divider orientation="left">
            Open Plays{" "}
            <PlusCircleTwoTone
              onClick={() => {
                form.resetFields();
                onAnalysis();
                setSelectedLedgerId(null);
                if (visibleDrawer) {
                  setVisibleDrawer(false);
                } else {
                  setVisibleDrawer(true);
                }
              }}
            />
          </Divider>
        </Col>
      </Row>

      <Row style={{ margin: "10px" }}>
        <Col flex="auto">
          <Table
            dataSource={ledgerData}
            size="small"
            pagination={{ total: ledgerData.length, defaultPageSize: 10 }}
            onRow={(row, index) => {
              return {
                onClick: (event) => {
                  setSelectedLedgerId(row.id);
                  form.setFieldsValue({
                    id: row.id,
                    ticker: row.ticker,
                    status: row.status,
                    option_type: row.option_type,
                    open_date: moment(row.open_date, "MM/DD/YY"),
                    contracts: row.contracts,
                    strike: row.strike.replace("$", ""),
                    credit: row.credit.replace("$", ""),
                    expiration: moment(row.expiration, "MM/DD/YY"),
                    close_date: moment(row.close_date, "MM/DD/YY"),
                    debit: row.debit.replace("$", ""),
                  });
                  onAnalysis();
                  setVisibleDrawer(true);
                },
              };
            }}
            columns={ledgerColumns}
          />
        </Col>
      </Row>

      <Drawer
        title={
          selectedLedgerId
            ? "Editing Ledger Option"
            : "Adding New Ledger Option"
        }
        placement="right"
        closable={false}
        onClose={() => {
          form.resetFields();
          setSelectedLedgerId(null);
          setVisibleDrawer(false);
        }}
        visible={visibleDrawer}
        width={350}
      >
        <Form
          name="basic"
          form={form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item label="Ledger ID" name="id" hidden />
          <Form.Item
            label="Ticker"
            name="ticker"
            rules={[
              {
                required: true,
                message: "Please enter the stock ticker!",
              },
            ]}
          >
            <Input placeholder="Stock Ticker" />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[
              {
                required: true,
                message: "Please select the option status!",
              },
            ]}
          >
            <Select placeholder="Select Option Status">
              {CONSTANTS.OPTION_STATUSES.map((v, k) => (
                <Option value={v} key={k}>
                  {v}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Type"
            name="option_type"
            rules={[
              {
                required: true,
                message: "Please select the option type!",
              },
            ]}
          >
            <Select placeholder="Select Option Type">
              <Option value="Cash Secured Put">Cash Secured Put</Option>
              <Option value="Covered Call">Covered Call</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Open Date" name="open_date">
            <DatePicker
              onChange={onDateChange}
              format={dateFormat}
              defaultValue={moment()}
            />
          </Form.Item>

          <Form.Item
            label="Contracts"
            name="contracts"
            rules={[
              {
                required: true,
                message: "Please enter the number of contracts!",
              },
            ]}
          >
            <InputNumber min={1} max={1000} />
          </Form.Item>

          <Form.Item
            label="Strike"
            name="strike"
            rules={[
              {
                required: true,
                message: "Please enter the strike price!",
              },
            ]}
          >
            <InputNumber
              formatter={(value) =>
                `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
          <Form.Item
            label="Premium"
            name="credit"
            rules={[
              {
                required: true,
                message: "Please enter the premium collected!",
              },
            ]}
          >
            <InputNumber
              formatter={(value) =>
                `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
          <Form.Item label="Expiration" name="expiration">
            <DatePicker
              format={dateFormat}
              onChange={onDateChange}
              defaultValue={moment().endOf("week").subtract(1, "d")}
            />
          </Form.Item>

          <Form.Item label="Close Date" name="close_date">
            <DatePicker
              format={dateFormat}
              onChange={onDateChange}
              defaultValue={moment().endOf("week").subtract(1, "d")}
            />
          </Form.Item>

          <Form.Item label="Buy Out" name="debit">
            <InputNumber
              formatter={(value) =>
                `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              defaultValue="0.00"
            />
          </Form.Item>
          <Divider />
          <Form.Item>
            {selectedLedgerId === null ? (
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            ) : (
              <>
                <Divider type="vertical" />
                <Button type="secondary" htmlType="button" onClick={onUpdate}>
                  Update
                </Button>
                <Divider type="vertical" />
                <Button
                  type="text"
                  htmlType="button"
                  onClick={() => {
                    form.resetFields();
                    setSelectedLedgerId(null);
                  }}
                >
                  Cancel
                </Button>
                <Divider type="vertical" />
                <Button type="link" danger htmlType="button" onClick={onDelete}>
                  Remove
                </Button>
              </>
            )}
            <Divider type="vertical" />
            <Button type="secondary" htmlType="button" onClick={onAnalysis}>
              Analyse
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div>
          <Card size="small" title="Analysis Results">
            <Row gutter={16}>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Annualized Return"
                    value={analysisData.annualized_return}
                    precision={2}
                    prefix={<ArrowUpOutlined />}
                    suffix="%"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Daily Return"
                    value={analysisData.daily_return}
                    precision={2}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Gross Credit"
                    value={analysisData.gross_credit}
                    precision={2}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Net Credit"
                    value={analysisData.net_credit}
                    precision={2}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Buyout Target"
                    value={analysisData.buyout_target}
                    precision={2}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Target Premium"
                    value={analysisData.target_premium}
                    precision={2}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Collateral"
                    value={analysisData.collateral}
                    precision={2}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic title="Days Open" value={analysisData.days_open} />
                </Card>
              </Col>
            </Row>
          </Card>
        </div>
      </Drawer>
    </div>
  );
}

export default Ledger;
