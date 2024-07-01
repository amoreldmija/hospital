// src/components/prescriptions/prescriptions.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, notification, Popconfirm } from 'antd';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthProvider';

const Prescriptions = () => {
  const [form] = Form.useForm();
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const { currentUser } = useAuth();

  const fetchPrescriptions = async () => {
    const querySnapshot = await getDocs(collection(db, 'prescriptions'));
    const prescriptionsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const updatedPrescriptionsList = await Promise.all(prescriptionsList.map(async (prescription) => {
      const appointmentDoc = await getDoc(doc(db, 'appointments', prescription.appointmentId));
      return {
        ...prescription,
        appointmentId: appointmentDoc.data()?.appointmentId || 'Unknown',
        patientName: appointmentDoc.data()?.patient || 'Unknown',
      };
    }));
    setPrescriptions(updatedPrescriptionsList);
  };

  const fetchAppointments = async () => {
    const querySnapshot = await getDocs(collection(db, 'appointments'));
    const appointmentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAppointments(appointmentsList);
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchAppointments();
  }, []);

  const handleAddOrUpdatePrescription = async (values) => {
    try {
      const appointmentDoc = await getDoc(doc(db, 'appointments', values.appointmentId));
      const appointmentData = appointmentDoc.data();
      
      const prescriptionData = {
        ...values,
        patientName: appointmentData.patient,
      };

      if (editingPrescription) {
        const prescriptionDoc = doc(db, 'prescriptions', editingPrescription.id);
        await updateDoc(prescriptionDoc, prescriptionData);
        notification.success({ message: 'Success', description: 'Prescription updated successfully' });
      } else {
        await addDoc(collection(db, 'prescriptions'), prescriptionData);
        notification.success({ message: 'Success', description: 'Prescription added successfully' });
      }
      fetchPrescriptions();
      setIsModalVisible(false);
      setEditingPrescription(null);
      form.resetFields();
    } catch (e) {
      console.error('Error adding/updating prescription:', e);
      notification.error({ message: 'Error', description: 'There was an error saving the prescription information' });
    }
  };

  const handleDeletePrescription = async (id) => {
    try {
      await deleteDoc(doc(db, 'prescriptions', id));
      notification.success({ message: 'Success', description: 'Prescription deleted successfully' });
      fetchPrescriptions();
    } catch (e) {
      console.error('Error deleting prescription:', e);
      notification.error({ message: 'Error', description: 'There was an error deleting the prescription information' });
    }
  };

  const columns = [
    {
      title: 'Appointment',
      dataIndex: 'appointmentId',
      key: 'appointmentId',
      render: (text, record) => `ID: ${record.appointmentId} - ${record.patientName}`,
    },
    { title: 'Medication', dataIndex: 'medication', key: 'medication' },
    { title: 'Dosage', dataIndex: 'dosage', key: 'dosage' },
    { title: 'Frequency', dataIndex: 'frequency', key: 'frequency' },
    { title: 'Duration', dataIndex: 'duration', key: 'duration' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          {currentUser.role === 'doctor' && (
            <Button onClick={() => {
              setEditingPrescription(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}>Edit</Button>
          )}
          <Popconfirm
            title="Are you sure to delete this prescription?"
            onConfirm={() => handleDeletePrescription(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger style={{ marginLeft: 10 }}>Delete</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="prescriptions-container">
      {currentUser.role === 'doctor' && (
        <Button type="primary" onClick={() => setIsModalVisible(true)}>Add Prescription</Button>
      )}
      <Table
        dataSource={prescriptions}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        style={{ marginTop: 20 }}
        className="prescriptions-table"
      />
      <Modal
        title={editingPrescription ? 'Edit Prescription' : 'Add Prescription'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingPrescription(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleAddOrUpdatePrescription}>
          <Form.Item name="appointmentId" label="Appointment" rules={[{ required: true, message: 'Please select the appointment' }]}>
            <Select placeholder="Select an appointment">
              {appointments.map(appointment => (
                <Select.Option key={appointment.id} value={appointment.id}>
                  ID: {appointment.appointmentId} - {appointment.patient}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="medication" label="Medication" rules={[{ required: true, message: 'Please enter the medication' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dosage" label="Dosage" rules={[{ required: true, message: 'Please enter the dosage' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="frequency" label="Frequency" rules={[{ required: true, message: 'Please enter the frequency' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="duration" label="Duration" rules={[{ required: true, message: 'Please enter the duration' }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingPrescription ? 'Update' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Prescriptions;
