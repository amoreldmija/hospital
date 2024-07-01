// src/components/patients/Patients.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, notification } from 'antd';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import moment from 'moment';

const Patients = () => {
  const [form] = Form.useForm();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  const fetchPatients = async () => {
    const q = query(collection(db, 'users'), where('role', '==', 'patient'));
    const querySnapshot = await getDocs(q);
    const patientsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPatients(patientsList);
  };

  const fetchDoctors = async () => {
    const querySnapshot = await getDocs(collection(db, 'doctors'));
    const doctorsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDoctors(doctorsList);
  };

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  const handleAddOrUpdatePatient = async (values) => {
    try {
      if (editingPatient) {
        const patientDoc = doc(db, 'patients', editingPatient.id);
        await updateDoc(patientDoc, values);
        notification.success({ message: 'Success', description: 'Patient updated successfully' });
      } else {
        await addDoc(collection(db, 'patients'), values);
        notification.success({ message: 'Success', description: 'Patient added successfully' });
      }
      fetchPatients();
      setIsModalVisible(false);
      setEditingPatient(null);
      form.resetFields();
    } catch (e) {
      notification.error({ message: 'Error', description: 'There was an error saving the patient' });
    }
  };

  const handleDeletePatient = async (id) => {
    try {
      await deleteDoc(doc(db, 'patients', id));
      notification.success({ message: 'Success', description: 'Patient deleted successfully' });
      fetchPatients();
    } catch (e) {
      notification.error({ message: 'Error', description: 'There was an error deleting the patient' });
    }
  };

  const columns = [
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Contact Number', dataIndex: 'contactNumber', key: 'contactNumber' },
    {
      title: 'Doctor',
      dataIndex: 'doctorId',
      key: 'doctorId',
      render: (doctorId) => {
        const doctor = doctors.find(doc => doc.id === doctorId);
        return doctor ? doctor.name : 'Unassigned';
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <Button
            onClick={() => {
              setEditingPatient(record);
              form.setFieldsValue({
                ...record,
              });
              setIsModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button onClick={() => handleDeletePatient(record.id)} danger style={{ marginLeft: 10 }}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={() => setIsModalVisible(true)}>
        Add Patient
      </Button>
      <Table dataSource={patients} columns={columns} rowKey="id" style={{ marginTop: 20 }} />
      <Modal
        title={editingPatient ? 'Edit Patient' : 'Add Patient'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingPatient(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleAddOrUpdatePatient}>
          <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'Please enter the first name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Please enter the last name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter the email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contactNumber" label="Contact Number" rules={[{ required: true, message: 'Please enter the contact number' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="doctorId" label="Doctor" rules={[{ required: true, message: 'Please select a doctor' }]}>
            <Select placeholder="Select a doctor">
              {doctors.map(doctor => (
                <Select.Option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingPatient ? 'Update' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Patients;
