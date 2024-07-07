// src/components/patients/PatientDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, getDocs, query, where, collection } from 'firebase/firestore';
import { Table, Card, Tag } from 'antd';
import moment from 'moment';
import { CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [billings, setBillings] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      const patientDoc = await getDoc(doc(db, 'patients', id));
      setPatient({ id: patientDoc.id, ...patientDoc.data() });

      const appointmentsSnapshot = await getDocs(query(collection(db, 'appointments'), where('patient', '==', patientDoc.data().name)));
      setAppointments(appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const billingsSnapshot = await getDocs(query(collection(db, 'billings'), where('patientName', '==', patientDoc.data().name)));
      setBillings(billingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const prescriptionsSnapshot = await getDocs(query(collection(db, 'prescriptions'), where('patientName', '==', patientDoc.data().name)));
      setPrescriptions(prescriptionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchPatientDetails();
  }, [id]);

  if (!patient) {
    return <div>Loading...</div>;
  }

  const renderStatusTag = (status) => {
    if (status === 'Approved') {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Approved
        </Tag>
      );
    } else if (status === 'Pending') {
      return (
        <Tag icon={<ExclamationCircleOutlined />} color="warning">
          Pending
        </Tag>
      );
    } else {
      return (
        <Tag color="default">
          {status}
        </Tag>
      );
    }
  };

  const renderPaymentStatusTag = (paymentStatus) => {
    if (paymentStatus === 'Paid') {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Paid
        </Tag>
      );
    } else if (paymentStatus === 'Unpaid') {
      return (
        <Tag icon={<ExclamationCircleOutlined />} color="error">
          Unpaid
        </Tag>
      );
    } else if (paymentStatus === 'Pending') {
      return (
        <Tag icon={<CloseCircleOutlined />} color="warning">
          Pending
        </Tag>
      );
    } else {
      return (
        <Tag color="default">
          {paymentStatus}
        </Tag>
      );
    }
  };

  const columnsAppointments = [
    { title: 'Date', dataIndex: 'date', key: 'date', render: (text) => moment(text).format('DD-MM-YYYY HH:mm') },
    { title: 'Doctor', dataIndex: 'doctor', key: 'doctor' },
    { title: 'Reason', dataIndex: 'reason', key: 'reason' },
    { title: 'Status', dataIndex: 'approved', key: 'approved', render: (text, record) => renderStatusTag(record.approved ? 'Approved' : 'Pending') },
  ];

  const columnsBillings = [
    { title: 'Invoice ID', dataIndex: 'invoiceId', key: 'invoiceId' },
    { title: 'Service', dataIndex: 'serviceRendered', key: 'serviceRendered' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (text) => `${text} €` },
    { title: 'Insurance Coverage', dataIndex: 'insuranceCoverage', key: 'insuranceCoverage' },
    { title: 'Payment Status', dataIndex: 'paymentStatus', key: 'paymentStatus', render: (text) => renderPaymentStatusTag(text) },
  ];

  const columnsPrescriptions = [
    { title: 'Medication', dataIndex: 'medication', key: 'medication' },
    { title: 'Dosage', dataIndex: 'dosage', key: 'dosage' },
    { title: 'Frequency', dataIndex: 'frequency', key: 'frequency' },
    { title: 'Duration', dataIndex: 'duration', key: 'duration' },
  ];

  return (
    <div>
      <Card title="Patient Details">
        <p><strong>Name:</strong> {patient.name}</p>
        <p><strong>Date of Birth:</strong> {patient.dob}</p>
        <p><strong>Contact Details:</strong> {patient.contact}</p>
        <p><strong>Insurance Information:</strong> {patient.insurance}</p>
      </Card>

      <Card title="Appointments" style={{ marginTop: 20 }}>
        <Table dataSource={appointments} columns={columnsAppointments} rowKey="id" />
      </Card>

      <Card title="Billing" style={{ marginTop: 20 }}>
        <Table dataSource={billings} columns={columnsBillings} rowKey="id" />
      </Card>

      <Card title="Prescriptions" style={{ marginTop: 20 }}>
        <Table dataSource={prescriptions} columns={columnsPrescriptions} rowKey="id" />
      </Card>
    </div>
  );
};

export default PatientDetail;
