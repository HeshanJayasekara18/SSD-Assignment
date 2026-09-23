import React, { useState, useEffect } from 'react';
import { Users, Building, Map, DollarSign, Calendar, Clock } from 'lucide-react';
import './Dashboard.css';

const SimpleDashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Travel Platform Dashboard</h1>
        <p className="dashboard-date">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-green">
          <div className="stat-icon-container">
            <div className="stat-icon stat-icon-green">
              <Users size={24} className="icon-color-green" />
            </div>
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Active Users</h3>
            <p className="stat-value">12k</p>
          </div>
        </div>

        <div className="stat-card stat-card-red">
          <div className="stat-icon-container">
            <div className="stat-icon stat-icon-red">
              <Building size={24} className="icon-color-red" />
            </div>
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Hotels</h3>
            <p className="stat-value">150</p>
          </div>
        </div>

        <div className="stat-card stat-card-blue">
          <div className="stat-icon-container">
            <div className="stat-icon stat-icon-blue">
              <Map size={24} className="icon-color-blue" />
            </div>
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Tours</h3>
            <p className="stat-value">100</p>
          </div>
        </div>

        <div className="stat-card stat-card-purple">
          <div className="stat-icon-container">
            <div className="stat-icon stat-icon-purple">
              <DollarSign size={24} className="icon-color-purple" />
            </div>
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Earnings</h3>
            <p className="stat-value">650k</p>
          </div>
        </div>
      </div>

      {/* Additional Stat Row */}
      <div className="stats-grid-secondary">
        <div className="stat-card stat-card-indigo">
          <div className="stat-icon-container">
            <div className="stat-icon stat-icon-indigo">
              <Calendar size={24} className="icon-color-indigo" />
            </div>
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Upcoming Events</h3>
            <p className="stat-value">8</p>
            <p className="stat-change stat-change-indigo">Next event in 2 days</p>
          </div>
        </div>

        <div className="stat-card stat-card-amber">
          <div className="stat-icon-container">
            <div className="stat-icon stat-icon-amber">
              <Clock size={24} className="icon-color-amber" />
            </div>
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Pending Bookings</h3>
            <p className="stat-value">23</p>
            <p className="stat-change stat-change-amber">5 require immediate action</p>
          </div>
        </div>

        <div className="stat-card stat-card-emerald">
          <div className="stat-icon-container">
            <div className="stat-icon stat-icon-emerald">
              <Users size={24} className="icon-color-emerald" />
            </div>
          </div>
          <div className="stat-content">
            <h3 className="stat-label">New Users Today</h3>
            <p className="stat-value">42</p>
          </div>
        </div>
      </div>

      {/* Business Agents Section */}
      <div className="section-card">
        <h2 className="section-title">Business Agents</h2>

        <div className="agents-list">
          <div className="agent-item">
            <div className="agent-status agent-status-active"></div>
            <div className="agent-avatar">
              <span className="agent-initials">AR</span>
            </div>
            <div className="agent-info">
              <h3 className="agent-name">Araliya Groups</h3>
              <p className="agent-type">Hotel and Restaurant</p>
            </div>
            <div className="agent-badge">Premium</div>
          </div>

          <div className="agent-item">
            <div className="agent-status agent-status-active"></div>
            <div className="agent-avatar">
              <span className="agent-initials">JH</span>
            </div>
            <div className="agent-info">
              <h3 className="agent-name">Jetwing Hotels</h3>
              <p className="agent-type">Hotel and Restaurant</p>
            </div>
            <div className="agent-badge">Premium</div>
          </div>

          <div className="agent-item">
            <div className="agent-status agent-status-active"></div>
            <div className="agent-avatar">
              <span className="agent-initials">CN</span>
            </div>
            <div className="agent-info">
              <h3 className="agent-name">Cinnomon</h3>
              <p className="agent-type">Hotel and Restaurant</p>
            </div>
          </div>

          <div className="agent-item">
            <div className="agent-status agent-status-active"></div>
            <div className="agent-avatar">
              <span className="agent-initials">RB</span>
            </div>
            <div className="agent-info">
              <h3 className="agent-name">RentBike</h3>
              <p className="agent-type">Rent and Taxi Services</p>
            </div>
          </div>

          <div className="agent-item">
            <div className="agent-status agent-status-active"></div>
            <div className="agent-avatar">
              <span className="agent-initials">AT</span>
            </div>
            <div className="agent-info">
              <h3 className="agent-name">Ampersand Travel</h3>
              <p className="agent-type">Rent and Taxi Services</p>
            </div>
          </div>
        </div>

        <div className="button-container">
          <button className="button button-blue">
            View All Partners
          </button>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="section-card">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <button className="button button-indigo">
            Add New Partner
          </button>
          <button className="button button-green">
            View Booking Requests
          </button>
          <button className="button button-amber">
            Generate Monthly Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;