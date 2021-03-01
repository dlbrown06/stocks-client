import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Button, Row, Col, DatePicker, InputNumber, Select, Table } from 'antd';
import moment from "moment";
import axios from "axios";
import './App.css';

const { Header, Content } = Layout;
const { Option } = Select;

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

function App() {
  const dateFormat = 'MM/DD/YYYY';
  const [form] = Form.useForm();
  const [ledgerData, setLedgerData] = useState([]);
  const [ledgerColumns, setLedgerColumns] = useState([]);

  useEffect(() => {
    const fetchLedger = async () => {
      const rsp = await axios({
        method: "POST",
        url: "http://localhost:4000/graphql",
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ query: `
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
            }
          }`
        })
      });

      const optionLedger = rsp.data.data.getOptionLedger;
      
      let key = 0;
      const options = optionLedger.map(option => Object.assign(option, { key: ++key }));      

      let columns = [];
      Object.keys(options[0]).forEach(column => {
        if (['key', 'id'].includes(column)) return;
        
        columns.push({
          title: column,
          dataIndex: column,
          key: column,
        });
      });
      
      console.log("columns", columns);
      setLedgerColumns(columns);

      console.log("pre-processing options", options);
      const transformedOptions = options.map(option => {
        return {
          id: option.id,
          ticker: option.ticker,
          status: option.status,
          contracts: option.contracts,
          strike: option.strike,
          open_date: moment(option.open_date).format("M/DD"),          
          credit: option.credit,
          debit: option.debit,
          expiration: moment(option.expiration, "M/D"),
          close_date: moment(option.close_date, "M/D")
        };        
      });
      console.log("post-processing options", transformedOptions);
      setLedgerData(transformedOptions);
    }

    fetchLedger();    
  }, []);

  const onFinish = async (values) => {

    values.open_date = moment(values.open_date).format(dateFormat);
    values.expiration = moment(values.expiration).format(dateFormat);
    values.close_date = moment(values.close_date).format(dateFormat);
    values.strike = String(values.strike);
    values.credit = String(values.credit);
    values.debit = values.debit !== undefined ? String(values.debit) : undefined;

    let params = '';
    for (const key in values) {
      if (values[key] === undefined) continue;
      
      params += `${key}: `;      
      if (typeof values[key] === "string") {
        params += `"${values[key]}"\n`;
      } else {
        params += `${values[key]}\n`;
      }
    }

    const rsp = await fetch('http://localhost:4000/graphql', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `
        mutation {
          createOptionLedgerEntry(${params}) {
            ticker
            status
          }
        }`
      }),
    });

    if (rsp.status === 200) {
      form.resetFields();
    } 
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const onDateChange = (date, dateString) => {
    // console.log(date, dateString);
  }

  return (
    <Layout>
      <Header>Header</Header>
      <Content>
        <Row style={{ margin: "20px" }}>
          <Col span={16}>
            <Table 
              columns={ledgerColumns} 
              dataSource={ledgerData} 
              size="small" 
              pagination={{ pageSize: 100 }}
            />
          </Col>
          <Col span={8}>
            <Form
              {...layout}
              name="basic"
              form={form}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item 
                label="Ticker" 
                name="ticker"
                rules={[{ required: true, message: 'Please enter the stock ticker!' }]}
              >
                <Input placeholder="Stock Ticker" />
              </Form.Item>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select the option status!' }]}
              >
                <Select
                  placeholder="Select Option Status"                  
                >
                  <Option value="OPEN">OPEN</Option>
                  <Option value="CLOSED">CLOSED</Option>                
                </Select>
              </Form.Item>
              <Form.Item
                label="Type"
                name="option_type"
                rules={[{ required: true, message: 'Please select the option type!' }]}
              >
                <Select
                  placeholder="Select Option Type"                  
                >
                  <Option value="Cash Secured Put">Cash Secured Put</Option>
                  <Option value="Covered Call">Covered Call</Option>                
                </Select>
              </Form.Item>
              

              
              <Form.Item 
                label="Open Date"
                name="open_date"
                rules={[{ required: true, message: 'Please enter the open date!' }]}                
              >
                <DatePicker onChange={onDateChange} format={dateFormat} />
              </Form.Item>

              <Form.Item 
                label="Contracts"
                name="contracts"
                rules={[{ required: true, message: 'Please enter the number of contracts!' }]}
              >
                <InputNumber
                  min={1} max={1000}
                />
              </Form.Item>

              <Form.Item 
                label="Strike"
                name="strike"
                rules={[{ required: true, message: 'Please enter the strike price!' }]}
              >
                <InputNumber
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
              <Form.Item 
                label="Premium"
                name="credit"
                rules={[{ required: true, message: 'Please enter the premium collected!' }]}
              >
                <InputNumber
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
              <Form.Item 
                label="Expiration"
                name="expiration"
                rules={[{ required: true, message: 'Please enter the expiration!' }]}
              >
                <DatePicker format={dateFormat} onChange={onDateChange} />
              </Form.Item>

              <Form.Item 
                label="Close Date"
                name="close_date"
              >
                <DatePicker format={dateFormat} onChange={onDateChange} />
              </Form.Item>

              

              <Form.Item 
                label="Buy Out"
                name="debit"
              >
                <InputNumber
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
              <hr />
              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
        </Content>
    </Layout>
      
  );
}

export default App;



