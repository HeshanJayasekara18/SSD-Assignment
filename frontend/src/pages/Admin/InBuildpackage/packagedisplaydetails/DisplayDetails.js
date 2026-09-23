import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import './DisplayDetails.css';
import Homepage from '../addpackage/Addpackage.js';
import SimplifiedTourForm from '../editpackagefrom/Editpackagefrom.js';
import axios from 'axios';
// Import React Icons
import { FaSearch, FaPlus, FaEye, FaEdit, FaTrashAlt, FaTimes } from 'react-icons/fa';
import { BiDollar } from 'react-icons/bi';
import { MdLocationOn, MdDateRange } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';

const DisplayDetails = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  const [tourPackages, setTourPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewPackage, setViewPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchCategory, setSearchCategory] = useState('all');

  const navigate = useNavigate(); // Initialize useNavigate hook

  // Fetch tour packages from the API
  useEffect(() => {
    const fetchTourPackages = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/tourPackage');
        setTourPackages(response.data); // Store the fetched data in state
        setFilteredPackages(response.data); // Initialize filtered packages with all packages
        setIsLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        console.error('Error fetching tour packages:', error);
        setSubmitMessage({ type: 'error', message: 'Failed to load tour packages. Please try again.' });
        setIsLoading(false);
      }
    };

    fetchTourPackages();
  }, []); // Empty dependency array to run once when the component mounts

  // Handle search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPackages(tourPackages);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      let filtered;
      
      switch(searchCategory) {
        case 'name':
          filtered = tourPackages.filter(pkg => 
            pkg.name.toLowerCase().includes(lowercasedSearch)
          );
          break;
        case 'destination':
          filtered = tourPackages.filter(pkg => 
            pkg.destination.toLowerCase().includes(lowercasedSearch)
          );
          break;
        case 'tourType':
          filtered = tourPackages.filter(pkg => 
            pkg.tourType.toLowerCase().includes(lowercasedSearch)
          );
          break;
        default: // 'all'
          filtered = tourPackages.filter(pkg => 
            pkg.name.toLowerCase().includes(lowercasedSearch) || 
            pkg.destination.toLowerCase().includes(lowercasedSearch) || 
            pkg.tourType.toLowerCase().includes(lowercasedSearch)
          );
      }
      
      setFilteredPackages(filtered);
    }
  }, [searchTerm, tourPackages, searchCategory]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    // Automatically focus the search input after clearing
    document.querySelector('.search-input').focus();
  };

  const handleClickOpen = (pkgId = null) => {
    if (pkgId) {
      const packageToEdit = tourPackages.find(pkg => pkg.tp_Id === pkgId);
      setSelectedPackageId(pkgId);
      setViewPackage(packageToEdit);
      console.log("TEST", viewPackage);
    } else {
      setSelectedPackageId(null);
      setViewPackage(null);
    }
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setSelectedPackageId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tour package?')) {
      try {
        await axios.delete(`http://localhost:4000/api/tourPackage/${id}`);
        
        setTourPackages(prevPackages => prevPackages.filter(pkg => pkg.tp_Id !== id));
        setFilteredPackages(prevPackages => prevPackages.filter(pkg => pkg.tp_Id !== id));
        
        alert('Tour package deleted successfully!');
      } catch (error) {
        console.error('Error deleting tour package:', error);
        alert('Failed to delete tour package.');
      }
    }
  };

  const handleView = (pkg) => {
    console.log("TEST", pkg);
    setViewPackage(pkg);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setViewPackage(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="tour-packages-container">
      <div className="header-section">
        <div className="header-content">
          <h1>Tour Packages</h1>
          <div className="header-controls">
            <div className={`search-container ${searchFocused ? 'search-focused' : ''}`}>
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search packages..." 
                className="search-input"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchTerm && (
                <button className="clear-search-btn" onClick={clearSearch}>
                  <FaTimes />
                </button>
              )}
              <div className="search-categories">
                <span 
                  className={`category ${searchCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSearchCategory('all')}
                >
                  All
                </span>
                <span 
                  className={`category ${searchCategory === 'name' ? 'active' : ''}`}
                  onClick={() => setSearchCategory('name')}
                >
                  Name
                </span>
                <span 
                  className={`category ${searchCategory === 'destination' ? 'active' : ''}`}
                  onClick={() => setSearchCategory('destination')}
                >
                  Destination
                </span>
                <span 
                  className={`category ${searchCategory === 'tourType' ? 'active' : ''}`}
                  onClick={() => setSearchCategory('tourType')}
                >
                  Tour Type
                </span>
              </div>
            </div>
            <button className="add-button" onClick={() => handleClickOpen()}>
              <FaPlus className="button-icon" /> Add New Package
            </button>
          </div>
        </div>
      </div>

      <div className="tour-packages-grid">
        {isLoading ? (
          <p>Loading tour packages...</p>
        ) : filteredPackages.length === 0 ? (
          searchTerm ? (
            <p className="no-packages">No tour packages match your search. Try different keywords.</p>
          ) : (
            <p className="no-packages">No tour packages found. Add your first package now!</p>
          )
        ) : (
          filteredPackages.map(pkg => (
            <div className="tour-package-card" key={pkg.tp_Id}>
              <div className="card-image">
                <img src={pkg.image} alt={pkg.name} />
                <div className="tour-type">{pkg.tourType}</div>
              </div>

              <div className="card-content">
                <h2>{pkg.name}</h2>
                <p className="destination">
                  <MdLocationOn className="info-icon" /> <strong>Destination:</strong> {pkg.destination}
                </p>
                <p className="dates">
                  <MdDateRange className="info-icon" /> <strong>Duration:</strong> {formatDate(pkg.startDate)} - {formatDate(pkg.endDate)}
                </p>
                <p className="price">
                  <BiDollar className="info-icon" /> <strong>Price:</strong> ${pkg.price.toLocaleString()}
                </p>

                <div className="action-buttons">
                  <button className="view-btn" onClick={() => handleView(pkg)}>
                    <FaEye className="button-icon" /> View
                  </button>
                  <button className="edit-btn" onClick={() => handleClickOpen(pkg.tp_Id)}>
                    <FaEdit className="button-icon" /> Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(pkg.tp_Id)}>
                    <FaTrashAlt className="button-icon" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && viewPackage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <IoMdClose className="close-button" onClick={closeModal} />
            <div className="modal-header">
              <h2>{viewPackage.name}</h2>
              <p className="tour-badge">{viewPackage.tourType}</p>
            </div>

            <div className="modal-body">
              <div className="modal-image">
                <img src={viewPackage.image} alt={viewPackage.name} />
              </div>

              <div className="modal-details">
                <p><strong>Package ID:</strong> {viewPackage.tp_Id}</p>
                <p><MdLocationOn className="details-icon" /> <strong>Destination:</strong> {viewPackage.destination}</p>
                <p><strong>Tour Guide:</strong> {viewPackage.tourGuideName}</p>
                <p><MdDateRange className="details-icon" /> <strong>Start Date:</strong> {formatDate(viewPackage.startDate)}</p>
                <p><MdDateRange className="details-icon" /> <strong>End Date:</strong> {formatDate(viewPackage.endDate)}</p>
                <p><BiDollar className="details-icon" /> <strong>Price:</strong> ${viewPackage.price.toLocaleString()}</p>
                <p><strong>Description:</strong></p>
                <p className="description">{viewPackage.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onClose={handleClose} fullWidth maxWidth="md">
        <DialogContent>
          {viewPackage ? (
            <SimplifiedTourForm packageData={viewPackage} />
          ) : (
            <Homepage />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DisplayDetails;