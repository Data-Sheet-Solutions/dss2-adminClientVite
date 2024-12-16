import React from 'react';
import Navbar from './layout/Navbar';
import Queue from './queue/Queue';
import ActiveRecordsTable from './tables/ActiveRecordsTable';

function Home() {
  return (
    <div className="d-flex flex-column vh-100">
      <Navbar />
      <div className="flex-grow-1 d-flex">
        <Queue />
        <div className="flex-grow-1 p-4 d-flex flex-column">
          <h1 className="mb-4">DSS Administration Home</h1>
          <div className="flex-grow-1">
            <ActiveRecordsTable />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
