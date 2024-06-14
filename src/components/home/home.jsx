// src/components/Home.js
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Table, Modal, notification, Select, Space } from 'antd';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const Home = () => {
  const [patientForm] = Form.useForm();
  const [doctorForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isPatientModalVisible, setIsPatientModalVisible] = useState(false);
  const [isDoctorModalVisible, setIsDoctorModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);

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

  const handlePatientSubmit = async (values) => {
    try {
      await addDoc(collection(db, 'patients'), {
        name: values.name,
        age: parseInt(values.age),
        disease: values.disease,
        doctorId: values.doctorId
      });
      patientForm.resetFields();
      notification.success({
        message: 'Success',
        description: 'Patient added successfully'
      });
      fetchPatients();
      setIsPatientModalVisible(false);
    } catch (e) {
      console.error('Error adding document: ', e);
      notification.error({
        message: 'Error',
        description: 'There was an error adding the patient'
      });
    }
  };

  const handleDoctorSubmit = async (values) => {
    try {
      await addDoc(collection(db, 'doctors'), {
        name: values.name,
        specialty: values.specialty
      });
      doctorForm.resetFields();
      notification.success({
        message: 'Success',
        description: 'Doctor added successfully'
      });
      fetchDoctors();
      setIsDoctorModalVisible(false);
    } catch (e) {
      console.error('Error adding document: ', e);
      notification.error({
        message: 'Error',
        description: 'There was an error adding the doctor'
      });
    }
  };

  const handleUpdateSubmit = async (values) => {
    try {
      const patientDoc = doc(db, 'patients', currentPatient.id);
      await updateDoc(patientDoc, {
        name: values.name,
        age: parseInt(values.age),
        disease: values.disease,
        doctorId: values.doctorId
      });
      updateForm.resetFields();
      notification.success({
        message: 'Success',
        description: 'Patient updated successfully'
      });
      fetchPatients();
      setIsUpdateModalVisible(false);
    } catch (e) {
      console.error('Error updating document: ', e);
      notification.error({
        message: 'Error',
        description: 'There was an error updating the patient'
      });
    }
  };

  const handleDelete = async (patientId) => {
    try {
      await deleteDoc(doc(db, 'patients', patientId));
      notification.success({
        message: 'Success',
        description: 'Patient deleted successfully'
      });
      fetchPatients();
    } catch (e) {
      console.error('Error deleting document: ', e);
      notification.error({
        message: 'Error',
        description: 'There was an error deleting the patient'
      });
    }
  };

  const showUpdateModal = (patient) => {
    setCurrentPatient(patient);
    updateForm.setFieldsValue({
      name: patient.name,
      age: patient.age,
      disease: patient.disease,
      doctorId: patient.doctorId
    });
    setIsUpdateModalVisible(true);
  };

  const patientColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Disease',
      dataIndex: 'disease',
      key: 'disease',
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorId',
      key: 'doctorId',
      render: (doctorId) => {
        const doctor = doctors.find(doc => doc.id === doctorId);
        return doctor ? doctor.name : 'Unassigned';
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space size="middle">
          <Button onClick={() => showUpdateModal(record)}>Update</Button>
          <Button onClick={() => handleDelete(record.id)} danger>Delete</Button>
        </Space>
      )
    }
  ];

  const doctorColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Specialty',
      dataIndex: 'specialty',
      key: 'specialty',
    }
  ];

  const showPatientModal = () => {
    setIsPatientModalVisible(true);
  };

  const handlePatientCancel = () => {
    setIsPatientModalVisible(false);
  };

  const showDoctorModal = () => {
    setIsDoctorModalVisible(true);
  };

  const handleDoctorCancel = () => {
    setIsDoctorModalVisible(false);
  };

  const handleUpdateCancel = () => {
    setIsUpdateModalVisible(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Home Page</h1>
      <Button type="primary" onClick={showPatientModal}>
        Add Patient
      </Button>
      <Button type="primary" onClick={showDoctorModal} style={{ marginLeft: '10px' }}>
        Add Doctor
      </Button>
      <Modal
        title="Add Patient"
        visible={isPatientModalVisible}
        onCancel={handlePatientCancel}
        footer={null}
      >
        <Form
          form={patientForm}
          layout="vertical"
          onFinish={handlePatientSubmit}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter the name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="age"
            label="Age"
            rules={[{ required: true, message: 'Please enter the age' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="disease"
            label="Disease"
            rules={[{ required: true, message: 'Please enter the disease' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="doctorId"
            label="Doctor"
            rules={[{ required: true, message: 'Please select a doctor' }]}
          >
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
              Add Patient
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Add Doctor"
        visible={isDoctorModalVisible}
        onCancel={handleDoctorCancel}
        footer={null}
      >
        <Form
          form={doctorForm}
          layout="vertical"
          onFinish={handleDoctorSubmit}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter the name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="specialty"
            label="Specialty"
            rules={[{ required: true, message: 'Please enter the specialty' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Doctor
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Update Patient"
        visible={isUpdateModalVisible}
        onCancel={handleUpdateCancel}
        footer={null}
      >
        <Form
          form={updateForm}
          layout="vertical"
          onFinish={handleUpdateSubmit}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter the name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="age"
            label="Age"
            rules={[{ required: true, message: 'Please enter the age' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="disease"
            label="Disease"
            rules={[{ required: true, message: 'Please enter the disease' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="doctorId"
            label="Doctor"
            rules={[{ required: true, message: 'Please select a doctor' }]}
          >
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
              Update Patient
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <h2>Patients</h2>
      <Table dataSource={patients} columns={patientColumns} rowKey="id" />
      <h2>Doctors</h2>
      <Table dataSource={doctors} columns={doctorColumns} rowKey="id" />
    </div>
  );
};

export default Home;
