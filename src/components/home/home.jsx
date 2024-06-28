// src/components/home/home.jsx
import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, List, Typography } from 'antd';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

const { Title, Text } = Typography;

const Home = () => {
  const [patientsCount, setPatientsCount] = useState(0);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const patientsSnapshot = await getDocs(collection(db, 'patients'));
      setPatientsCount(patientsSnapshot.size);

      const doctorsSnapshot = await getDocs(collection(db, 'doctors'));
      setDoctorsCount(doctorsSnapshot.size);

      const recentPatientsSnapshot = await getDocs(collection(db, 'patients'));
      setRecentPatients(recentPatientsSnapshot.docs.map(doc => doc.data()).slice(0, 5));

      const recentInvoicesSnapshot = await getDocs(collection(db, 'billings'));
      setRecentInvoices(recentInvoicesSnapshot.docs.map(doc => doc.data()).slice(0, 5));

      const recentAppointmentsSnapshot = await getDocs(collection(db, 'appointments'));
      setRecentAppointments(recentAppointmentsSnapshot.docs.map(doc => doc.data()).slice(0, 5));

      const recentPrescriptionsSnapshot = await getDocs(collection(db, 'prescriptions'));
      setRecentPrescriptions(recentPrescriptionsSnapshot.docs.map(doc => doc.data()).slice(0, 5));
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Welcome to the Hospital Management System</Title>
      <Text type="secondary">Here is a quick overview of the current status and recent activities.</Text>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Patients" value={patientsCount} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Total Doctors" value={doctorsCount} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Recent Invoices" value={recentInvoices.length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Recent Appointments" value={recentAppointments.length} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Recent Patients">
            <List
              dataSource={recentPatients}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta title={item.name} description={item.contactDetails} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Recent Invoices">
            <List
              dataSource={recentInvoices}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta title={`Invoice #${item.invoiceId}`} description={`Amount: €${item.amount}`} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Recent Appointments">
            <List
              dataSource={recentAppointments}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta title={`Appointment with ${item.doctor}`} description={`Date: ${item.date}`} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Recent Prescriptions">
            <List
              dataSource={recentPrescriptions}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta title={item.medication} description={`Dosage: ${item.dosage}`} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
