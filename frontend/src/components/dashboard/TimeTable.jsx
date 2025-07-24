import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert } from 'react-bootstrap';
import TimeDetailsModal from './TimeDetailsModal';
import { timeAPI } from '../../services/api';

const TimeTable = ({ refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTimeRecords();
  }, [refreshTrigger]);

  const fetchTimeRecords = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await timeAPI.getTimeRecords();
      setRecords(response.records || []);
    } catch (error) {
      setError(error.message || 'Failed to fetch time records');
      // Set mock data for demonstration
      setRecords([
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          totalTime: '8h 30m',
          status: 'active'
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          totalTime: '7h 45m',
          status: 'inactive'
        }
      ]);
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

  const formatTotalTime = (minutes) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <div className="mt-2">Loading time records...</div>
      </div>
    );
  }

  if (error && records.length === 0) {
    return (
      <Alert variant="danger">
        {error}
        <div className="mt-2">
          <Button variant="outline-danger" size="sm" onClick={fetchTimeRecords}>
            Try Again
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <>
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Total Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No time records found
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id}>
                  <td>
                    <strong>{record.name}</strong>
                  </td>
                  <td>{record.email}</td>
                  <td>
                    <span className="badge bg-info">
                      {typeof record.totalTime === 'number' 
                        ? formatTotalTime(record.totalTime)
                        : record.totalTime || '0h 0m'
                      }
                    </span>
                  </td>
                  <td>
                    <span 
                      className={`badge ${
                        record.status === 'active' || record.isPunchedIn
                          ? 'bg-success' 
                          : 'bg-secondary'
                      }`}
                    >
                      {record.status === 'active' || record.isPunchedIn ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleViewDetails(record)}
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

      <TimeDetailsModal
        show={showModal}
        user={selectedUser}
        onHide={handleCloseModal}
      />
    </>
  );
};

export default TimeTable;
