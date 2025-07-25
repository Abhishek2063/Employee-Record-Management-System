import React, { useState } from 'react';
import { Modal, Table, Spinner, Alert, Badge, Card, Row, Col } from 'react-bootstrap';
import { Clock, Calendar } from 'lucide-react';
// import { timeAPI } from '../../services/api';

const TimeDetailsModal = ({ show, user, onHide }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
 

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


  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (duration) => {
    if (duration === null || duration === undefined) return '-';
    if (duration === 0) return '< 1 min';
    
    const hours = Math.floor(duration);
    const minutes = Math.round((duration - hours) * 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getSessionStatus = (punchOut, duration) => {
    if (!punchOut) return 'active';
    if (duration === 0) return 'short';
    return 'completed';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">Active</Badge>;
      case 'short':
        return <Badge bg="warning">Short Session</Badge>;
      case 'completed':
        return <Badge bg="primary">Completed</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <Clock className="me-2" size={24} />
          Time Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {user && (
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="d-flex align-items-center mb-2">
                    <Calendar className="me-2 text-muted" size={16} />
                    <strong>Date:</strong>
                    <span className="ms-2">{formatDate(user.date)}</span>
                  </div>
                </Col>
                <Col md={6}>
                  
                  <div className="d-flex align-items-center mb-2">
                    <Clock className="me-2 text-muted" size={16} />
                    <strong>Total Hours:</strong>
                    <Badge bg="info" className="ms-2 fs-6 px-3 py-2">
                      {user.total_hours ? formatDuration(user.total_hours) : '0h 0m'}
                    </Badge>
                  </div>
                </Col>
              </Row>
              
              {user.first_punch_in && (
                <Row className="mt-3">
                  <Col md={6}>
                    <div className="d-flex align-items-center">
                      <strong>First Punch In:</strong>
                      <Badge bg="success-subtle" text="success" className="ms-2">
                        {formatTime(user.first_punch_in)}
                      </Badge>
                    </div>
                  </Col>
                  <Col md={6}>
                    {user.last_punch_out && (
                      <div className="d-flex align-items-center">
                        <strong>Last Punch Out:</strong>
                        <Badge bg="danger-subtle" text="danger" className="ms-2">
                          {formatTime(user.last_punch_out)}
                        </Badge>
                      </div>
                    )}
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        )}

        <Card>
          <Card.Header>
            <h6 className="mb-0">Session Details</h6>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <div className="mt-3 text-muted">Loading session details...</div>
              </div>
            ) : error ? (
              <Alert variant="danger" className="mb-0 rounded-0">
                {error}
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table className="mb-0" hover>
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3">Session #</th>
                      <th className="px-4 py-3">Punch In</th>
                      <th className="px-4 py-3">Punch Out</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user?.sessions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5">
                          <div className="d-flex flex-column align-items-center">
                            <Clock size={48} className="text-muted mb-3" />
                            <h6 className="text-muted mb-2">No Session Details</h6>
                            <p className="text-muted mb-0">
                              No detailed session information available for this user.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      user?.sessions.map((detail, index) => {
                        const status = getSessionStatus(detail.punch_out, detail.duration);
                        return (
                          <tr key={detail.id || index} className="align-middle">
                            <td className="px-4 py-3">
                              <Badge bg="secondary" className="fs-6">
                                #{index + 1}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              {detail.punch_in ? (
                                <div>
                                  <Badge bg="success-subtle" text="success" className="px-3 py-2">
                                    {formatTime(detail.punch_in)}
                                  </Badge>
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {detail.punch_out ? (
                                <div>
                                  <Badge bg="danger-subtle" text="danger" className="px-3 py-2">
                                    {formatTime(detail.punch_out)}
                                  </Badge>
                                </div>
                              ) : (
                                <Badge bg="warning" className="px-3 py-2">
                                  Still Active
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {detail.duration !== null ? (
                                <Badge bg="info" className="px-3 py-2">
                                  {formatDuration(detail.duration)}
                                </Badge>
                              ) : (
                                <span className="text-muted">Calculating...</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {getStatusBadge(status)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
          
          {user?.sessions.length > 0 && (
            <Card.Footer className="bg-light">
              <small className="text-muted">
                Total Sessions: {user?.sessions.length} | 
                Active Sessions: {user?.sessions.filter(d => !d.punch_out).length} | 
                Completed Sessions: {user?.sessions.filter(d => d.punch_out).length}
              </small>
            </Card.Footer>
          )}
        </Card>
      </Modal.Body>
    </Modal>
  );
};

export default TimeDetailsModal;