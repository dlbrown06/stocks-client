import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
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
  Drawer,
} from "antd";
import { ArrowUpOutlined, FileAddOutlined } from "@ant-design/icons";
import moment from "moment";
import axios from "axios";

import CONSTANTS from "../config/constants";

const { Column, ColumnGroup } = Table;
const { Header, Content, Footer, Sider } = Layout;
const { Option } = Select;

function Ledger() {
  document.title = "Wheeling Ledger";
  const dateFormat = "MM/DD/YYYY";

  const history = useHistory();
  const [form] = Form.useForm();
  const [selectedLedgerId, setSelectedLedgerId] = useState(null);
  const [ledgerData, setLedgerData] = useState([]);
  const [ledgerColumns, setLedgerColumns] = useState([]);
  const [analysisData, setAnalysisData] = useState({});
  const [visibleDrawer, setVisibleDrawer] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      history.push("/login");
    }

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
          title: "Status",
          dataIndex: "status",
          filters: options
            .map((o) => o.status)
            .filter((item, i, ar) => ar.indexOf(item) === i)
            .map((v) => ({ text: v, value: v })),
          onFilter: (value, record) => record.status.indexOf(value) === 0,
        },
        {
          title: "Ticker",
          dataIndex: "ticker",
          filters: options
            .map((o) => o.ticker)
            .filter((item, i, ar) => ar.indexOf(item) === i)
            .map((v) => ({ text: v, value: v })),
          onFilter: (value, record) => record.ticker.indexOf(value) === 0,
        },
        {
          title: "Type",
          dataIndex: "option_type",
          filters: options
            .map((o) => o.option_type)
            .filter((item, i, ar) => ar.indexOf(item) === i)
            .map((v) => ({ text: v, value: v })),
          onFilter: (value, record) => record.option_type.indexOf(value) === 0,
        },
        {
          title: "Contracts",
          dataIndex: "contracts",
        },
        {
          title: "Strike",
          dataIndex: "strike",
        },
        {
          title: "Opened",
          dataIndex: "open_date",
        },
        {
          title: "Closed",
          dataIndex: "close_date",
        },
        {
          title: "Expiration",
          dataIndex: "expiration",
        },
        {
          title: "Days Open",
          dataIndex: "days_open",
        },
        {
          title: "Premium",
          dataIndex: "credit",
          render: (text, record) => {
            if (text > record.target_premium) {
              return <span style={{ color: "green" }}>{text}</span>;
            }

            return <span style={{ color: "red" }}>{text}</span>;
          },
        },
        {
          title: "Target Premium",
          dataIndex: "target_premium",
          render: (text) => <span style={{ color: "grey" }}>{text}</span>,
        },
        {
          title: "Buy Out",
          dataIndex: "debit",
        },
        {
          title: "Target Buy Out",
          dataIndex: "buyout_target",
          render: (text) => <span style={{ color: "grey" }}>{text}</span>,
        },
        {
          title: "Collateral",
          dataIndex: "collateral",
          render: (text, record) => {
            if (record.option_type !== "Covered Call") {
              return text;
            }
          },
        },
        {
          title: "Daily Return",
          dataIndex: "daily_return",
          sorter: (a, b) =>
            a.daily_return.replace("$", "") - b.daily_return.replace("$", ""),
        },
        {
          title: "Net",
          dataIndex: "net_credit",
        },
        {
          title: "Annualized",
          dataIndex: "annualized_return",
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

  const onDelete = async () => {
    const id = form.getFieldValue("id");

    const rsp = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      expiration,
      open_date,
      close_date = expiration,
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

  return (
    <div>
      <Row style={{ margin: "5px 10px" }}>
        <Col span={18}></Col>
        <Col span={6} style={{ textAlign: "right" }}>
          <Button
            size="large"
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
            type="primary"
            shape="circle"
            icon={<FileAddOutlined />}
          />
        </Col>
      </Row>
      <Row style={{ margin: "10px" }}>
        <Col></Col>

        <Col flex="auto">
          <Table
            dataSource={ledgerData}
            size="small"
            pagination={{ pageSize: 100 }}
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
        width={500}
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
              <Option value="OPEN">OPEN</Option>
              <Option value="CLOSED">CLOSED</Option>
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
