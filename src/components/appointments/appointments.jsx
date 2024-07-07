// src/components/appointments/appointments.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, notification, DatePicker, Tag, Popconfirm } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, limit, getDoc } from 'firebase/firestore';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthProvider';

const Appointments = () => {
  const [form] = Form.useForm();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const { currentUser } = useAuth();

  const fetchAppointments = async () => {
    const querySnapshot = await getDocs(collection(db, 'appointments'));
    const appointmentsList = await Promise.all(
      querySnapshot.docs.map(async (appointmentDoc) => {
        const appointmentData = appointmentDoc.data();
        const doctorDoc = await getDoc(doc(db, 'doctors', appointmentData.doctor));
        const doctorData = doctorDoc.data();
        return {
          id: appointmentDoc.id,
          ...appointmentData,
          doctorName: doctorData ? `${doctorData.firstName} ${doctorData.lastName}` : 'Unknown Doctor',
        };
      })
    );
    setAppointments(appointmentsList);
  };

  const fetchPatients = async () => {
    const querySnapshot = await getDocs(collection(db, 'users')); // Fetching from users collection
    const patientsList = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => user.role === 'patient'); // Only patients
    setPatients(patientsList);
  };

  const fetchDoctors = async () => {
    const querySnapshot = await getDocs(collection(db, 'doctors'));
    const doctorsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDoctors(doctorsList);
  };

  const getNextAppointmentId = async () => {
    const q = query(collection(db, 'appointments'), orderBy('appointmentId', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const lastDoc = querySnapshot.docs[0];
      return lastDoc.data().appointmentId + 1;
    }
    return 1;
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
  }, []);

  const handleAddOrUpdateAppointment = async (values) => {
    try {
      const formattedValues = {
        ...values,
        date: values.date.toISOString(),
        approved: false,
      };

      const q = query(
        collection(db, 'appointments'),
        where('date', '==', formattedValues.date)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        notification.error({ message: 'Error', description: 'There is already an appointment at the selected time.' });
        return;
      }

      if (editingAppointment) {
        const appointmentDoc = doc(db, 'appointments', editingAppointment.id);
        await updateDoc(appointmentDoc, formattedValues);
        notification.success({ message: 'Success', description: 'Appointment updated successfully' });
      } else {
        formattedValues.appointmentId = await getNextAppointmentId();
        await addDoc(collection(db, 'appointments'), formattedValues);
        notification.success({ message: 'Success', description: 'Appointment added successfully' });
      }
      fetchAppointments();
      setIsModalVisible(false);
      setEditingAppointment(null);
      form.resetFields();
    } catch (e) {
      console.error('Error adding/updating appointment:', e);
      notification.error({ message: 'Error', description: 'There was an error saving the appointment information' });
    }
  };

  const handleDeleteAppointment = async (id) => {
    try {
      await deleteDoc(doc(db, 'appointments', id));
      notification.success({ message: 'Success', description: 'Appointment deleted successfully' });
      fetchAppointments();
    } catch (e) {
      console.error('Error deleting appointment:', e);
      notification.error({ message: 'Error', description: 'There was an error deleting the appointment information' });
    }
  };

  const handleApproveAppointment = async (id) => {
    try {
      const appointmentDoc = doc(db, 'appointments', id);
      await updateDoc(appointmentDoc, { approved: true });
      notification.success({ message: 'Success', description: 'Appointment approved successfully' });
      fetchAppointments();
    } catch (e) {
      console.error('Error approving appointment:', e);
      notification.error({ message: 'Error', description: 'There was an error approving the appointment' });
    }
  };

  const renderStatusTag = (approved) => {
    if (approved) {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Approved
        </Tag>
      );
    } else {
      return (
        <Tag icon={<ExclamationCircleOutlined />} color="warning">
          Pending
        </Tag>
      );
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'appointmentId', key: 'appointmentId' },
    { title: 'Patient', dataIndex: 'patient', key: 'patient' },
    { title: 'Doctor', dataIndex: 'doctorName', key: 'doctorName' },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => moment(text).format('DD-MM-YYYY HH:mm'),
    },
    { title: 'Reason', dataIndex: 'reason', key: 'reason' },
    {
      title: 'Status',
      dataIndex: 'approved',
      key: 'approved',
      render: (text, record) => renderStatusTag(record.approved),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          {currentUser.role === 'doctor' && !record.approved && (
            <Button onClick={() => handleApproveAppointment(record.id)} style={{ marginRight: 10 }}>
              Approve
            </Button>
          )}
          {currentUser.role === 'doctor' && (
            <Button onClick={() => {
              setEditingAppointment(record);
              form.setFieldsValue({
                ...record,
                date: moment(record.date),
              });
              setIsModalVisible(true);
            }} style={{ marginRight: 10 }}>Edit</Button>
          )}
          <Popconfirm
            title="Are you sure to delete this appointment?"
            onConfirm={() => handleDeleteAppointment(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="appointments-container">
      {currentUser.role === 'admin' || currentUser.role === 'patient' ? (
        <Button type="primary" onClick={() => setIsModalVisible(true)}>Add Appointment</Button>
      ) : null}
      <Table
        dataSource={appointments}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        style={{ marginTop: 20 }}
        className="appointments-table"
      />
      <Modal
        title={editingAppointment ? 'Edit Appointment' : 'Add Appointment'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingAppointment(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleAddOrUpdateAppointment}>
          {currentUser.role === 'admin' ? (
            <Form.Item name="patient" label="Patient" rules={[{ required: true, message: 'Please select the patient' }]}>
              <Select placeholder="Select a patient">
                {patients.map(patient => (
                  <Select.Option key={patient.id} value={`${patient.firstName} ${patient.lastName}`}>
                    {patient.firstName} {patient.lastName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item name="patient" label="Patient" initialValue={`${currentUser.firstName} ${currentUser.lastName}`}>
              <Input value={`${currentUser.firstName} ${currentUser.lastName}`} disabled />
            </Form.Item>
          )}
          <Form.Item name="doctor" label="Doctor" rules={[{ required: true, message: 'Please select the doctor' }]}>
            <Select placeholder="Select a doctor">
              {doctors.map(doctor => (
                <Select.Option key={doctor.id} value={doctor.id}>
                  {doctor.firstName} {doctor.lastName} - {doctor.position}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please enter the date' }]}>
            <DatePicker
              showTime={{
                format: 'HH:mm',
                minuteStep: 30,
              }}
              format="DD-MM-YYYY HH:mm"
            />
          </Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Please enter the reason' }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingAppointment ? 'Update' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Appointments;
