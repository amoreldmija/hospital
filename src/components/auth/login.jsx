// src/components/auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, notification, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../contexts/AuthProvider';

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const onFinish = async (values) => {
    const { email, password } = values;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      notification.success({ message: 'Login successful' });
    } catch (error) {
      notification.error({ message: 'Login failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center" style={{ marginTop: '10%' }}>
      <Col span={8}>
        <Title level={2} style={{ textAlign: 'center' }}>Login</Title>
        <Form name="login" onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="link" onClick={() => navigate('/signup')}>
              Don't have an account? Sign up
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};

export default Login;
