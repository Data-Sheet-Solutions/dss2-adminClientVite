import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from './layout/Navbar';
import Queue from './queue/Queue';
import WindowSwitcher from './layout/WindowSwitcher';
import ActiveRecordsTable from './tables/ActiveRecordsTable';
import PendingTable from './tables/PendingTable';
import WaitingTable from './tables/WaitingTable';
import NeedsReviewTable from './tables/NeedsReviewTable';
import ManufacturerTable from './tables/ManufacturerTable';
import ClientsTable from './tables/ClientsTable';
import Processor from './processor/Processor';
import { useGet } from '../hooks/useGet';
import keycloak from '../keycloak';
import { handleWebSocketUpdate } from '../websocket/handlers';
import { useUser } from '../context/UserContext';

function Home() {
  // Master collection of all pending records
  const [masterPendingData, setMasterPendingData] = useState([]);

  // Filtered buckets derived from master data
  const [pendingData, setPendingData] = useState({
    option1: [],
    option2: [],
    option3: [],
  });
  const [needsReviewData, setNeedsReviewData] = useState([]);
  const [queuedData, setQueuedData] = useState([]);
  const userId = useMemo(() => Cookies.get('userId') || null, []);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharedSearchTerm, setSharedSearchTerm] = useState('');
  const { getData } = useGet();
  const location = useLocation();
  const user = useUser();

  // Filter records into appropriate buckets
  const filterRecords = useCallback(
    (records) => {
      const queued = [];
      const nr = [];
      const p1 = [];
      const p2 = [];
      const p3 = [];

      if (!userId) {
        console.warn('No user ID available, skipping queue filtering');
        return {
          queued: [],
          nr: [],
          option1: [],
          option2: [],
          option3: [],
        };
      }

      records.forEach((record) => {
        // Check for queued records first
        if (record.fulfillment?.status === 'queued') {
          if (record.fulfillment.queuedBy === userId) {
            queued.push(record);
          } else {
            console.log(`User ${userId} is not the one who queued this record`, record);
          }
          return;
        }

        // Check for needs-review records
        if (record.docType === 'revTree') {
          nr.push(record);
          return;
        }

        // For non-queued records, sort into P1, P2, or P3 buckets
        if (record.status === 'inprocess' && !record.fileHash) {
          p1.push(record);
        } else if (record.status === 'inprocess' && record.fileHash) {
          p2.push(record);
        } else if (record.status === 'active' && record.fileHash) {
          p3.push(record);
        }
      });

      return {
        queued,
        nr,
        option1: p1,
        option2: p2,
        option3: p3,
      };
    },
    [userId]
  );

  // Update master data when receiving WebSocket updates
  const updateMasterPendingData = useCallback(
    (update) => {
      const { recordId, fulfillment } = update;
      console.log('updateMasterPendingData', update);

      setMasterPendingData((prevData) => {
        const newData = prevData.map((record) => (record._id === recordId ? { ...record, fulfillment } : record));
        const filtered = filterRecords(newData);
        setPendingData({
          option1: filtered.option1,
          option2: filtered.option2,
          option3: filtered.option3,
        });
        setNeedsReviewData(filtered.nr);
        setQueuedData(filtered.queued);
        return newData;
      });
    },
    [userId, filterRecords]
  );

  // WebSocket connection
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      const token = keycloak.token;
      if (!token) {
        console.error('No Keycloak token available');
        return;
      }

      const wsUrl = new URL(`${import.meta.env.VITE_API_URL.replace(/^http/, 'ws')}/ws-admin-updates`);
      wsUrl.searchParams.append('token', token);
      ws = new WebSocket(wsUrl.toString());

      ws.addEventListener('open', () => {
        console.log('WebSocket connection established');
      });

      ws.addEventListener('message', (event) => {
        try {
          const update = JSON.parse(event.data);
          console.log('WebSocket message received:', update);
          handleWebSocketUpdate(update, { updateMasterPendingData });
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });

      ws.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
      });

      ws.addEventListener('close', (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
        reconnectTimeout = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }, 5000);
      });
    };

    connectWebSocket();

    const tokenRefreshInterval = setInterval(async () => {
      try {
        const refreshed = await keycloak.updateToken(70);
        if (refreshed) {
          console.log('Token refreshed, reconnecting WebSocket');
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }, 60000);

    return () => {
      clearInterval(tokenRefreshInterval);
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // Fetch all pending data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      if (!userId) {
        return;
      }

      setIsLoading(true);
      try {
        const [pendingResponse, reviewResponse] = await Promise.all([getData('/fulfill/pending'), getData('/fulfill/needs-review')]);
        const pendingRecords = pendingResponse.records || [];
        const updatedPendingRecords = pendingRecords.map((record) => ({
          ...record,
          docType: 'record',
        }));
        const reviewRecords = reviewResponse.needsReview || [];
        const updatedReviewRecords = reviewRecords.map((record) => ({
          ...record,
          docType: 'revTree',
        }));
        // Combine both types of records
        const allRecords = [...updatedPendingRecords, ...updatedReviewRecords];
        setMasterPendingData(allRecords);
        console.log('Master pending data:', allRecords.length);
        const filtered = filterRecords(allRecords);
        console.log(
          'filter counts',
          filtered.queued.length,
          filtered.nr.length,
          filtered.option1.length,
          filtered.option2.length,
          filtered.option3.length
        );
        setPendingData({
          option1: filtered.option1,
          option2: filtered.option2,
          option3: filtered.option3,
        });
        setNeedsReviewData(filtered.nr);
        setQueuedData(filtered.queued);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [userId]);

  // Clear search when navigating away from pending or review routes
  useEffect(() => {
    const isPendingOrReview = location.pathname.includes('/pending') || location.pathname.includes('/review');
    if (!isPendingOrReview) {
      setSharedSearchTerm('');
    }
  }, [location.pathname]);

  const handleSearchUpdate = (value) => {
    setSharedSearchTerm(value);
  };

  return (
    <div className="d-flex flex-column vh-100">
      <Navbar />
      <div className="flex-grow-1 d-flex">
        <Queue items={queuedData} isLoading={isLoading} error={error} />
        <div className="flex-grow-1 p-4 d-flex flex-column" id="main-container">
          <Routes>
            {/* Full container routes */}
            <Route path="processor/:type/:id" element={<Processor />} />

            {/* Standard routes with WindowSwitcher */}
            <Route
              path="/*"
              element={
                <>
                  <WindowSwitcher />
                  <div className="flex-grow-1">
                    <Routes>
                      <Route index element={<Navigate to="pending/1" replace />} />
                      <Route
                        path="pending/*"
                        element={
                          <PendingTable
                            pendingData={pendingData}
                            isLoading={isLoading}
                            error={error}
                            searchString={sharedSearchTerm}
                            onUpdate={handleSearchUpdate}
                          />
                        }
                      />
                      <Route path="waiting" element={<WaitingTable />} />
                      <Route
                        path="review"
                        element={
                          <NeedsReviewTable
                            data={needsReviewData}
                            isLoading={isLoading}
                            error={error}
                            searchString={sharedSearchTerm}
                            onUpdate={handleSearchUpdate}
                          />
                        }
                      />
                      <Route path="active" element={<ActiveRecordsTable />} />
                      <Route path="manufacturers" element={<ManufacturerTable />} />
                      <Route path="clients" element={<ClientsTable />} />
                    </Routes>
                  </div>
                </>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Home;
