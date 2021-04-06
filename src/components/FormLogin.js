import { Form, Input, Button, Typography } from "antd";
import { LoginOutlined, SyncOutlined } from "@ant-design/icons";
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
        <Button
          type="primary"
          htmlType="submit"
          disabled={formMessages.length || formErrors.length}
        >
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
      </Form.Item>
    </Form>
  );
}
