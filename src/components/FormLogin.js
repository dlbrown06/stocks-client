import { Form, Input, Button, Typography } from "antd";
import axios from "axios";
import { useHistory } from "react-router-dom";
import React, { useState } from "react";

const { Text } = Typography;

export default function FormLogin() {
  const [formErrors, setFormErrors] = useState([]);
  const history = useHistory();

  const onFinish = async (values) => {
    const rsp = await axios({
      method: "POST",
      url: "http://localhost:4000/graphql",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({
        query: `
            mutation {
                login(email: "${values.email}", password: "${values.password}") {
                    token
                    member {
                        id
                        email
                        alias
                        first_name
                        last_name
                    }
                }
            }`,
      }),
    });

    if (rsp.status === 200) {
      if (rsp.data.errors) {
        setFormErrors(rsp.data.errors.map((e) => e.message));
      } else {
        setFormErrors([]);
        sessionStorage.setItem("token", rsp.data.data.login.token);
        sessionStorage.setItem(
          "member",
          JSON.stringify(rsp.data.data.login.member)
        );
        history.push("/");
      }
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
