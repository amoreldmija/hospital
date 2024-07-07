import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, notification, Tag, Popconfirm, DatePicker } from 'antd';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthProvider';

const services = [
  'General Consultation',
  'Physical Examination',
  'Blood Test',
  'X-Ray',
  'MRI Scan',
  'Surgical Procedure',
  'Therapy Session'
];

const Billing = () => {
  const [form] = Form.useForm();
  const [billings, setBillings] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBilling, setEditingBilling] = useState(null);
  const { currentUser } = useAuth();

  const fetchBillings = async () => {
    const querySnapshot = await getDocs(collection(db, 'billings'));
    const billingsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const updatedBillingsList = await Promise.all(billingsList.map(async (billing) => {
      const appointmentDoc = await getDoc(doc(db, 'appointments', billing.appointmentId));
      return {
        ...billing,
        appointmentCustomId: appointmentDoc.data()?.appointmentId || 'Unknown',
        patientName: appointmentDoc.data()?.patient || 'Unknown',
      };
    }));
    setBillings(updatedBillingsList);
  };

  const fetchAppointments = async () => {
    const querySnapshot = await getDocs(collection(db, 'appointments'));
    const appointmentsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      appointmentId: doc.data().appointmentId,
      patient: doc.data().patient,
    }));
    setAppointments(appointmentsList);
  };

  useEffect(() => {
    fetchBillings();
    fetchAppointments();
  }, []);

  const handleAddOrUpdateBilling = async (values) => {
    try {
      const appointmentDoc = await getDoc(doc(db, 'appointments', values.appointmentId));
      const appointmentData = appointmentDoc.data();
      
      const billingData = {
        ...values,
        patientName: appointmentData.patient,
        invoiceId: editingBilling ? editingBilling.invoiceId : `INV-${Date.now()}`,
        invoiceDate: values.invoiceDate.toISOString(),
      };

      if (editingBilling) {
        const billingDoc = doc(db, 'billings', editingBilling.id);
        await updateDoc(billingDoc, billingData);
        notification.success({ message: 'Success', description: 'Billing updated successfully' });
      } else {
        await addDoc(collection(db, 'billings'), billingData);
        notification.success({ message: 'Success', description: 'Billing added successfully' });
      }
      fetchBillings();
      setIsModalVisible(false);
      setEditingBilling(null);
      form.resetFields();
    } catch (e) {
      console.error('Error adding/updating billing:', e);
      notification.error({ message: 'Error', description: 'There was an error saving the billing information' });
    }
  };

  const handleDeleteBilling = async (id) => {
    try {
      await deleteDoc(doc(db, 'billings', id));
      notification.success({ message: 'Success', description: 'Billing deleted successfully' });
      fetchBillings();
    } catch (e) {
      console.error('Error deleting billing:', e);
      notification.error({ message: 'Error', description: 'There was an error deleting the billing information' });
    }
  };

  const renderPaymentStatusTag = (status) => {
    if (status === 'Paid') {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Paid
        </Tag>
      );
    } else {
      return (
        <Tag icon={<CloseCircleOutlined />} color="error">
          Unpaid
        </Tag>
      );
    }
  };

  const columns = [
    {
      title: 'Invoice Number',
      dataIndex: 'invoiceId',
      key: 'invoiceId',
    },
    {
      title: 'Invoice Date',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      render: (text) => moment(text).format('DD-MM-YYYY'),
    },
    {
      title: 'Appointment',
      dataIndex: 'appointmentId',
      key: 'appointmentId',
      render: (text, record) => `ID: ${record.appointmentCustomId} - ${record.patientName}`,
    },
    { title: 'Service', dataIndex: 'serviceRendered', key: 'serviceRendered' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (text) => `${text} €` },
    { title: 'Insurance Coverage', dataIndex: 'insuranceCoverage', key: 'insuranceCoverage' },
    {
      title: 'Payment Status',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (text, record) => renderPaymentStatusTag(record.paymentStatus),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          {currentUser?.role === 'admin' && (
            <>
              <Button onClick={() => {
                setEditingBilling(record);
                form.setFieldsValue({
                  ...record,
                  invoiceDate: moment(record.invoiceDate),
                });
                setIsModalVisible(true);
              }}>Edit</Button>
              <Popconfirm
                title="Are you sure to delete this billing?"
                onConfirm={() => handleDeleteBilling(record.id)}
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
    <div className="billings-container">
      {currentUser?.role === 'admin' && (
        <Button type="primary" onClick={() => setIsModalVisible(true)}>Add Billing</Button>
      )}
      <Table
        dataSource={billings}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        style={{ marginTop: 20 }}
        className="billings-table"
      />
      <Modal
        title={editingBilling ? 'Edit Billing' : 'Add Billing'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingBilling(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleAddOrUpdateBilling}>
          <Form.Item label="Invoice ID">
            <Input value={editingBilling ? editingBilling.invoiceId : `INV-${Date.now()}`} disabled />
          </Form.Item>
          <Form.Item name="invoiceDate" label="Invoice Date" rules={[{ required: true, message: 'Please select the invoice date' }]}>
            <DatePicker format="DD-MM-YYYY" />
          </Form.Item>
          <Form.Item name="appointmentId" label="Appointment" rules={[{ required: true, message: 'Please select the appointment' }]}>
            <Select placeholder="Select an appointment">
              {appointments.map(appointment => (
                <Select.Option key={appointment.id} value={appointment.id}>
                  ID: {appointment.appointmentId} - {appointment.patient}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="serviceRendered" label="Service" rules={[{ required: true, message: 'Please select the service' }]}>
            <Select placeholder="Select a service">
              {services.map(service => (
                <Select.Option key={service} value={service}>
                  {service}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Please enter the amount' }]}>
            <Input addonAfter="€" />
          </Form.Item>
          <Form.Item name="insuranceCoverage" label="Insurance Coverage" rules={[{ required: true, message: 'Please select if the patient has insurance coverage' }]}>
            <Select placeholder="Please select if the patient has insurance coverage">
              <Select.Option value="Yes">Yes</Select.Option>
              <Select.Option value="No">No</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="paymentStatus" label="Payment Status" rules={[{ required: true, message: 'Please select the payment status' }]}>
            <Select placeholder="Select payment status">
              <Select.Option value="Paid">Paid</Select.Option>
              <Select.Option value="Unpaid">Unpaid</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingBilling ? 'Update' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Billing;
