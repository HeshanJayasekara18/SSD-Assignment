// FeedbackManagement.js
import React, { useState, useEffect } from 'react';


import { Search, Filter, ChevronDown, ChevronUp, Download, MessageSquare, Trash2, Eye, X, Send } from 'lucide-react';

import './FeedbackManagement.css';

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    serviceType: '',
    rating: '',
    dateFrom: '',
    dateTo: ''
  });
  
  // Sorting states
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter menu state
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Detailed view state
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);

  // Response state
  const [responseText, setResponseText] = useState('');
  
  // Confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);

  // Fetch feedback data
  useEffect(() => {
    const fetchFeedbacks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:4000/api/feedback');
        if (!response.ok) {
          throw new Error('Failed to fetch feedbacks');
        }
        const data = await response.json();
        setFeedbacks(data.feedbacks);
        setFilteredFeedbacks(data.feedbacks);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  // Apply search and filters
  useEffect(() => {
    let result = [...feedbacks];
    
    // Apply search term
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(feedback => 
        feedback.touristID.email?.toLowerCase().includes(lowercasedSearch) || 
        feedback.comment?.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    // Apply service type filter
    if (filters.serviceType) {
      result = result.filter(feedback => feedback.serviceType === filters.serviceType);
    }
    
    // Apply rating filter
    if (filters.rating) {
      result = result.filter(feedback => feedback.rating === parseInt(filters.rating));
    }
    
    // Apply date range filter
    if (filters.dateFrom && filters.dateTo) {
      const fromDate = new Date(filters.dateFrom);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Set to end of day
      
      result = result.filter(feedback => {
        const feedbackDate = new Date(feedback.date);
        return feedbackDate >= fromDate && feedbackDate <= toDate;
      });
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredFeedbacks(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, filters, sortConfig, feedbacks]);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFeedbacks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      serviceType: '',
      rating: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  // Toggle sort direction
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Pagination handlers
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Export feedback data as CSV
  const exportToCSV = () => {
    // Headers for CSV
    const headers = ['Tourist Email', 'Service Type', 'Rating', 'Comment', 'Date', 'Admin Response'];
    
    // Format the data for CSV
    const csvData = filteredFeedbacks.map(feedback => [
      feedback.touristID.email,
      feedback.serviceType,
      feedback.rating,
      `"${feedback.comment?.replace(/"/g, '""') || ''}"`, // Handle quotes in comments
      new Date(feedback.date).toLocaleDateString(),
      `"${feedback.adminResponse?.replace(/"/g, '""') || ''}"`
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date available';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render star rating
  const renderStarRating = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  // Open detailed view of feedback
  const openDetailView = (feedback) => {
    setSelectedFeedback(feedback);
    setDetailViewOpen(true);
    setResponseText(feedback.adminResponse || '');
  };

  // Close detailed view
  const closeDetailView = () => {
    setDetailViewOpen(false);
    setSelectedFeedback(null);
    setResponseText('');
  };

  // Submit admin response
  const submitResponse = async () => {
    if (!selectedFeedback) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/feedback/${selectedFeedback._id}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminResponse: responseText }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit response');
      }
      
      // Update local state
      setFeedbacks(prevFeedbacks => 
        prevFeedbacks.map(item => 
          item._id === selectedFeedback._id 
            ? { ...item, adminResponse: responseText } 
            : item
        )
      );
      
      // Show success message or toast notification here
      alert('Response submitted successfully');
      closeDetailView();
    } catch (err) {
      setError(err.message);
    }
  };

  // Confirm delete dialog
  const confirmDelete = (feedback) => {
    setFeedbackToDelete(feedback);
    setShowDeleteConfirm(true);
  };

  // Delete feedback
  const deleteFeedback = async () => {
    if (!feedbackToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/feedback/${feedbackToDelete._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete feedback');
      }
      
      // Update local state
      setFeedbacks(prevFeedbacks => 
        prevFeedbacks.filter(item => item._id !== feedbackToDelete._id)
      );
      
      setShowDeleteConfirm(false);
      setFeedbackToDelete(null);
      
      // Close detail view if open
      if (detailViewOpen && selectedFeedback?._id === feedbackToDelete._id) {
        closeDetailView();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return <div className="loading-container-r">Loading feedback data...</div>;
  }

  if (error) {
    return <div className="error-container-r">Error: {error}</div>;
  }

  return (
    <div className="feedback-management-container-r">
      <div className="feedback-header-r">
        <h1 className="feedback-title-r">Feedback Management</h1>
        <div className="feedback-tools-r">
          <div className="search-container-r">
            <Search size={18} className="search-icon-r" />
            <input
              type="text"
              className="search-input-r"
              placeholder="Search by tourist ID or comment..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <button 
            className="filter-toggle-button-r" 
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
          >
            <Filter size={18} />
            <span>Filters</span>
            {isFilterMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <button className="export-button-r" onClick={exportToCSV}>
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
      
      {isFilterMenuOpen && (
        <div className="filter-panel-r">
          <div className="filter-row-r">
            <div className="filter-field-r">
              <label htmlFor="serviceType">Service Type</label>
              <select 
                id="serviceType" 
                name="serviceType" 
                value={filters.serviceType} 
                onChange={handleFilterChange}
              >
                <option value="">All Services</option>
                <option value="TourGuide">Tour Guide</option>
                <option value="HotelRoom">Hotel Room</option>
                <option value="Vehicle">Vehicle</option>
              </select>
            </div>
            
            <div className="filter-field-r">
              <label htmlFor="rating">Rating</label>
              <select 
                id="rating" 
                name="rating" 
                value={filters.rating} 
                onChange={handleFilterChange}
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            
            <div className="filter-field-r">
              <label htmlFor="dateFrom">Date From</label>
              <input 
                type="date" 
                id="dateFrom" 
                name="dateFrom" 
                value={filters.dateFrom} 
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="filter-field-r">
              <label htmlFor="dateTo">Date To</label>
              <input 
                type="date" 
                id="dateTo" 
                name="dateTo" 
                value={filters.dateTo} 
                onChange={handleFilterChange}
              />
            </div>
            
            <button className="clear-filters-button-r" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      )}
      
      <div className="feedback-stats-r">
        <div className="stat-box-r">
          <span className="stat-label-r">Total Feedbacks</span>
          <span className="stat-value-r">{filteredFeedbacks.length}</span>
        </div>
        <div className="stat-box-r">
          <span className="stat-label-r">Average Rating</span>
          <span className="stat-value-r">
            {filteredFeedbacks.length > 0 
              ? (filteredFeedbacks.reduce((sum, item) => sum + item.rating, 0) / filteredFeedbacks.length).toFixed(1)
              : 'N/A'}
          </span>
        </div>

        <div className="stat-box-r">
          <span className="stat-label-r">Responded</span>
          <span className="stat-value-r">
            {feedbacks.filter(item => item.adminResponse && item.adminResponse.trim() !== '').length}
          </span>
        </div>


      </div>
      
      <div className="feedback-table-container-r">         
        <table className="feedback-table-r">           
          <thead>             
            <tr>               
              <th className="sortable-header-r" onClick={() => handleSort('touristID')}>
                <div className="header-content-r">
                  Tourist Email               
                  {sortConfig.key === 'touristID' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>               
              <th className="sortable-header-r" onClick={() => handleSort('serviceType')}>
                <div className="header-content-r">
                  Service Type                 
                  {sortConfig.key === 'serviceType' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>               
              <th className="sortable-header-r" onClick={() => handleSort('rating')}>
                <div className="header-content-r">
                  Rating                 
                  {sortConfig.key === 'rating' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>               
              <th>Comment</th>               
              <th className="sortable-header-r" onClick={() => handleSort('date')}>
                <div className="header-content-r">
                  Date                 
                  {sortConfig.key === 'date' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>           
          </thead>           
          <tbody>   
            {currentItems.length > 0 ? (     
              currentItems.map((feedback, index) => (       
                <tr key={index}>         
                  <td>{feedback.touristID.email}</td>         
                  <td>           
                    <span className={`service-badge-r ${feedback.serviceType.toLowerCase()}-r`}>             
                      {feedback.serviceType}           
                    </span>         
                  </td>         
                  <td className="rating-cell-r">           
                    <span className="stars-display-r">{renderStarRating(feedback.rating)}</span>         
                  </td>         
                  <td className="comment-cell-r">           
                    {feedback.comment || <span className="no-comment-r">No comment provided</span>}         
                  </td>         
                  <td>{formatDate(feedback.date)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results-r">
                  No feedback found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
=======
        <div className="stat-box-r">
          <span className="stat-label-r">Responded</span>
          <span className="stat-value-r">
            {feedbacks.filter(item => item.adminResponse && item.adminResponse.trim() !== '').length}
          </span>
        </div>
      </div>
      
      <div className="feedback-table-container-r">         
        <table className="feedback-table-r">           
          <thead>             
            <tr>               
              <th className="sortable-header-r" onClick={() => handleSort('touristID')}>
                <div className="header-content-r">
                  Tourist Email               
                  {sortConfig.key === 'touristID' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>               
              <th className="sortable-header-r" onClick={() => handleSort('serviceType')}>
                <div className="header-content-r">
                  Service Type                 
                  {sortConfig.key === 'serviceType' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>               
              <th className="sortable-header-r" onClick={() => handleSort('rating')}>
                <div className="header-content-r">
                  Rating                 
                  {sortConfig.key === 'rating' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>               
              <th>Comment</th>               
              <th className="sortable-header-r" onClick={() => handleSort('date')}>
                <div className="header-content-r">
                  Date                 
                  {sortConfig.key === 'date' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>           
          </thead>           
          <tbody>   
            {currentItems.length > 0 ? (     
              currentItems.map((feedback, index) => (       
                <tr key={index}>         
                  <td>{feedback.touristID.email}</td>         
                  <td>           
                    <span className={`service-badge-r ${feedback.serviceType.toLowerCase()}-r`}>             
                      {feedback.serviceType}           
                    </span>         
                  </td>         
                  <td className="rating-cell-r">           
                    <span className="stars-display-r">{renderStarRating(feedback.rating)}</span>         
                  </td>         
                  <td className="comment-cell-r">           
                    {feedback.comment || <span className="no-comment-r">No comment provided</span>}         
                  </td>         
                  <td>{formatDate(feedback.date)}</td>
                  <td>
                    <div className="feedback-status-r">
                      {feedback.adminResponse && <span className="status-responded-r">Responded</span>}
                      {!feedback.adminResponse && <span className="status-pending-r">Pending</span>}
                    </div>
                  </td>       
                  <td className="actions-cell-r">
                    <button 
                      className="action-button-r view-button-r" 
                      title="View Details"
                      onClick={() => openDetailView(feedback)}
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="action-button-r respond-button-r" 
                      title="Respond to Feedback"
                      onClick={() => openDetailView(feedback)}
                    >
                      <MessageSquare size={16} />
                    </button>
                    <button 
                      className="action-button-r delete-button-r" 
                      title="Delete Feedback"
                      onClick={() => confirmDelete(feedback)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>     
              ))   
            ) : (     
              <tr>       
                <td colSpan="7" className="no-results-r">         
                  No feedback found matching your criteria.       
                </td>     
              </tr>   
            )} 
          </tbody>   
        </table>       

      </div>
      
      {filteredFeedbacks.length > 0 && (
        <div className="pagination-r">
          <button 
            className="pagination-button-r" 
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            Previous
          </button>
          <div className="page-numbers-r">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={i}
                  className={`page-number-r ${currentPage === pageNum ? 'active-page-r' : ''}`}
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="ellipsis-r">...</span>
                <button
                  className="page-number-r"
                  onClick={() => goToPage(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          <button 
            className="pagination-button-r" 
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

=======


      {/* Detailed Feedback View Modal */}
      {detailViewOpen && selectedFeedback && (
        <div className="modal-overlay-r">
          <div className="feedback-detail-modal-r">
            <div className="modal-header-r">
              <h2>Feedback Details</h2>
              <button className="close-modal-button-r" onClick={closeDetailView}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-content-r">
              <div className="detail-section-r">
                <h3>Tourist Information</h3>
                <p><strong>Email:</strong> {selectedFeedback.touristID.email}</p>
                {selectedFeedback.touristID.name && (
                  <p><strong>Name:</strong> {selectedFeedback.touristID.name}</p>
                )}
              </div>
              
              <div className="detail-section-r">
                <h3>Feedback Information</h3>
                <p><strong>Service Type:</strong> {selectedFeedback.serviceType}</p>
                <p><strong>Rating:</strong> {renderStarRating(selectedFeedback.rating)} ({selectedFeedback.rating}/5)</p>
                <p><strong>Submitted:</strong> {formatDate(selectedFeedback.date)}</p>
                <div className="detail-comment-r">
                  <strong>Comment:</strong>
                  <p>{selectedFeedback.comment || 'No comment provided'}</p>
                </div>
              </div>
              
              <div className="detail-section-r">
                <h3>Admin Response</h3>
                <textarea
                  className="response-textarea-r"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter your response to this feedback..."
                  rows={5}
                ></textarea>
                
                <div className="response-buttons-r">
                  <button className="submit-response-button-r" onClick={submitResponse}>
                    <Send size={16} />
                    Submit Response
                  </button>
                </div>
              </div>
            </div>
            
            <div className="modal-footer-r">
              <button className="delete-feedback-button-r" onClick={() => confirmDelete(selectedFeedback)}>
                <Trash2 size={16} />
                Delete Feedback
              </button>
              <button className="close-button-r" onClick={closeDetailView}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay-r">
          <div className="confirm-modal-r">
            <div className="confirm-content-r">
              <h3>Delete Feedback</h3>
              <p>Are you sure you want to delete this feedback? This action cannot be undone.</p>
              
              <div className="confirm-buttons-r">
                <button className="cancel-button-r" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button className="confirm-delete-button-r" onClick={deleteFeedback}>
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FeedbackManagement;