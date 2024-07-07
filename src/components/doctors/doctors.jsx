import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, notification, Popconfirm } from 'antd';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthProvider';

const Doctors = () => {
  const [form] = Form.useForm();
  const [doctors, setDoctors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const { currentUser } = useAuth();

  const fetchDoctors = async () => {
    const querySnapshot = await getDocs(collection(db, 'doctors'));
    const doctorsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDoctors(doctorsList);
  };

  useEffect(() => {
    fetchDoctors();
    console.log("Current User Role:", currentUser.role);
  }, [currentUser]);

  const handleAddOrUpdateDoctor = async (values) => {
    try {
      if (editingDoctor) {
        const doctorDoc = doc(db, 'doctors', editingDoctor.id);
        await updateDoc(doctorDoc, values);
        await setDoc(doc(db, 'users', editingDoctor.id), { ...values, role: 'doctor' });
        notification.success({ message: 'Success', description: 'Doctor updated successfully' });
      } else {
        const newDoctorDoc = await addDoc(collection(db, 'doctors'), values);
        await setDoc(doc(db, 'users', newDoctorDoc.id), { ...values, role: 'doctor' });
        notification.success({ message: 'Success', description: 'Doctor added successfully' });
      }
      fetchDoctors();
      setIsModalVisible(false);
      setEditingDoctor(null);
      form.resetFields();
    } catch (e) {
      console.error('Error adding/updating doctor:', e);
      notification.error({ message: 'Error', description: 'There was an error saving the doctor information' });
    }
  };

  const handleDeleteDoctor = async (id) => {
    try {
      await deleteDoc(doc(db, 'doctors', id));
      await deleteDoc(doc(db, 'users', id));
      notification.success({ message: 'Success', description: 'Doctor deleted successfully' });
      fetchDoctors();
    } catch (e) {
      console.error('Error deleting doctor:', e);
      notification.error({ message: 'Error', description: 'There was an error deleting the doctor information' });
    }
  };

  const columns = [
    { title: 'First Name', dataIndex: 'firstName', key: 'firstName' },
    { title: 'Last Name', dataIndex: 'lastName', key: 'lastName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Position', dataIndex: 'position', key: 'position' },
    { title: 'Employment Type', dataIndex: 'employmentType', key: 'employmentType' },
    { title: 'Phone Number', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          {currentUser.role === 'admin' && (
            <>
              <Button onClick={() => {
                setEditingDoctor(record);
                form.setFieldsValue({
                  ...record,
                });
                setIsModalVisible(true);
              }}>Edit</Button>
              <Popconfirm
                title="Are you sure to delete this doctor?"
                onConfirm={() => handleDeleteDoctor(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button danger style={{ marginLeft: 10 }}>Delete</Button>
              </Popconfirm>
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="doctors-container">
      {currentUser.role === 'admin' && (
        <Button type="primary" onClick={() => setIsModalVisible(true)}>Add Doctor</Button>
      )}
      <Table
        dataSource={doctors}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        style={{ marginTop: 20 }}
        className="doctors-table"
      />
      <Modal
        title={editingDoctor ? 'Edit Doctor' : 'Add Doctor'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingDoctor(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleAddOrUpdateDoctor}>
          <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'Please enter the first name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Please enter the last name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter the email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="position" label="Position" rules={[{ required: true, message: 'Please select the position' }]}>
            <Select placeholder="Select a position">
              <Select.Option value="Surgeon">Surgeon</Select.Option>
              <Select.Option value="General Practitioner">General Practitioner</Select.Option>
              <Select.Option value="Pediatrician">Pediatrician</Select.Option>
              <Select.Option value="Cardiologist">Cardiologist</Select.Option>
              <Select.Option value="Dermatologist">Dermatologist</Select.Option>
              <Select.Option value="Neurologist">Neurologist</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="employmentType" label="Employment Type" rules={[{ required: true, message: 'Please select the employment type' }]}>
            <Select placeholder="Select employment type">
              <Select.Option value="Full-time">Full-time</Select.Option>
              <Select.Option value="Part-time">Part-time</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true, message: 'Please enter the phone number' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please enter the address' }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingDoctor ? 'Update' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Doctors;
