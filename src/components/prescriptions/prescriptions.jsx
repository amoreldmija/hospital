import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, notification, Popconfirm, DatePicker } from 'antd';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthProvider';
import moment from 'moment';

const Prescriptions = () => {
  const [form] = Form.useForm();
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const { currentUser } = useAuth();

  const fetchPrescriptions = async () => {
    const querySnapshot = await getDocs(collection(db, 'prescriptions'));
    const prescriptionsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const updatedPrescriptionsList = await Promise.all(prescriptionsList.map(async (prescription) => {
      let appointmentData = {};
      let doctorData = {};

      try {
        const appointmentDoc = await getDoc(doc(db, 'appointments', prescription.appointmentId));
        appointmentData = appointmentDoc.data() || {};
      } catch (e) {
        console.error('Error fetching appointment:', e);
      }

      try {
        const doctorDoc = await getDoc(doc(db, 'doctors', prescription.doctorId));
        doctorData = doctorDoc.data() || {};
      } catch (e) {
        console.error('Error fetching doctor:', e);
      }

      return {
        ...prescription,
        appointmentId: appointmentData.appointmentId || 'Unknown',
        patientName: appointmentData.patient || 'Unknown',
        doctorName: doctorData.firstName && doctorData.lastName ? `${doctorData.firstName} ${doctorData.lastName}` : 'Unknown',
      };
    }));
    setPrescriptions(updatedPrescriptionsList);
  };

  const fetchAppointments = async () => {
    const querySnapshot = await getDocs(collection(db, 'appointments'));
    const appointmentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAppointments(appointmentsList);
  };

  const fetchDoctors = async () => {
    const querySnapshot = await getDocs(collection(db, 'doctors'));
    const doctorsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDoctors(doctorsList);
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchAppointments();
    fetchDoctors();
  }, []);

  const handleAppointmentChange = async (appointmentId) => {
    const selectedAppointment = appointments.find(appointment => appointment.id === appointmentId);
    console.log('Selected appointment ID:', appointmentId);
    console.log('Fetched appointment data:', selectedAppointment);

    if (selectedAppointment) {
      try {
        const doctorDoc = await getDoc(doc(db, 'doctors', selectedAppointment.doctor));
        const doctorData = doctorDoc.data();
        form.setFieldsValue({
          doctorId: `${doctorData.firstName} ${doctorData.lastName}`,
        });
      } catch (e) {
        console.error('Error fetching doctor:', e);
      }
    }
  };

  const handleAddOrUpdatePrescription = async (values) => {
    try {
      let appointmentData = {};

      try {
        const appointmentDoc = await getDoc(doc(db, 'appointments', values.appointmentId));
        appointmentData = appointmentDoc.data();
      } catch (e) {
        console.error('Error fetching appointment:', e);
      }

      const prescriptionData = {
        ...values,
        patientName: appointmentData.patient,
        prescriptionDate: values.prescriptionDate.toISOString(),
        prescriptionNumber: Math.floor(1000 + Math.random() * 9000), // Random 4 digit number
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

  const handlePrintPrescription = (prescription) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; }
            .prescription-details { margin-top: 20px; }
            .prescription-details p { margin: 5px 0; }
            .header { text-align: center; font-family: 'Montserrat', sans-serif; font-weight: bold; font-size: 24px; }
          </style>
        </head>
        <body>
          <div class="header">DocCRM</div>
          <h1>Prescription</h1>
          <div class="prescription-details">
            <p><strong>Prescription Number:</strong> ${prescription.prescriptionNumber}</p>
            <p><strong>Appointment:</strong> ID: ${prescription.appointmentId} - ${prescription.patientName}</p>
            <p><strong>Doctor:</strong> ${prescription.doctorName}</p>
            <p><strong>Prescription Date:</strong> ${moment(prescription.prescriptionDate).format('YYYY-MM-DD')}</p>
            <p><strong>Medication:</strong> ${prescription.medication}</p>
            <p><strong>Dosage:</strong> ${prescription.dosage}</p>
            <p><strong>Frequency:</strong> ${prescription.frequency}</p>
            <p><strong>Duration:</strong> ${prescription.duration}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const columns = [
    {
      title: 'Prescription Number',
      dataIndex: 'prescriptionNumber',
      key: 'prescriptionNumber',
    },
    {
      title: 'Appointment',
      dataIndex: 'appointmentId',
      key: 'appointmentId',
      render: (text, record) => `ID: ${record.appointmentId} - ${record.patientName}`,
    },
    { title: 'Doctor', dataIndex: 'doctorName', key: 'doctorName' },
    { title: 'Prescription Date', dataIndex: 'prescriptionDate', key: 'prescriptionDate', render: (text) => moment(text).format('YYYY-MM-DD') },
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
              form.setFieldsValue({
                ...record,
                prescriptionDate: moment(record.prescriptionDate),
              });
              setIsModalVisible(true);
            }}>Edit</Button>
          )}
          <Button onClick={() => handlePrintPrescription(record)} style={{ marginLeft: 10 }}>Print</Button>
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
            <Select placeholder="Select an appointment" onChange={handleAppointmentChange}>
              {appointments.map(appointment => (
                <Select.Option key={appointment.id} value={appointment.id}>
                  ID: {appointment.appointmentId} - {appointment.patient}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="prescriptionDate" label="Prescription Date" rules={[{ required: true, message: 'Please select the prescription date' }]}>
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="doctorId" label="Doctor" rules={[{ required: true, message: 'Please select the doctor' }]}>
            <Input disabled />
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
