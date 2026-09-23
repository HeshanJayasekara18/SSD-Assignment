import React from 'react';
import './TourProgressSteps.css';

const TourProgressSteps = ({ currentStep }) => {
  const steps = [
    { id: 1, label: "Plan Your Tour" },
    { id: 2, label: "Select Vehicle" },
    { id: 3, label: "Select Hotels" },
    { id: 4, label: "Select Guide" },
    { id: 5, label: "Confirm & Pay" }
  ];
  
  return (
    <div className="progress-container">
      <div className="progress-steps-wrapper">
        {/* Line connecting all steps */}
        <div className="progress-line"></div>
        
        {/* Steps */}
        {steps.map((step, index) => (
          <div key={step.id} className="step-item">
            {/* Circle indicator */}
            <div 
              className={`step-circle ${currentStep >= step.id ? 'active' : ''}`}
            >
              {currentStep > step.id ? (
                <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{step.id}</span>
              )}
            </div>
            
            {/* Step label */}
            <span className={`step-label ${currentStep >= step.id ? 'active' : ''}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TourProgressSteps;