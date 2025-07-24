import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import Header from "../common/Header";
import TimeTable from "./TimeTable";
import { attendanceAPI, authAPI } from "../../services/api";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshTable, setRefreshTable] = useState(0);
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  const handlePunchIn = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await attendanceAPI.punchIn();
      setSuccess("Successfully punched in!");
      const userDataResponse = await authAPI.getProfile();

      localStorage.setItem(
        "userData",
        JSON.stringify(userDataResponse?.data || {})
      );
      setRefreshTable((prev) => prev + 1);
    } catch (error) {
      setError(error.message || "Failed to punch in");
    } finally {
      setLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await attendanceAPI.punchOut();
      setSuccess("Successfully punched out!");
      const userDataResponse = await authAPI.getProfile();

      localStorage.setItem(
        "userData",
        JSON.stringify(userDataResponse?.data || {})
      );
      setRefreshTable((prev) => prev + 1);
    } catch (error) {
      setError(error.message || "Failed to punch out");
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  return (
    <>
      <Header />
      <Container className="py-4">
        {/* Status and Punch Buttons */}
        <Row className="mb-4">
          <Col>
            <Card className="punch-buttons">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={6}></Col>
                  <Col md={6} className="text-md-end">
                    <div className="d-grid gap-2 d-md-block">
                      {userData?.today_attendance?.next_action ===
                      "punch_in" ? (
                        <Button
                          className="btn-punch-in me-md-2"
                          onClick={handlePunchIn}
                          size="lg"
                        >
                          {loading ? (
                            <Spinner size="sm" className="me-2" />
                          ) : null}
                          Punch In
                        </Button>
                      ) : (
                        <Button
                          className="btn-punch-out"
                          onClick={handlePunchOut}
                          size="lg"
                        >
                          {loading ? (
                            <Spinner size="sm" className="me-2" />
                          ) : null}
                          Punch Out
                        </Button>
                      )}
                    </div>
                  </Col>
                </Row>

                {/* Success/Error Messages */}
                {error && (
                  <Alert
                    variant="danger"
                    className="mt-3"
                    dismissible
                    onClose={clearMessages}
                  >
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert
                    variant="success"
                    className="mt-3"
                    dismissible
                    onClose={clearMessages}
                  >
                    {success}
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Time Records Table */}
        <Row>
          <Col>
            <Card className="time-table-container">
              <Card.Body>
                <h5 className="mb-4">Time Records</h5>
                <TimeTable refreshTrigger={refreshTable} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Dashboard;
