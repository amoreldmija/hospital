import React from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, notification } from 'antd';
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import moment from 'moment';

const Patients = () => {
  const [form] = Form.useForm();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  const fetchPatients = async () => {
    const querySnapshot = await getDocs(collection(db, 'patients'));
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`/patients/${record.id}`}>{text}</Link>,
    },
    { title: 'Date of Birth', dataIndex: 'dob', key: 'dob' },
    { title: 'Contact Details', dataIndex: 'contact', key: 'contact' },
    { title: 'Insurance Information', dataIndex: 'insurance', key: 'insurance' },
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
                dob: record.dob ? moment(record.dob) : null,
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
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter the name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dob" label="Date of Birth" rules={[{ required: true, message: 'Please enter the date of birth' }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="contact" label="Contact Details" rules={[{ required: true, message: 'Please enter the contact details' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="insurance" label="Insurance Information" rules={[{ required: true, message: 'Please enter the insurance information' }]}>
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
