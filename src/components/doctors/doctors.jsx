// src/components/doctors/Doctors.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, notification, Popconfirm } from 'antd';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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
  }, []);

  const handleAddOrUpdateDoctor = async (values) => {
    try {
      if (editingDoctor) {
        const doctorDoc = doc(db, 'doctors', editingDoctor.id);
        await updateDoc(doctorDoc, values);
        notification.success({ message: 'Success', description: 'Doctor updated successfully' });
      } else {
        await addDoc(collection(db, 'doctors'), values);
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
      notification.success({ message: 'Success', description: 'Doctor deleted successfully' });
      fetchDoctors();
    } catch (e) {
      console.error('Error deleting doctor:', e);
      notification.error({ message: 'Error', description: 'There was an error deleting the doctor information' });
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Specialization', dataIndex: 'specialization', key: 'specialization' },
    { title: 'Contact', dataIndex: 'contact', key: 'contact' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          {currentUser.role === 'admin' && (
            <>
              <Button onClick={() => {
                setEditingDoctor(record);
                form.setFieldsValue(record);
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
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter the name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="specialization" label="Specialization" rules={[{ required: true, message: 'Please enter the specialization' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contact" label="Contact" rules={[{ required: true, message: 'Please enter the contact' }]}>
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
