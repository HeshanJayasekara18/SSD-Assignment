import React, { useState } from 'react';
import './Gallary.css';

const Gallary = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  // Sri Lanka destination data with placeholder images
  const destinations = [
    {
      id: 1,
      name: 'Sigiriya Rock Fortress',
      category: 'heritage',
      description: 'Ancient rock fortress with frescoes and gardens',
      placeholderImg: '/api/placeholder/600/400'
    },
    {
      id: 2,
      name: 'Galle Fort',
      category: 'heritage',
      description: 'UNESCO World Heritage site with colonial architecture',
      placeholderImg: '/api/placeholder/600/400'
    },
    {
      id: 3,
      name: 'Yala National Park',
      category: 'wildlife',
      description: 'Famous for leopards and diverse wildlife',
      placeholderImg: '/api/placeholder/600/400'
    },
    {
      id: 4,
      name: 'Unawatuna Beach',
      category: 'beaches',
      description: 'Golden sandy beaches and turquoise waters',
      placeholderImg: '/api/placeholder/600/400'
    },
    {
      id: 5,
      name: 'Ella Rock',
      category: 'nature',
      description: 'Stunning hiking trails with panoramic views',
      placeholderImg: '/api/placeholder/600/400'
    },
    {
      id: 6,
      name: 'Temple of the Tooth',
      category: 'heritage',
      description: 'Sacred Buddhist temple in Kandy',
      placeholderImg: '/api/placeholder/600/400'
    },
    {
      id: 7,
      name: 'Mirissa Beach',
      category: 'beaches',
      description: 'Popular for whale watching and surfing',
      placeholderImg: '/api/placeholder/600/400'
    },
    {
      id: 8,
      name: 'Nine Arch Bridge',
      category: 'nature',
      description: 'Colonial-era railway bridge surrounded by tea plantations',
      placeholderImg: '/api/placeholder/600/400'
    },
    {
      id: 9,
      name: 'Nuwara Eliya',
      category: 'nature',
      description: 'Tea country with colonial architecture and cool climate',
      placeholderImg: '/api/placeholder/600/400'
    },
    {
      id: 10,
      name: 'Polonnaruwa',
      category: 'heritage',
      description: 'Ancient city with well-preserved ruins',
      placeholderImg: '/api/placeholder/600/400'
    },
    {
      id: 11,
      name: 'Udawalawe National Park',
      category: 'wildlife',
      description: 'Famous for elephant herds and bird watching',
      placeholderImg: '/api/placeholder/600/400'
    },
    {
      id: 12,
      name: 'Arugam Bay',
      category: 'beaches',
      description: 'World-class surfing destination on the east coast',
      placeholderImg: '/api/placeholder/600/400'
    },
  ];

  // Filter the destinations based on active category
  const filteredDestinations = activeCategory === 'all' 
    ? destinations 
    : destinations.filter(dest => dest.category === activeCategory);

  return (
    <div className="gallery-container">
      <div className="gallery-intro">
        <h1>Discover the Beauty of Sri Lanka</h1>
        <p>Explore pristine beaches, ancient heritage sites, lush nature, and abundant wildlife</p>
      </div>
      
      <div className="gallery-filter">
        <button 
          className={activeCategory === 'all' ? 'active' : ''} 
          onClick={() => setActiveCategory('all')}
        >
          All Destinations
        </button>
        <button 
          className={activeCategory === 'heritage' ? 'active' : ''} 
          onClick={() => setActiveCategory('heritage')}
        >
          Heritage Sites
        </button>
        <button 
          className={activeCategory === 'beaches' ? 'active' : ''} 
          onClick={() => setActiveCategory('beaches')}
        >
          Beaches
        </button>
        <button 
          className={activeCategory === 'nature' ? 'active' : ''} 
          onClick={() => setActiveCategory('nature')}
        >
          Nature & Landscapes
        </button>
        <button 
          className={activeCategory === 'wildlife' ? 'active' : ''} 
          onClick={() => setActiveCategory('wildlife')}
        >
          Wildlife
        </button>
      </div>

      <div className="gallery-grid">
        {filteredDestinations.map(destination => (
          <div className="gallery-item" key={destination.id}>
            <div className="gallery-image">
              <img src={destination.placeholderImg} alt={destination.name} />
            </div>
            <div className="gallery-info">
              <h3>{destination.name}</h3>
              <p>{destination.description}</p>
              <button className="view-details">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallary;