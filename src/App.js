import React, { useState, useEffect } from "react";
import {
  Layout,
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
} from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import moment from "moment";
import axios from "axios";
import "./App.css";
import CONSTANTS from "./config/constants";

const { Column, ColumnGroup } = Table;
const { Header, Content } = Layout;
const { Option } = Select;

function App() {
  const dateFormat = "MM/DD/YYYY";
  const [form] = Form.useForm();
  const [selectedLedgerId, setSelectedLedgerId] = useState(null);
  const [ledgerData, setLedgerData] = useState([]);
  const [ledgerColumns, setLedgerColumns] = useState([]);
  const [analysisData, setAnalysisData] = useState({});

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    const rsp = await axios({
      method: "POST",
      url: "http://localhost:4000/graphql",
      headers: { "Content-Type": "application/json" },
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
            close_date
            annualized_return
            net_credit
            daily_return
            option_type
            buyout_target
            target_premium
          }
        }`,
      }),
    });

    const optionLedger = rsp.data.data.getOptionLedger;

    let key = 0;
    const options = optionLedger.map((option) =>
      Object.assign(option, { key: ++key })
    );

    let columns = [];
    Object.keys(options[0]).forEach((column) => {
      if (["key", "id"].includes(column)) return;

      columns.push({
        title: column,
        dataIndex: column,
        key: column,
      });
    });

    setLedgerColumns(columns);

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
      };
    });

    setLedgerData(transformedOptions);
  };

  const onFinish = async (values) => {
    values.open_date = moment(values.open_date).format(dateFormat);
    values.expiration = moment(values.expiration).format(dateFormat);
    values.close_date = moment(values.close_date).format(dateFormat);
    values.strike = String(values.strike);
    values.credit = String(values.credit);
    values.debit =
      values.debit !== undefined ? String(values.debit) : undefined;

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

    const rsp = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    }
  };

  const onUpdate = async () => {
    const values = form.getFieldsValue();
    values.open_date = moment(values.open_date).format(dateFormat);
    values.expiration = moment(values.expiration).format(dateFormat);
    values.close_date = moment(values.close_date).format(dateFormat);

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

    const rsp = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  const onAnalysis = async () => {
    const {
      contracts,
      credit,
      debit,
      strike,
      expiration,
      open_date,
    } = form.getFieldsValue();

    //ROUND((((contracts * (credit - debit) * 100)) / (strike * contracts * 100)) * (365 / ((expiration::DATE - open_date::DATE))) * 100) annualized_return,

    setAnalysisData({
      gross_credit: (credit - debit) * 100 * contracts,
      net_credit: (credit - debit) * 100 * contracts * 0.75,
      collateral: strike * contracts * 100,
      days_open: moment(expiration).diff(open_date, "days"),
      target_premium:
        strike *
        ((0.6 * moment(expiration).diff(open_date, "days")) / 365) *
        1.3,
      buyout_target: credit * 0.25,
      daily_return:
        (((credit - debit) * contracts) /
          moment(expiration).diff(open_date, "days")) *
        100,
      annualized_return:
        ((contracts * (credit - debit) * 100) / (strike * contracts * 100)) *
        ((365 / moment(expiration).diff(open_date, "days")) * 100),
    });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const onDateChange = (date, dateString) => {
    // console.log(date, dateString);
  };

  return (
    <Layout>
      <Header>Header</Header>
      <Content>
        <Row style={{ margin: "20px" }}>
          <Col span={16}>
            <Table
              dataSource={ledgerData}
              size="small"
              pagination={{ pageSize: 100 }}
              onRow={(row, index) => {
                return {
                  onClick: (event) => {
                    console.log("event", event);
                    console.log("row", row);
                    console.log("index", index);
                    setSelectedLedgerId(row.id);
                    form.setFieldsValue({
                      id: row.id,
                      ticker: row.ticker,
                      status: row.status,
                      option_type: row.option_type,
                      open_date: moment(row.open_date, "MM/DD/YY"),
                      contracts: row.contracts,
                      strike: row.strike,
                      credit: row.credit,
                      expiration: moment(row.expiration, "MM/DD/YY"),
                      close_date: moment(row.close_date, "MM/DD/YY"),
                      debit: row.debit,
                    });
                  },
                };
              }}
            >
              <Column title="Ticker" dataIndex="ticker" key="ticker" />
              <Column title="Type" dataIndex="option_type" key="option_type" />
              <Column title="Status" dataIndex="status" key="status" />
              <Column title="Opened" dataIndex="open_date" key="open_date" />
              <Column title="Strike" dataIndex="strike" key="strike" />
              <Column title="Contracts" dataIndex="contracts" key="contracts" />
              <Column title="Net" dataIndex="net_credit" key="net_credit" />
              <Column
                title="Expiration"
                dataIndex="expiration"
                key="expiration"
              />
              <ColumnGroup title="Analysis">
                <Column
                  title="Annualized"
                  dataIndex="annualized_return"
                  key="annualized_return"
                  render={(data) => (
                    <span
                      style={
                        data > CONSTANTS.TARGETS.PREMIUM_ANNUALIZED
                          ? { color: "green" }
                          : { color: "black" }
                      }
                    >
                      {data}%
                    </span>
                  )}
                />
                <Column
                  title="Daily"
                  dataIndex="daily_return"
                  key="daily_return"
                />
                <Column title="Premium" dataIndex="credit" key="credit" />
                <Column title="Buyout" dataIndex="debit" key="debit" />
              </ColumnGroup>
            </Table>
          </Col>
          <Col span={8}>
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
                  { required: true, message: "Please enter the stock ticker!" },
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
                  <Option value="OPEN">OPEN</Option>
                  <Option value="CLOSED">CLOSED</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Type"
                name="option_type"
                rules={[
                  { required: true, message: "Please select the option type!" },
                ]}
              >
                <Select placeholder="Select Option Type">
                  <Option value="Cash Secured Put">Cash Secured Put</Option>
                  <Option value="Covered Call">Covered Call</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Open Date"
                name="open_date"
                rules={[
                  { required: true, message: "Please enter the open date!" },
                ]}
              >
                <DatePicker onChange={onDateChange} format={dateFormat} />
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
                  { required: true, message: "Please enter the strike price!" },
                ]}
              >
                <InputNumber
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
              <Form.Item
                label="Expiration"
                name="expiration"
                rules={[
                  { required: true, message: "Please enter the expiration!" },
                ]}
              >
                <DatePicker format={dateFormat} onChange={onDateChange} />
              </Form.Item>

              <Form.Item label="Close Date" name="close_date">
                <DatePicker format={dateFormat} onChange={onDateChange} />
              </Form.Item>

              <Form.Item label="Buy Out" name="debit">
                <InputNumber
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
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
                    <Button
                      type="secondary"
                      htmlType="button"
                      onClick={onUpdate}
                    >
                      Update
                    </Button>
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
                  </>
                )}

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
                </Row>
              </Card>
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default App;
