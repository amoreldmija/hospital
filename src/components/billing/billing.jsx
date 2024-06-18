// src/components/billing/Billing.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, notification } from 'antd';
import { getDocs, collection, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthProvider';

const { Option } = Select;

const Billing = () => {
  const [billingData, setBillingData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { currentUser } = useAuth();

  const fetchBillingData = async () => {
    const querySnapshot = await getDocs(collection(db, 'billing'));
    const data = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setBillingData(data);
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const handleAddBilling = async (values) => {
    try {
      await addDoc(collection(db, 'billing'), values);
      notification.success({ message: 'Billing added successfully' });
      fetchBillingData();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      notification.error({ message: 'Failed to add billing', description: error.message });
    }
  };

  const handleEditBilling = (record) => {
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteBilling = async (id) => {
    try {
      await deleteDoc(doc(db, 'billing', id));
      notification.success({ message: 'Billing deleted successfully' });
      fetchBillingData();
    } catch (error) {
      notification.error({ message: 'Failed to delete billing', description: error.message });
    }
  };

  const columns = [
    {
      title: 'Invoice No.',
      dataIndex: 'invoiceNo',
      key: 'invoiceNo',
    },
    {
      title: 'Patient Name',
      dataIndex: 'patientName',
      key: 'patientName',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Insurance',
      dataIndex: 'insurance',
      key: 'insurance',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <span>
          <Button onClick={() => handleEditBilling(record)}>Edit</Button>
          <Button onClick={() => handleDeleteBilling(record.id)} danger>
            Delete
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div>
      {currentUser?.role !== 'patient' && (
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Add Billing
        </Button>
      )}
      <Table columns={columns} dataSource={billingData} rowKey="id" />
      <Modal
        title="Add Billing"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddBilling}>
          <Form.Item
            name="invoiceNo"
            label="Invoice No."
            rules={[{ required: true, message: 'Please input the invoice number!' }]}
          >
            <Input disabled placeholder={`Invoice ${billingData.length + 1}`} />
          </Form.Item>
          <Form.Item
            name="patientName"
            label="Patient Name"
            rules={[{ required: true, message: 'Please select a patient!' }]}
          >
            <Select placeholder="Select a patient">
              {/* Populate with actual patient names */}
              <Option value="patient1">Patient 1</Option>
              <Option value="patient2">Patient 2</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please input the amount!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select a date!' }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="insurance"
            label="Insurance"
            rules={[{ required: true, message: 'Please input the insurance!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Billing;
