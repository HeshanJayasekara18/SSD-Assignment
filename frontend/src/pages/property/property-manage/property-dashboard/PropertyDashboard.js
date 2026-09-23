// PropertyDashboard.js
import React, { useState, useEffect } from 'react';
import { Home, Clock, CheckCircle2, CalendarCheck2 } from 'lucide-react';
import { Dialog, DialogContent } from '@mui/material';
import PropertyDashboardCharts from './PropertyDashboardCharts';
import './PropertyDashboard.css';

function PropertyDashboard() {
  const [loading, setLoading] = useState(true);
  const [openCharts, setOpenCharts] = useState(false);

  const bussinessType = localStorage.getItem("bussinessType");

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="t-loading">
        <p className="t-loading-text">Fetching your hotel data...</p>
      </div>
    );
  }

  const handleOpenCharts = () => {
    setOpenCharts(true);
  };

  const handleCloseCharts = () => {
    setOpenCharts(false);
  };

  return (
    <div className="t-dashboard">
      {/* Header */}
      <header className="t-dashboard-header">
      <h1 className="t-dashboard-title">{bussinessType=='Hotel'? 'Hotel':'Vehicle'} Manager Dashboard</h1>
        <p className="t-dashboard-subtitle">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </header>

      {/* Cards */}
      <section className="t-card-grid">
        <div className="t-card t-card-total" onClick={handleOpenCharts}>
          <div className="t-card-icon"><Home size={32} /></div>
          <div className="t-card-info">
            <h3>Total Properties</h3>
            <p>24</p>
          </div>
        </div>

        <div className="t-card t-card-pending" onClick={handleOpenCharts}>
          <div className="t-card-icon"><Clock size={32} /></div>
          <div className="t-card-info">
            <h3>Pending Approvals</h3>
            <p>5</p>
          </div>
        </div>

        <div className="t-card t-card-active" onClick={handleOpenCharts}>
          <div className="t-card-icon"><CheckCircle2 size={32} /></div>
          <div className="t-card-info">
            <h3>Active Properties</h3>
            <p>19</p>
          </div>
        </div>

        <div className="t-card t-card-bookings" onClick={handleOpenCharts}>
          <div className="t-card-icon"><CalendarCheck2 size={32} /></div>
          <div className="t-card-info">
            <h3>Bookings This Month</h3>
            <p>32</p>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="t-table-section">
        <h2 className="t-section-heading">Recent Properties</h2>
        <div className="t-table-wrapper">
          <table className="t-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ocean Breeze Resort</td>
                <td>Resort</td>
                <td><span className="t-badge t-badge-active">Active</span></td>
                <td>April 25, 2025</td>
                <td><button className="t-btn-view">View</button></td>
              </tr>
              <tr>
                <td>Hilltop Hotel</td>
                <td>Hotel</td>
                <td><span className="t-badge t-badge-pending">Pending</span></td>
                <td>April 24, 2025</td>
                <td><button className="t-btn-view">View</button></td>
              </tr>
              <tr>
                <td>Sunshine Apartments</td>
                <td>Apartment</td>
                <td><span className="t-badge t-badge-active">Active</span></td>
                <td>April 23, 2025</td>
                <td><button className="t-btn-view">View</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Chart Dialog */}
      <Dialog open={openCharts} onClose={handleCloseCharts} fullWidth maxWidth="md">
        <DialogContent>
          <PropertyDashboardCharts onClose={handleCloseCharts} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PropertyDashboard;
