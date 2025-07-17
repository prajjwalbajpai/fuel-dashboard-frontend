import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './VehicleDashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const VehicleDashboard = ({ vehicleData }) => {
  const {
    currentMileage,
    costMonth,
    averageKmpl,
    lastMonthKm,
    monthlyData,
    mileageData,
  } = vehicleData;

  // Chart options for KM driven
  const kmDrivenOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Kilometers Driven',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Kilometers'
        }
      }
    }
  };

  // Chart options for mileage
  const mileageOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Fuel Efficiency (KMPL)',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'KMPL'
        }
      }
    }
  };

  // Data for KM driven chart
  const kmDrivenData = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'KM Driven',
        data: monthlyData.map(item => item.kmDriven),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Data for mileage chart
  const mileageChartData = {
    labels: mileageData.map(item => item.month),
    datasets: [
      {
        label: 'KMPL',
        data: mileageData.map(item => item.mileage),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="dashboard">
      {/* Main Stats Section */}
      <div className="stats-section">
        <div className="main-stat">
          <div className="stat-value">{averageKmpl.toFixed(1)}</div>
          <div className="stat-label">KMPL Average</div>
        </div>
        <div className="secondary-stats">
          <div className="stat-card">
            <div className="stat-number">{lastMonthKm.toLocaleString()}</div>
            <div className="stat-description">KM Driven Last Month</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{costMonth.toLocaleString()}</div>
            <div className="stat-description">Last Month Fuel Cost</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{currentMileage}</div>
            <div className="stat-description">Current Odometer</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <div className="chart-wrapper">
            <Line data={kmDrivenData} options={kmDrivenOptions} />
          </div>
        </div>
        
        <div className="chart-container">
          <div className="chart-wrapper">
            <Bar data={mileageChartData} options={mileageOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDashboard;
