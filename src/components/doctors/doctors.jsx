// src/components/doctors/Doctors.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, notification } from 'antd';
import { getDocs, collection, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthProvider';

const Doctors = () => {
  const [doctorsData, setDoctorsData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { currentUser } = useAuth();

  const fetchDoctorsData = async () => {
    const querySnapshot = await getDocs(collection(db, 'doctors'));
    const doctorsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setDoctorsData(doctorsList);
  };

  useEffect(() => {
    fetchDoctorsData();
  }, []);

  const handleAddOrUpdateDoctor = async (values) => {
    try {
      if (values.id) {
        const doctorDoc = doc(db, 'doctors', values.id);
        await updateDoc(doctorDoc, values);
        notification.success({ message: 'Success', description: 'Doctor updated successfully' });
      } else {
        await addDoc(collection(db, 'doctors'), values);
        notification.success({ message: 'Success', description: 'Doctor added successfully' });
      }
      fetchDoctorsData();
      setIsModalVisible(false);
      form.resetFields();
    } catch (e) {
      notification.error({ message: 'Error', description: 'There was an error saving the doctor information' });
    }
  };

  const handleDeleteDoctor = async (id) => {
    try {
      await deleteDoc(doc(db, 'doctors', id));
      notification.success({ message: 'Success', description: 'Doctor deleted successfully' });
      fetchDoctorsData();
    } catch (e) {
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
          {currentUser.role === 'doctor' && (
            <>
              <Button onClick={() => {
                form.setFieldsValue(record);
                setIsModalVisible(true);
              }}>Edit</Button>
              <Button onClick={() => handleDeleteDoctor(record.id)} danger style={{ marginLeft: 10 }}>Delete</Button>
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="doctors-container">
      {currentUser.role === 'doctor' && (
        <Button type="primary" onClick={() => setIsModalVisible(true)}>Add Doctor</Button>
      )}
      <Table
        dataSource={doctorsData}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        style={{ marginTop: 20 }}
        className="doctors-table"
      />
      <Modal
        title="Add/Edit Doctor"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddOrUpdateDoctor}>
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please input the doctor's name!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="specialization" label="Specialization" rules={[{ required: true, message: "Please input the doctor's specialization!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contact" label="Contact" rules={[{ required: true, message: "Please input the doctor's contact information!" }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {form.getFieldValue('id') ? 'Update' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Doctors;
