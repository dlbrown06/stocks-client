import React, { useState } from 'react';
import { Layout, Form, Input, Button, Row, Col, DatePicker, InputNumber, Select } from 'antd';
import moment from "moment";
import logo from './logo.svg';
import './App.css';

const { Header, Footer, Content } = Layout;
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
  const onFinish = async (values) => {
    console.log('Success:', values);

    values.open_date = moment(values.open_date).format("D-M-YY");
    values.expiration = moment(values.expiration).format("D-M-YY");
  
    const body = {
      query: {
        mutation: {
          createOptionLedgerEntry(values) {
            ticker
            status
          }
        }
      }
    };

    const rsp = await fetch('http://localhost:4000/graphql', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    console.log(rsp.json());
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const onDateChange = (date, dateString) => {
    console.log(date, dateString);
  }

  return (
    <Layout>
      <Header>Header</Header>
      <Content>
        <Row>
          <Col span={16}>Table</Col>
          <Col span={8}>
            <Form
              {...layout}
              name="basic"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
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
                label="Ticker" 
                name="ticker"
                rules={[{ required: true, message: 'Please enter the stock ticker!' }]}
              >
                <Input placeholder="Stock Ticker" />
              </Form.Item>
              <Form.Item 
                label="Open Date"
                name="open_date"
                rules={[{ required: true, message: 'Please enter the open date!' }]}
              >
                <DatePicker onChange={onDateChange} />
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
                  // onChange={onChange}
                />
              </Form.Item>

              <Form.Item 
                label="Expiration"
                name="expiration"
                rules={[{ required: true, message: 'Please enter the expiration!' }]}
              >
                <DatePicker />
              </Form.Item>

              <Form.Item 
                label="Close Date"
                name="closed_date"
              >
                <DatePicker />
              </Form.Item>

              <Form.Item 
                label="Credit"
                name="credit"
              >
                <InputNumber
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>

              <Form.Item 
                label="Debit"
                name="debit"
              >
                <InputNumber
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>

              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
        </Content>
      <Footer>This is a work in progress!</Footer>
    </Layout>
      
  );
}

export default App;



