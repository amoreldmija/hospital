import React, { useEffect, useState } from 'react';
import { Row, Col, Card, List, Typography, Tag } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { db } from '../../firebase';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthProvider';
import moment from 'moment';

const { Title, Text } = Typography;

const Home = () => {
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const recentInvoicesQuery = query(collection(db, 'billings'), where('patientName', '==', `${currentUser.firstName} ${currentUser.lastName}`));

      const recentAppointmentsQuery = query(collection(db, 'appointments'), where('patient', '==', `${currentUser.firstName} ${currentUser.lastName}`));

      const recentPrescriptionsQuery = query(collection(db, 'prescriptions'), where('patientName', '==', `${currentUser.firstName} ${currentUser.lastName}`));

      const recentInvoicesSnapshot = await getDocs(recentInvoicesQuery);
      setRecentInvoices(recentInvoicesSnapshot.docs.map(doc => doc.data()).slice(0, 5));

      const recentAppointmentsSnapshot = await getDocs(recentAppointmentsQuery);
      const appointmentsWithDoctorNames = await Promise.all(
        recentAppointmentsSnapshot.docs.map(async (appointmentDoc) => {
          const appointmentData = appointmentDoc.data();
          const doctorDoc = await getDoc(doc(db, 'doctors', appointmentData.doctor));
          const doctorData = doctorDoc.exists() ? doctorDoc.data() : { firstName: 'Unknown', lastName: 'Doctor' };
          return { ...appointmentData, doctorName: `${doctorData.firstName} ${doctorData.lastName}` };
        })
      );
      setRecentAppointments(appointmentsWithDoctorNames.slice(0, 5));

      const recentPrescriptionsSnapshot = await getDocs(recentPrescriptionsQuery);
      const prescriptionsWithDoctorNames = await Promise.all(
        recentPrescriptionsSnapshot.docs.map(async (prescriptionDoc) => {
          const prescriptionData = prescriptionDoc.data();
          let doctorName = 'Unknown Doctor';
          if (prescriptionData.doctorId) {
            const doctorDoc = await getDoc(doc(db, 'doctors', prescriptionData.doctorId));
            const doctorData = doctorDoc.exists() ? doctorDoc.data() : { firstName: 'Unknown', lastName: 'Doctor' };
            doctorName = `${doctorData.firstName} ${doctorData.lastName}`;
          }
          return { ...prescriptionData, doctorName };
        })
      );
      setRecentPrescriptions(prescriptionsWithDoctorNames.slice(0, 5));
    };

    fetchData();
  }, [currentUser]);

  const renderAdminContent = () => (
    <>
      {/* Admin-specific content */}
    </>
  );

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

  const renderPatientContent = () => (
    <>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Your Appointments">
            <List
              dataSource={recentAppointments}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={`Appointment with ${item.doctorName}`}
                    description={`Date: ${moment(item.date).format('YYYY-MM-DD HH:mm')}`}
                  />
                  {renderStatusTag(item.approved)}
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Your Invoices">
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
        <Col span={24}>
          <Card title="Your Prescriptions">
            <Row gutter={16}>
              {recentPrescriptions.map((item) => (
                <Col span={8} key={item.prescriptionNumber}>
                  <Card>
                    <List.Item.Meta
                      title={`Prescription Number: ${item.prescriptionNumber}`}
                      description={
                        <>
                          <div><strong>Medication:</strong> {item.medication}</div>
                          <div><strong>Date:</strong> {moment(item.prescriptionDate).format('YYYY-MM-DD')}</div>
                          <div><strong>Dosage:</strong> {item.dosage}</div>
                          <div><strong>Frequency:</strong> {item.frequency}</div>
                          <div><strong>Duration:</strong> {item.duration}</div>
                          <div><strong>Prescribed by:</strong> {item.doctorName}</div>
                        </>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  );

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Hi, {currentUser.firstName} {currentUser.lastName}</Title>
      <Text type="secondary">Welcome to the DocCRM</Text>
      {currentUser.role === 'admin' ? renderAdminContent() : renderPatientContent()}
    </div>
  );
};

export default Home;
