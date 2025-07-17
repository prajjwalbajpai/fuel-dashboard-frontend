import React, { useState, useEffect } from 'react';
import VehicleDashboard from './components/VehicleDashboard';
import OdometerUpload from './components/OdometerUpload';
import FuelEntry from './components/FuelEntry';
import Login from './components/Login';
import { ToastContainer } from 'react-toastify';
import { supabase } from './supabaseClient';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App = () => {
   const [vehicleData, setVehicleData] = useState({
     currentMileage: 0,
     costMonth: 0,
     averageKmpl: 0,
     lastMonthKm: 0,
     monthlyData: [],
     mileageData: []
   });
   const [loading, setLoading] = useState(true);
   const [session, setSession] = useState(null); 
   const [authLoading, setAuthLoading] = useState(true);

   const OCR_API_URL = 'http://prahtzwal.pythonanywhere.com/ocr';

   useEffect(() => {
   supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
   });

   const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
   });

   return () => subscription.unsubscribe();
   }, []); 

   useEffect(() => {
      if (session) {
         fetchVehicleData();
      }
   }, [session]); 


   const fetchVehicleData = async () => {
      if (!session) return;
      try {
      setLoading(true);
      const userId = session.user.id;

      const { data: odoData, error: odoError } = await supabase
        .from('odometer_readings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (odoError) throw odoError;

      const { data: fuelData, error: fuelError } = await supabase
        .from('fuel_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (fuelError) throw fuelError;

      const currentMileage = odoData.length > 0 ? odoData[0].reading : 0;

      const now = new Date();
      const daysAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

      const costMonth = fuelData
      .filter(entry => new Date(entry.created_at) >= daysAgo(30))
      .reduce((sum, entry) => sum + entry.fuel_price * entry.fuel_quantity, 0);

      const odoLast30Days = odoData
      .filter(entry => new Date(entry.created_at) >= daysAgo(30));

      let lastMonthKm = 0;

      if (odoLast30Days.length >= 2) {
      const newest = odoLast30Days[0].reading;
      const oldest = odoLast30Days[odoLast30Days.length - 1].reading;
      lastMonthKm = newest - oldest;
      }
      const fuelLast30Days = fuelData.filter(entry =>
         new Date(entry.created_at) >= daysAgo(30)
      );
      
      const totalFuelLast30Days = fuelLast30Days.reduce((sum, entry) => {
         const qty = parseFloat(entry.fuel_quantity);
         return sum + (isNaN(qty) ? 0 : qty);
      }, 0);

      const averageKmpl = totalFuelLast30Days > 0 ? (lastMonthKm / totalFuelLast30Days) : 0;


      const groupByMonth = (data) => {
         const map = {};
         data.forEach(entry => {
            const date = new Date(entry.created_at);
            const key = `${date.getFullYear()}-${date.getMonth() + 1}`; // e.g., "2025-7"
            if (!map[key]) map[key] = [];
            map[key].push({ date, reading: entry.reading });
         });
         return map;
      };

      const groupFuelByMonth = (data) => {
         const map = {};
         data.forEach(entry => {
            const date = new Date(entry.created_at);
            const key = `${date.getFullYear()}-${date.getMonth() + 1}`; 
            if (!map[key]) map[key] = [];
            map[key].push({
               date,
               quantity: parseFloat(entry.fuel_quantity) || 0
            });
         });
         return map;
         };


      const monthlyData = [];
      const monthlyGroups = groupByMonth(odoData);

      for (const key in monthlyGroups) {
      const entries = monthlyGroups[key].sort((a, b) => a.date - b.date);
      const km = entries[entries.length - 1].reading - entries[0].reading;
      monthlyData.push({
         month: key,
         kmDriven: km
      });
      }

      const fuelGroups = groupFuelByMonth(fuelData);
      const mileageData = [];


      for (const key in monthlyGroups) {
      const odoEntries = monthlyGroups[key].sort((a, b) => a.date - b.date);
      const fuelEntries = fuelGroups[key] || [];
      const distance = odoEntries[odoEntries.length - 1].reading - odoEntries[0].reading;
      const fuelUsed = fuelEntries.reduce((sum, f) => sum + (parseFloat(f.quantity) || 0), 0);

      mileageData.push({
         month: key,
         mileage: fuelUsed > 0 ? distance / fuelUsed : 0
      });
      }


      setVehicleData({
         ...vehicleData,
         currentMileage,
         costMonth,
         averageKmpl,
         lastMonthKm,
         monthlyData, 
         mileageData 
      });
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
    } finally {
      setLoading(false);
    }
   };


    const handleOdometerUpload = async (imageFile) => {
    if (!session) throw new Error('Not authenticated');
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await fetch(OCR_API_URL, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
         throw new Error(`OCR API request failed with status ${response.status}`);
      }
      const ocrResult = await response.json();

      if (ocrResult.success) {
        const userId = session.user.id;
        const { data, error } = await supabase.from('odometer_readings').insert({
          user_id: userId,
          reading: ocrResult.reading
        }).select();
        if (error) throw error;
        fetchVehicleData(); 
        return data;
      }
    } catch (error) {
      console.error('Error uploading odometer:', error);
      throw error;
    }
  };

  const handleFuelEntry = async (fuelData) => {
    if (!session) throw new Error('Not authenticated');
    try {
      const userId = session.user.id;
      const { data, error } = await supabase.from('fuel_entries').insert({
        fuel_quantity: parseFloat(fuelData.fuel_quantity),
        fuel_price: parseFloat(fuelData.fuel_price || 0),
        user_id: userId
      }).select();
      if (error) throw error;
      fetchVehicleData(); 
      return data;
    } catch (error) {
      console.error('Error adding fuel entry:', error);
      throw error;
    }
  };


  const handleLoginSuccess = () => {
    fetchVehicleData();
  };

  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!session) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
   
    <div className="app">
      <div className="heading-container">
      <header className="app-header">
        <h1>VEHICLE DASHBOARD</h1>
        <p>Track your vehicle's history</p>
      </header>
      </div>
      
      <div className="dashboard-container">
        <VehicleDashboard vehicleData={vehicleData} />
        
        <div className="input-section">
          <div className="input-cards">
            <OdometerUpload onUpload={handleOdometerUpload} />
            <FuelEntry onSubmit={handleFuelEntry} />
          </div>
        </div>
      </div>
      
      <ToastContainer position="top-right" />
    </div>
  );
};

export default App;
