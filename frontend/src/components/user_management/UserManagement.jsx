import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import { 
  Container, 
  Row, 
  Col, 
  Table, 
  Card, 
  Form, 
  Button, 
  Badge, 
  Spinner, 
  Alert,
  Collapse,
  ButtonGroup
} from 'react-bootstrap';
import { attendanceAPI } from '../../services/api';

const UserManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set());

  const fetchTimeRecords = async () => {
    setLoading(true);
    setError("");
    
    try {
      const date = new Date(selectedDate);
      const params = {
        selected_date: date,
      };
      
      const response = await attendanceAPI.getAllAttendance(params);
      setRecords(response.data || []);
    } catch (error) {
      setError(error.message || "Failed to fetch time records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeRecords();
  }, [selectedDate]);

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    // Ensure the date string is treated as UTC
    const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (duration) => {
    if (!duration) return '-';
    const hours = Math.floor(duration);
    const minutes = Math.round((duration - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleRowExpansion = (userId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(userId)) {
      newExpandedRows.delete(userId);
    } else {
      newExpandedRows.add(userId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getStatusBadge = (record) => {
    if (!record.first_punch_in) {
      return <Badge bg="secondary">Absent</Badge>;
    }
    
    const hasActiveSessions = record.sessions.some(session => !session.punch_out);
    if (hasActiveSessions) {
      return <Badge bg="success">Active</Badge>;
    }
    
    if (record.last_punch_out) {
      return <Badge bg="info">Completed</Badge>;
    }
    
    return <Badge bg="warning">Incomplete</Badge>;
  };

  const getTotalWorkingTime = () => {
    const totalHours = records.reduce((sum, record) => {
      return sum + (record.total_duration || 0);
    }, 0);
    return formatDuration(totalHours);
  };

  const getPresentCount = () => {
    return records.filter(record => record.first_punch_in).length;
  };

  const getAbsentCount = () => {
    return records.filter(record => !record.first_punch_in).length;
  };

  return (
    <>
      <Header />
      <Container className="py-4">
        {/* Header Section */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={6}>
                    <h4 className="mb-0 text-primary">Attendance Management</h4>
                    <p className="text-muted mb-0">Track and manage employee attendance</p>
                  </Col>
                  <Col md={6}>
                    <Row className="align-items-center">
                      <Col md={8}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Select Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Button 
                          variant="outline-primary" 
                          onClick={fetchTimeRecords}
                          disabled={loading}
                          className="w-100 mt-4"
                        >
                          {loading ? <Spinner size="sm" /> : 'Refresh'}
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="display-6 text-success mb-2">{getPresentCount()}</div>
                <h6 className="text-muted mb-0">Present Today</h6>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="display-6 text-danger mb-2">{getAbsentCount()}</div>
                <h6 className="text-muted mb-0">Absent Today</h6>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="display-6 text-info mb-2">{records.length}</div>
                <h6 className="text-muted mb-0">Total Employees</h6>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="display-6 text-primary mb-2">{getTotalWorkingTime()}</div>
                <h6 className="text-muted mb-0">Total Hours</h6>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Date Display */}
        <Row className="mb-3">
          <Col>
            <Card className="border-0 bg-light">
              <Card.Body className="py-2">
                <h6 className="mb-0 text-center">
                  Attendance for <span className="text-primary">{formatDate(selectedDate)}</span>
                </h6>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Error Display */}
        {error && (
          <Row className="mb-3">
            <Col>
              <Alert variant="danger" dismissible onClose={() => setError("")}>
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Main Table */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">Employee Attendance Details</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-2 text-muted">Loading attendance data...</p>
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-5">
                    <h6 className="text-muted">No attendance records found for selected date</h6>
                  </div>
                ) : (
                  <Table responsive hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0">Employee</th>
                        <th className="border-0">Status</th>
                        <th className="border-0">First Punch In</th>
                        <th className="border-0">Last Punch Out</th>
                        <th className="border-0">Total Duration</th>
                        <th className="border-0">Sessions</th>
                        <th className="border-0">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <React.Fragment key={record.user_id}>
                          <tr>
                            <td className="align-middle">
                              <div>
                                <div className="fw-semibold">{record.name}</div>
                                <small className="text-muted">{record.email}</small>
                              </div>
                            </td>
                            <td className="align-middle">
                              {getStatusBadge(record)}
                            </td>
                            <td className="align-middle">
                              {formatTime(record.first_punch_in)}
                            </td>
                            <td className="align-middle">
                              {formatTime(record.last_punch_out)}
                            </td>
                            <td className="align-middle">
                              <span className="fw-semibold text-primary">
                                {formatDuration(record.total_duration)}
                              </span>
                            </td>
                            <td className="align-middle">
                              <Badge bg="secondary">{record.sessions.length} sessions</Badge>
                            </td>
                            <td className="align-middle">
                              <ButtonGroup size="sm">
                                <Button
                                  variant="outline-primary"
                                  onClick={() => toggleRowExpansion(record.user_id)}
                                  disabled={record.sessions.length === 0}
                                >
                                  {expandedRows.has(record.user_id) ? 'Hide' : 'View'} Details
                                </Button>
                              </ButtonGroup>
                            </td>
                          </tr>
                          
                          {/* Expandable Session Details */}
                          <tr>
                            <td colSpan="7" className="p-0 border-0">
                              <Collapse in={expandedRows.has(record.user_id)}>
                                <div>
                                  <Card className="border-0 border-top rounded-0">
                                    <Card.Body className="bg-light">
                                      <h6 className="mb-3">Session Details for {record.name}</h6>
                                      {record.sessions.length === 0 ? (
                                        <p className="text-muted mb-0">No sessions recorded for this date.</p>
                                      ) : (
                                        <Table size="sm" className="mb-0">
                                          <thead>
                                            <tr>
                                              <th>Session #</th>
                                              <th>Punch In</th>
                                              <th>Punch Out</th>
                                              <th>Duration</th>
                                              <th>Status</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {record.sessions.map((session, index) => (
                                              <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{formatTime(session.punch_in)}</td>
                                                <td>{formatTime(session.punch_out)}</td>
                                                <td>{formatDuration(session.duration)}</td>
                                                <td>
                                                  {session.punch_out ? (
                                                    <Badge bg="success">Completed</Badge>
                                                  ) : (
                                                    <Badge bg="warning">Active</Badge>
                                                  )}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </Table>
                                      )}
                                    </Card.Body>
                                  </Card>
                                </div>
                              </Collapse>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default UserManagement;