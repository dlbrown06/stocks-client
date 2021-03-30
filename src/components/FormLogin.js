import { Form, Input, Button, Typography } from "antd";
import React, { useState } from "react";

const { Text } = Typography;

export default function FormLogin({ login }) {
  const [formErrors, setFormErrors] = useState([]);
  const [formMessages, setFormMessages] = useState([]);

  const onFinish = async (values) => {
    setFormMessages(["Logging user in now..."]);
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
      {formMessages.length > 0 ? (
        <div>
          {formMessages.map((e, key) => (
            <Text type="primary" key={key}>
              {e}
            </Text>
          ))}
        </div>
      ) : null}
      {formErrors.length > 0 ? (
        <div>
          {formErrors.map((e, key) => (
            <Text type="danger" key={key}>
              {e}
            </Text>
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
