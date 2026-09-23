import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminUserManagement.css';
import { FaTrash, FaSearch, FaUser, FaMapMarkedAlt, FaUserTie } from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState({
    tourGuides: [],
    tourists: []
  });
  const [loading, setLoading] = useState({
    tourGuides: true,
    tourists: true
  });
  const [error, setError] = useState({
    tourGuides: '',
    tourists: ''
  });
  const [activeTab, setActiveTab] = useState('tourGuides');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({ type: null, id: null });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Fetch all users on component mount
  useEffect(() => {
    fetchTourGuides();
    fetchTourists();
  }, []);

  // Function to fetch all tour guides
  const fetchTourGuides = async () => {
    setLoading(prev => ({ ...prev, tourGuides: true }));
    try {
      const response = await axios.get('http://localhost:4000/api/TourGuide/all');
      setUsers(prev => ({ ...prev, tourGuides: response.data.data }));
      setError(prev => ({ ...prev, tourGuides: '' }));
    } catch (err) {
      console.error('Error fetching tour guides:', err);
      setError(prev => ({ 
        ...prev, 
        tourGuides: 'Failed to load tour guides. Please try again later.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, tourGuides: false }));
    }
  };

  // Function to fetch all tourists
  const fetchTourists = async () => {
    setLoading(prev => ({ ...prev, tourists: true }));
    try {
      const response = await axios.get('http://localhost:4000/api/TouristRegister/all');
      setUsers(prev => ({ ...prev, tourists: response.data.data }));
      setError(prev => ({ ...prev, tourists: '' }));
    } catch (err) {
      console.error('Error fetching tourists:', err);
      setError(prev => ({ 
        ...prev, 
        tourists: 'Failed to load tourists. Please try again later.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, tourists: false }));
    }
  };

  // Function to handle delete user
  const handleDelete = async (type, id) => {
    try {
      if (type === 'tourGuide') {
        await axios.delete(`http://localhost:4000/api/TourGuide/${id}`);
        // Remove the deleted tour guide from state
        setUsers(prev => ({
          ...prev,
          tourGuides: prev.tourGuides.filter(guide => guide._id !== id)
        }));
      } else {
        await axios.delete(`http://localhost:4000/api/TouristRegister/${id}`);
        // Remove the deleted tourist from state
        setUsers(prev => ({
          ...prev,
          tourists: prev.tourists.filter(tourist => tourist._id !== id)
        }));
      }
      
      // Show success notification
      setNotification({
        show: true,
        message: `${type === 'tourGuide' ? 'Tour guide' : 'Tourist'} deleted successfully`,
        type: 'success'
      });
      
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      
      // Show error notification
      setNotification({
        show: true,
        message: `Failed to delete ${type === 'tourGuide' ? 'tour guide' : 'tourist'}`,
        type: 'error'
      });
    } finally {
      setConfirmDelete({ type: null, id: null });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter users based on search term and active tab
  const getFilteredUsers = () => {
    if (activeTab === 'tourGuides') {
      return users.tourGuides.filter(guide =>
        guide.guideName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return users.tourists.filter(tourist =>
        tourist.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tourist.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tourist.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  };

  // Get counts for stats
  const getTotalCounts = () => {
    return {
      tourGuides: users.tourGuides.length,
      tourists: users.tourists.length,
      total: users.tourGuides.length + users.tourists.length
    };
  };

  const renderTourGuideTable = () => {
    const filteredGuides = getFilteredUsers();
    
    if (loading.tourGuides) {
      return <div className="loading-spinner-z">Loading tour guides...</div>;
    }
    
    if (error.tourGuides) {
      return <div className="error-message-z">{error.tourGuides}</div>;
    }
    
    if (filteredGuides.length === 0) {
      return <div className="no-data-z">No tour guides found.</div>;
    }
    
    return (
      <div className="table-responsive-z">
        <table className="table-z">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Registered Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuides.map((guide) => (
              <tr key={guide._id}>
                <td>{guide.guideName || 'N/A'}</td>
                <td>{guide.user?.email || guide.email || 'N/A'}</td>
                <td>{guide.user?.role || 'Tour Guide'}</td>
                <td>{formatDate(guide.createdAt)}</td>
                <td>
                  {confirmDelete.type === 'tourGuide' && confirmDelete.id === guide._id ? (
                    <div className="delete-confirm-z">
                      <button 
                        className="confirm-yes-z" 
                        onClick={() => handleDelete('tourGuide', guide._id)}
                      >
                        Yes
                      </button>
                      <button 
                        className="confirm-no-z" 
                        onClick={() => setConfirmDelete({ type: null, id: null })}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="delete-btn-z" 
                      onClick={() => setConfirmDelete({ type: 'tourGuide', id: guide._id })}
                    >
                      <FaTrash /> Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTouristTable = () => {
    const filteredTourists = getFilteredUsers();
    
    if (loading.tourists) {
      return <div className="loading-spinner-z">Loading tourists...</div>;
    }
    
    if (error.tourists) {
      return <div className="error-message-z">{error.tourists}</div>;
    }
    
    if (filteredTourists.length === 0) {
      return <div className="no-data-z">No tourists found.</div>;
    }
    
    return (
      <div className="table-responsive-z">
        <table className="table-z">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Country</th>
              <th>Phone Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTourists.map((tourist) => (
              <tr key={tourist._id}>
                <td>{tourist.fullname || 'N/A'}</td>
                <td>{tourist.email || 'N/A'}</td>
                <td>{tourist.country || 'N/A'}</td>
                <td>{tourist.mobile_number || 'N/A'}</td>
                <td>
                  {confirmDelete.type === 'tourist' && confirmDelete.id === tourist._id ? (
                    <div className="delete-confirm-z">
                      <button 
                        className="confirm-yes-z" 
                        onClick={() => handleDelete('tourist', tourist._id)}
                      >
                        Yes
                      </button>
                      <button 
                        className="confirm-no-z" 
                        onClick={() => setConfirmDelete({ type: null, id: null })}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="delete-btn-z" 
                      onClick={() => setConfirmDelete({ type: 'tourist', id: tourist._id })}
                    >
                      <FaTrash /> Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const counts = getTotalCounts();

  return (
    <div className="user-management-container-z">
      <h1 className="dashboard-title-z">User Management</h1>
      
      {/* Notification */}
      {notification.show && (
        <div className={`notification-z ${notification.type}-z`}>
          {notification.message}
        </div>
      )}
      
      {/* Tabs */}
      <div className="user-tabs-z">
        <button 
          className={`tab-button-z ${activeTab === 'tourGuides' ? 'active-z' : ''}`}
          onClick={() => setActiveTab('tourGuides')}
        >
          <FaUserTie className="tab-icon-z" /> Tour Guides
        </button>
        <button 
          className={`tab-button-z ${activeTab === 'tourists' ? 'active-z' : ''}`}
          onClick={() => setActiveTab('tourists')}
        >
          <FaUser className="tab-icon-z" /> Tourists
        </button>
      </div>
      
      {/* Search and statistics section */}
      <div className="dashboard-header-z">
        <div className="search-bar-z">
          <FaSearch className="search-icon-z" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'tourGuides' ? 'tour guides' : 'tourists'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="dashboard-stats-z">
          <div className="stat-card-z">
            <h3>{counts.total}</h3>
            <p>Total Users</p>
          </div>
          <div className="stat-card-z">
            <h3>{counts.tourGuides}</h3>
            <p>Tour Guides</p>
          </div>
          <div className="stat-card-z">
            <h3>{counts.tourists}</h3>
            <p>Tourists</p>
          </div>
        </div>
      </div>
      
      {/* Tables */}
      {activeTab === 'tourGuides' ? renderTourGuideTable() : renderTouristTable()}
    </div>
  );
};

export default UserManagement;