import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './FuelEntry.css';

const FuelEntry = ({ onSubmit }) => {
  const [fuelData, setFuelData] = useState({
    fuelQuantity: '',
    fuelPrice: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFuelData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!fuelData.fuelQuantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseFloat(fuelData.fuelQuantity) <= 0) {
      toast.error('Fuel quantity must be greater than 0');
      return;
    }

    setSubmitting(true);
    
    try {
      const submitData = {
        fuel_quantity: parseFloat(fuelData.fuelQuantity),
        fuel_price: parseFloat(fuelData.fuelPrice) || 0,
      };

      await onSubmit(submitData);
      toast.success('Fuel entry added successfully!');
      
      // Reset form
      setFuelData({
        fuelQuantity: '',
        fuelPrice: ''
      });
      
    } catch (error) {
      toast.error('Failed to add fuel entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fuel-entry">
      <h2>⛽ Add Fuel Entry</h2>
      
      <form onSubmit={handleSubmit} className="fuel-form">
        <div className="form-group">
          <label htmlFor="fuelQuantity">Fuel Quantity (Liters) *</label>
          <input
            type="number"
            id="fuelQuantity"
            name="fuelQuantity"
            value={fuelData.fuelQuantity}
            onChange={handleInputChange}
            placeholder="Enter fuel quantity"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="fuelPrice">Fuel Price (₹)</label>
          <input
            type="number"
            id="fuelPrice"
            name="fuelPrice"
            value={fuelData.fuelPrice}
            onChange={handleInputChange}
            placeholder="Enter fuel price (optional)"
            step="0.01"
            min="0"
          />
        </div>

        <button 
          type="submit"
          disabled={submitting}
          className="fuel-submit-btn"
        >
          {submitting ? (
            <>
              <div className="spinner-small"></div>
              Adding Entry...
            </>
          ) : (
            'Add Fuel Entry'
          )}
        </button>
      </form>
    </div>
  );
};

export default FuelEntry;
