import React from 'react';
import { Layout, Menu, Button, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const { Sider } = Layout;
const { Text } = Typography;

const SideMenu = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    {
      key: '1',
      label: <Link to="/">Home</Link>,
    },
    currentUser && (currentUser.role === 'doctor' || currentUser.role === 'admin') && {
      key: '2',
      label: <Link to="/patients">Patients</Link>,
    },
    currentUser && {
      key: '3',
      label: <Link to="/doctors">Doctors</Link>,
    },
    currentUser && {
      key: '4',
      label: <Link to="/appointments">Appointments</Link>,
    },
    currentUser && {
      key: '5',
      label: <Link to="/prescriptions">Prescriptions</Link>,
    },
    currentUser && currentUser.role !== 'patient' && {
      key: '6',
      label: <Link to="/billing">Billing</Link>,
    },
    currentUser && currentUser.role === 'admin' && {
      key: '7',
      label: <Link to="/user-management">Users</Link>,
    },
    {
      key: '8',
      label: (
        <Button type="link" onClick={handleLogout} style={{ color: 'inherit', padding: 0 }}>
          Logout
        </Button>
      ),
    },
  ].filter(Boolean); // Removes undefined items

  return (
    <Sider style={{ height: '100vh', position: 'fixed', left: 0 }}>
      <div className="logo" style={{ height: '32px', background: 'rgba(255, 255, 255, 0.2)', margin: '16px' }} />
      <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} items={menuItems} />
      <div style={{ padding: '16px', color: '#fff' }}>
        <Text>Role: {currentUser?.role}</Text>
      </div>
    </Sider>
  );
};

export default SideMenu;
