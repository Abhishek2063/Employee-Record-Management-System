import React, { useState, useEffect } from 'react';
import { Modal, Table, Spinner, Alert, Badge } from 'react-bootstrap';
import { timeAPI } from '../../services/api';

const TimeDetailsModal = ({ show, user, onHide }) => {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show && user) {
      fetchUserDetails();
    }
  }, [show, user]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await timeAPI.getUserTimeDetails(user.id);
      setDetails(response.details || []);
    } catch (error) {
      setError(error.message || 'Failed to fetch user details');
      // Set mock data for demonstration
      setDetails([
        {
          id: 1,
          date: '2024-01-15',
          punchIn: '09:00:00',
          punchOut: '17:30:00',
          duration: '8h 30m',
          status: 'completed'
        },
        {
          id: 2,
          date: '2024-01-14',
          punchIn: '09:15:00',
          punchOut: '17:00:00',
          duration: '7h 45m',
          status: 'completed'
        },
        {
          id: 3,
          date: '2024-01-13',
          punchIn: '09:00:00',
          punchOut: null,
          duration: null,
          status: 'incomplete'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(`2024-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Time Details - {user?.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {user && (
          <div className="mb-3">
            <p className="mb-1"><strong>Employee:</strong> {user.name}</p>
            <p className="mb-1"><strong>Email:</strong> {user.email}</p>
            <p className="mb-3"><strong>Total Time:</strong> 
              <Badge bg="info" className="ms-2">
                {user.totalTime || '0h 0m'}
              </Badge>
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <div className="mt-2">Loading details...</div>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover size="sm">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Punch In</th>
                  <th>Punch Out</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {details.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-3">
                      No time details found
                    </td>
                  </tr>
                ) : (
                  details.map((detail) => (
                    <tr key={detail.id}>
                      <td>{formatDate(detail.date)}</td>
                      <td>
                        {detail.punchIn ? (
                          <span className="text-success">
                            {formatTime(detail.punchIn)}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {detail.punchOut ? (
                          <span className="text-danger">
                            {formatTime(detail.punchOut)}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {detail.duration ? (
                          <Badge bg="secondary">{detail.duration}</Badge>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <Badge 
                          bg={detail.status === 'completed' ? 'success' : 'warning'}
                        >
                          {detail.status === 'completed' ? 'Completed' : 'Incomplete'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default TimeDetailsModal;