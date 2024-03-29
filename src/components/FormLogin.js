import { Form, Input, Button, Typography } from "antd";
import { LoginOutlined, SyncOutlined } from "@ant-design/icons";
import React, { useState } from "react";

const { Text } = Typography;

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const tailLayout = {
  wrapperCol: { offset: 4, span: 20 },
};

export default function FormLogin({ login }) {
  const [formErrors, setFormErrors] = useState([]);
  const [formMessages, setFormMessages] = useState([]);

  const onFinish = async (values) => {
    setFormMessages(["Logging user in now..."]);
    setFormErrors([]);
    const errors = await login(values);
    if (errors) {
      setFormErrors(errors.map((e) => e.message));
      setFormMessages([]);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Form
      {...layout}
      name="basic"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      style={{
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
      }}
    >
      <Form.Item
        label="Email"
        name="email"
        rules={[
          {
            required: true,
            message: "Please input your email!",
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[
          {
            required: true,
            message: "Please input your password!",
          },
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit" disabled={formMessages.length}>
          {formMessages.length ? (
            <>
              {formMessages.map((e, key) => (
                <Text type="primary" key={key}>
                  <SyncOutlined spin /> {e}
                </Text>
              ))}
            </>
          ) : (
            <>
              <LoginOutlined /> Login
            </>
          )}
        </Button>

        {formErrors.length > 0 ? (
          <span style={{ marginLeft: "10px" }}>
            {formErrors.map((e, key) => (
              <Text type="danger" key={key}>
                {e}
              </Text>
            ))}
          </span>
        ) : null}
      </Form.Item>
    </Form>
  );
}
