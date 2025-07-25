import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Alert, Card, Row, Col, Form } from "react-bootstrap";
import { Calendar, Clock } from "lucide-react";
import TimeDetailsModal from "./TimeDetailsModal";
import { attendanceAPI } from "../../services/api";

const TimeTable = ({ refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTimeRecords();
  }, []);

  useEffect(() => {
    fetchTimeRecords();
  }, [refreshTrigger, selectedDate]);

  const fetchTimeRecords = async () => {
    setLoading(true);
    setError("");
    
    try {
      const date = new Date(selectedDate);
      const params = {
        date: date.getDate(),
        month: date.getMonth() + 1, // JavaScript months are 0-indexed
        year: date.getFullYear()
      };
      
      const response = await attendanceAPI.getMyAttendance(params);
      setRecords(response.data || []);
    } catch (error) {
      setError(error.message || "Failed to fetch time records");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const formatTotalHours = (hours) => {
    if (!hours || hours === 0) return "0h 0m";
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

const formatTime = (timeString) => {
  if (!timeString) return "-";
  // Parse as UTC and convert to local time
  const date = new Date(timeString + "Z");
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};


  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <Card.Body>
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <div className="mt-3 text-muted">Loading time records...</div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">
                <Clock className="me-2" size={20} />
                Time Records
              </h5>
            </Col>
            <Col xs="auto">
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="form-control-sm"
                style={{ minWidth: '150px' }}
              />
            </Col>
          </Row>
        </Card.Header>
        
        <Card.Body className="p-0">
          {error && records.length === 0 && (
            <Alert variant="danger" className="mb-0 rounded-0">
              <div className="d-flex justify-content-between align-items-center">
                <span>{error}</span>
                <Button variant="outline-danger" size="sm" onClick={fetchTimeRecords}>
                  Try Again
                </Button>
              </div>
            </Alert>
          )}

          <div className="table-responsive">
            <Table className="mb-0" hover>
              <thead className="table-dark">
                <tr>
                  <th className="px-4 py-3">First Punch In</th>
                  <th className="px-4 py-3">Last Punch Out</th>
                  <th className="px-4 py-3">Total Hours</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="d-flex flex-column align-items-center">
                        <Calendar size={48} className="text-muted mb-3" />
                        <h6 className="text-muted mb-2">No Records Found</h6>
                        <p className="text-muted mb-3">
                          No time records available for {new Date(selectedDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          onClick={fetchTimeRecords}
                        >
                          Refresh Data
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((record, index) => (
                    <tr key={record.id || index} className="align-middle">
                      <td className="px-4 py-3">
                        {record.first_punch_in ? (
                          <div>
                            <span className="badge bg-success-subtle text-success">
                              {formatTime(record.first_punch_in)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {record.last_punch_out ? (
                          <div>
                            <span className="badge bg-danger-subtle text-danger">
                              {formatTime(record.last_punch_out)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge bg-info fs-6 px-3 py-2">
                          {formatTotalHours(record.total_hours)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`badge fs-6 px-3 py-2 ${
                            record.status === "active" || record.isPunchedIn
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {record.status === "active" || record.isPunchedIn ? (
                            <>
                              <span className="me-1">●</span>
                              Active
                            </>
                          ) : (
                            "Inactive"
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewDetails(record)}
                          className="px-3"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
        
        {records.length > 0 && (
          <Card.Footer className="bg-light text-muted">
            <small>
              Showing {records.length} record{records.length !== 1 ? 's' : ''} for{' '}
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </small>
          </Card.Footer>
        )}
      </Card>

      <TimeDetailsModal
        show={showModal}
        user={selectedUser}
        onHide={handleCloseModal}
      />
    </>
  );
};

export default TimeTable;