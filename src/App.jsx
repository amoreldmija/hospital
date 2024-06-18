// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Home from './components/home/home';
import Patients from './components/patients/patients';
import Doctors from './components/doctors/doctors';
import Billing from './components/billing/billing';
import Login from './components/auth/login';
import Signup from './components/auth/signup';
import CreateAdmin from './components/admin/CreateAdmin';
import { AuthProvider, useAuth } from './contexts/AuthProvider';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import SideMenu from './components/sidemenu';

const { Content } = Layout;

const AppLayout = () => {
  const { currentUser } = useAuth();

  return (
    <Layout>
      {currentUser && <SideMenu />}
      <Layout style={{ marginLeft: currentUser ? 200 : 0 }}>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patients"
                element={
                  <RoleBasedRoute requiredRoles={['doctor']}>
                    <Patients />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/doctors"
                element={
                  <RoleBasedRoute requiredRoles={['patient', 'doctor']}>
                    <Doctors />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/billing"
                element={
                  <RoleBasedRoute requiredRoles={['patient', 'doctor']}>
                    <Billing />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/create-admin"
                element={
                  <RoleBasedRoute requiredRoles={['admin']}>
                    <CreateAdmin />
                  </RoleBasedRoute>
                }
              />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
