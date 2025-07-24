import React from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { authAPI } from '../../services/api';

const Header = () => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
  };

  return (
    <div className="dashboard-header">
      <Container>
        <Navbar expand="lg">
          <Navbar.Brand>
            <h4 className="mb-0">{process.env.REACT_APP_APP_NAME || 'Time Tracking System'}</h4>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="ms-auto align-items-center">
              <Nav.Item className="me-3">
                <span className="text-muted">Welcome, </span>
                <strong>{userData.name || userData.email}</strong>
              </Nav.Item>
              <Nav.Item>
                <Button variant="outline-danger" onClick={handleLogout}>
                  Logout
                </Button>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </Container>
    </div>
  );
};

export default Header;
