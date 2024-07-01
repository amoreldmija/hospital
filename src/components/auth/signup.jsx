// src/components/auth/Signup.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Typography, notification, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { setDoc, doc } from 'firebase/firestore';

const { Title } = Typography;

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { email, password, firstName, lastName, contactNumber } = values;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        firstName,
        lastName,
        contactNumber,
        role: 'patient'
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
            name="firstName"
            rules={[{ required: true, message: 'Please input your first name!' }]}
          >
            <Input placeholder="First Name" />
          </Form.Item>
          <Form.Item
            name="lastName"
            rules={[{ required: true, message: 'Please input your last name!' }]}
          >
            <Input placeholder="Last Name" />
          </Form.Item>
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
            name="contactNumber"
            rules={[{ required: true, message: 'Please input your contact number!' }]}
          >
            <Input placeholder="Contact Number" />
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
