import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import Header from '../common/Header';
import TimeTable from './TimeTable';
import { timeAPI } from '../../services/api';

const Dashboard = () => {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshTable, setRefreshTable] = useState(0);

  useEffect(() => {
    fetchCurrentStatus();
  }, []);

  const fetchCurrentStatus = async () => {
    try {
      const response = await timeAPI.getCurrentStatus();
      setCurrentStatus(response);
    } catch (error) {
      console.error('Failed to fetch current status:', error);
      // Set default status if API fails
      setCurrentStatus({ isPunchedIn: false, lastPunchTime: null });
    }
  };

  const handlePunchIn = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await timeAPI.punchIn();
      setSuccess('Successfully punched in!');
      await fetchCurrentStatus();
      setRefreshTable(prev => prev + 1);
    } catch (error) {
      setError(error.message || 'Failed to punch in');
    } finally {
      setLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await timeAPI.punchOut();
      setSuccess('Successfully punched out!');
      await fetchCurrentStatus();
      setRefreshTable(prev => prev + 1);
    } catch (error) {
      setError(error.message || 'Failed to punch out');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
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
                  <Col md={6}>
                    <h5 className="mb-3">Current Status</h5>
                    {currentStatus && (
                      <div className="mb-3">
                        <Badge 
                          className={`status-badge ${
                            currentStatus.isPunchedIn ? 'status-active' : 'status-inactive'
                          }`}
                        >
                          {currentStatus.isPunchedIn ? 'Punched In' : 'Punched Out'}
                        </Badge>
                        {currentStatus.lastPunchTime && (
                          <div className="mt-2 text-muted">
                            Last action: {new Date(currentStatus.lastPunchTime).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </Col>
                  <Col md={6} className="text-md-end">
                    <div className="d-grid gap-2 d-md-block">
                      <Button
                        className="btn-punch-in me-md-2"
                        onClick={handlePunchIn}
                        disabled={loading || (currentStatus?.isPunchedIn)}
                        size="lg"
                      >
                        {loading ? (
                          <Spinner size="sm" className="me-2" />
                        ) : null}
                        Punch In
                      </Button>
                      <Button
                        className="btn-punch-out"
                        onClick={handlePunchOut}
                        disabled={loading || !(currentStatus?.isPunchedIn)}
                        size="lg"
                      >
                        {loading ? (
                          <Spinner size="sm" className="me-2" />
                        ) : null}
                        Punch Out
                      </Button>
                    </div>
                  </Col>
                </Row>

                {/* Success/Error Messages */}
                {error && (
                  <Alert variant="danger" className="mt-3" dismissible onClose={clearMessages}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert variant="success" className="mt-3" dismissible onClose={clearMessages}>
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
