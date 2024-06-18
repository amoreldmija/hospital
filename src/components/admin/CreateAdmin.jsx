// src/components/admin/CreateAdmin.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Typography, notification } from 'antd';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { setDoc, doc } from 'firebase/firestore';

const { Title } = Typography;

const CreateAdmin = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const { email, password } = values;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        role: 'admin',
      });
      notification.success({ message: 'Admin user created successfully' });
    } catch (error) {
      notification.error({ message: 'Failed to create admin user', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: '20px' }}>
      <Title level={2}>Create Admin User</Title>
      <Form name="create-admin" onFinish={onFinish}>
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Please input the email!' }]}
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input the password!' }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Admin
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateAdmin;
