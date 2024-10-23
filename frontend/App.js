import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import React from 'react';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import * as XLSX from 'xlsx';
import CampaignForm from './Components/CampaignForm';
import CampaignsToday from './Components/CampaignsToday';

function App() {
  const downloadCSV = async () => {
    try {
      const response = await fetch('http://localhost:5001/campaigns');
      const data = await response.json();

      const csv = Papa.unparse(data);

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, 'database.csv');
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  const downloadExcel = async () => {
    try {
      const response = await fetch('http://localhost:5001/campaigns');
      const data = await response.json();

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'database.xlsx');
    } catch (error) {
      console.error('Error downloading Excel:', error);
    }
  };

  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/create-campaign">Create Campaign</Link>
            </li>
            <li>
              <Link to="/campaigns-today">Campaigns Today</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/create-campaign" element={<CampaignForm />} />
          <Route path="/campaigns-today" element={<CampaignsToday />} />
          <Route
            path="/"
            element={
              <div>
                <h1>Home Page</h1>
                <button onClick={downloadCSV}>Download Database as CSV</button>
                <button onClick={downloadExcel}>Download Database as Excel</button>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;