import React from "react";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import { authAPI } from "../../services/api";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      navigate("/login");
    }
  };

  const handleUserManagement = () => {
    navigate("/user-management");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="dashboard-header">
      <Container>
        <Navbar expand="lg">
          <Navbar.Brand>
            <h4 className="mb-0">
              {process.env.REACT_APP_APP_NAME || "Time Tracking System"}
            </h4>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="ms-auto align-items-center">
              <Nav.Item className="me-3">
                <Button
                  variant={
                    location.pathname === "/dashboard"
                      ? "primary"
                      : "outline-primary"
                  }
                  onClick={handleDashboard}
                >
                  Dashboard
                </Button>
              </Nav.Item>
              {userData.role === "super_admin" && (
                <Nav.Item className="me-3">
                  <Button
                    variant={
                      location.pathname === "/user-management"
                        ? "primary"
                        : "outline-primary"
                    }
                    onClick={handleUserManagement}
                  >
                    User Management
                  </Button>
                </Nav.Item>
              )}
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
