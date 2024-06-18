// src/components/auth/Signup.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Typography, notification, Row, Col, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { setDoc, doc } from 'firebase/firestore';

const { Title } = Typography;
const { Option } = Select;

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { email, password, role } = values;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        role,
      });
      notification.success({ message: 'Signup successful' });
      navigate('/');
    } catch (error) {
      notification.error({ message: 'Signup failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center" style={{ marginTop: '10%' }}>
      <Col span={8}>
        <Title level={2} style={{ textAlign: 'center' }}>Signup</Title>
        <Form name="signup" onFinish={onFinish}>
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
          <Form.Item
            name="role"
            rules={[{ required: true, message: 'Please select your role!' }]}
          >
            <Select placeholder="Select a role">
              <Option value="doctor">Doctor</Option>
              <Option value="patient">Patient</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Signup
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="link" onClick={() => navigate('/login')}>
              Already have an account? Login
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};

export default Signup;
