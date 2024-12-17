import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './layout/Navbar';
import Queue from './queue/Queue';
import WindowSwitcher from './layout/WindowSwitcher';
import ActiveRecordsTable from './tables/ActiveRecordsTable';
import PendingTable from './tables/PendingTable';
import WaitingTable from './tables/WaitingTable';
import NeedsReviewTable from './tables/NeedsReviewTable';
import ManufacturerTable from './tables/ManufacturerTable';
import ClientsTable from './tables/ClientsTable';
import { useGet } from '../hooks/useGet';

function Home() {
  // Centralized state for table data
  const [pendingData, setPendingData] = useState({
    option1: [],
    option2: [],
    option3: [],
  });
  const [needsReviewData, setNeedsReviewData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharedSearchTerm, setSharedSearchTerm] = useState('');
  const { getData } = useGet();
  const location = useLocation();

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [option1Data, option2Data, option3Data, reviewData] = await Promise.all([
          getData('/fulfill/pending/1'),
          getData('/fulfill/pending/2'),
          getData('/fulfill/pending/3'),
          getData('/fulfill/needs-review'),
        ]);

        setPendingData({
          option1: option1Data.records || [],
          option2: option2Data.records || [],
          option3: option3Data.records || [],
        });

        // Handle needs-review data structure
        setNeedsReviewData(reviewData.needsReview || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

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
        <Queue />
        <div className="flex-grow-1 p-4 d-flex flex-column" id="main-container">
          <WindowSwitcher />
          <div className="flex-grow-1">
            <Routes>
              <Route index element={<Navigate to="active" replace />} />
              <Route path="active" element={<ActiveRecordsTable />} />
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
              <Route path="manufacturers" element={<ManufacturerTable />} />
              <Route path="clients" element={<ClientsTable />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
