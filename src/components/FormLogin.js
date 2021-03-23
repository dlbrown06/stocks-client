import { Form, Input, Button, Typography } from "antd";
import React, { useState } from "react";

const { Text } = Typography;

export default function FormLogin({ login }) {
  const [formErrors, setFormErrors] = useState([]);

  const onFinish = async (values) => {
    const errors = await login(values);
    if (errors) {
      setFormErrors(errors.map((e) => e.message));
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Form name="basic" onFinish={onFinish} onFinishFailed={onFinishFailed}>
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
      {formErrors.length > 0 ? (
        <div>
          {formErrors.map((e) => (
            <Text type="danger">{e}</Text>
          ))}
        </div>
      ) : null}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
