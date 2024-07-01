import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, notification } from 'antd';
import { db, auth } from '../../firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const UserManagement = () => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [adminEmail, setAdminEmail] = useState('admin@gmail.com');
  const [adminPassword, setAdminPassword] = useState('123456'); // Change this to your admin password

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(usersList);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddOrUpdateUser = async (values) => {
    try {
      if (editingUser) {
        const userDoc = doc(db, 'users', editingUser.id);
        await updateDoc(userDoc, values);
        notification.success({ message: 'Success', description: 'User updated successfully' });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const userId = userCredential.user.uid;
        await setDoc(doc(db, 'users', userId), { ...values, uid: userId });
        notification.success({ message: 'Success', description: 'User added successfully' });
      }
      fetchUsers();
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
    } catch (e) {
      notification.error({ message: 'Error', description: 'There was an error saving the user information' });
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      await deleteDoc(doc(db, 'users', id));
      await auth.currentUser.delete();
      notification.success({ message: 'Success', description: 'User deleted successfully' });
      fetchUsers();
    } catch (e) {
      console.error('Error deleting user:', e);
      notification.error({ message: 'Error', description: 'There was an error deleting the user' });
    }
  };

  const columns = [
    { title: 'First Name', dataIndex: 'firstName', key: 'firstName' },
    { title: 'Last Name', dataIndex: 'lastName', key: 'lastName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Contact Number', dataIndex: 'contactNumber', key: 'contactNumber' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <Button onClick={() => {
            setEditingUser(record);
            form.setFieldsValue(record);
            setIsModalVisible(true);
          }}>Edit</Button>
          <Button onClick={() => handleDeleteUser(record.id)} danger style={{ marginLeft: 10 }}>Delete</Button>
        </>
      ),
    },
  ];

  return (
    <div className="user-management-container">
      <Button type="primary" onClick={() => setIsModalVisible(true)}>Add User</Button>
      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        style={{ marginTop: 20 }}
        className="users-table"
      />
      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleAddOrUpdateUser}>
          <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'Please enter the first name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Please enter the last name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter the email' }]}>
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter the password' }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="contactNumber" label="Contact Number" rules={[{ required: true, message: 'Please enter the contact number' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select the role' }]}>
            <Select placeholder="Select a role">
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="doctor">Doctor</Select.Option>
              <Select.Option value="patient">Patient</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingUser ? 'Update' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
