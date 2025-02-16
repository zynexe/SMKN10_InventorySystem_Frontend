import React, { useState, useEffect, useRef } from "react";
import "./Asset.css"; // Import the CSS file
import logo from "./logo.png"; // Import your logo
import homeIcon from "./assets/home.png";
import assetIcon from "./assets/asset.png";
import kodeRekeningIcon from "./assets/kode-rekening.png";
import gedungIcon from "./assets/gedung.png";
import profileIcon from "./assets/profile.png";
import switchIcon from "./assets/switch.png";
import { useNavigate } from "react-router-dom";
import calendarMonth from "./assets/calenderMonth.png"; // Import calendar icon
import ApexCharts from 'apexcharts'


function AssetHome() {
  const navigate = useNavigate();

  const handleCardClick = (route) => {
      navigate(route); // Navigate to the specified route
  };
  const [monthlyExpenses, setMonthlyExpenses] = useState([ // Sample data
      { month: "JAN", expenses: 20000000 },
      { month: "FEB", expenses: 25000000 },
      { month: "MAR", expenses: 10000000},
      { month: "APR", expenses: 30000000 },
      { month: "MAY", expenses: 28000000 },
      { month: "JUN", expenses: 50000000 },
      { month: "JUL", expenses: 32000000 },
      { month: "AUG", expenses: 40000000 },
      { month: "SEP", expenses: 38000000 },
      { month: "OCT", expenses: 45000000 },
      { month: "NOV", expenses: 42000000 },
      { month: "DEC", expenses: 50000000 },
  ]);

  const chartRef = useRef(null); // Create a ref for the chart container

  useEffect(() => {
      const chart = new ApexCharts(chartRef.current, { // Create chart instance
          chart: {
              height: 250,
              type: 'area',
              zoom: {
                  enabled: false
              }
          },
          dataLabels: {
              enabled: false
          },
          stroke: {
              curve: 'smooth'
          },
          xaxis: {
              categories: monthlyExpenses.map(item => item.month)
          },
          yaxis: {
              title: {
                  text: 'Expenses'
              }
          },
          tooltip: {
              y: {
                  formatter: (value) => {
                      return "Rp. " + value.toLocaleString();
                  }
              }
          },
          series: [
              {
                  name: "Monthly Expenses",
                  data: monthlyExpenses.map(item => item.expenses)
              }
          ]
      });

      chart.render(); // Render the chart

      return () => { // Destroy chart on unmount
          chart.destroy();
      };
  }, [monthlyExpenses])

const chartSeries = [
    {
        name: "Monthly Expenses",
        data: monthlyExpenses.map(item => item.expenses) // Use expense values
    }
];

  return (
    <div className="asset-home-container">
      {/* Sidebar/Navbar */}
      <div className="sidebar">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <ul className="nav-links">
          <li>
            <a href="#" className="active" onClick={() => navigate("/asset-home")}>
              <img src={homeIcon} alt="Home" className="icon" />
              Home
            </a>
          </li>
          <li>
            <a href="#" onClick={() => navigate("/asset-page")}>
              <img src={assetIcon} alt="Asset" className="icon" />
              Asset
            </a>
          </li>
          <li>
            <a href="#">
              <img src={kodeRekeningIcon} alt="Kode Rekening" className="icon" />
              Kode Rekening
            </a>
          </li>
          <li>
           <a href="#" onClick={() => navigate("/gedung")}>
              <img src={gedungIcon} alt="Gedung" className="icon" />
              Gedung
          </a>
          </li>
          <li>
            <a href="#">
              <img src={profileIcon} alt="Profile" className="icon" />
              Profile
            </a>
          </li>
        </ul>
        <div className="switch-system">
          <button onClick={() => navigate("/choose-system")}>
            <img src={switchIcon} alt="Switch System" className="icon" />
            Switch System
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        
        <div className="header">
          <h2>Home</h2>
        </div>
        <div className="content">
          {/* Your main content for AssetHome goes here */}
          <div className="dashboard-cards">
            <div className="card">
              <h3>Balance</h3>
              <p>Rp.100.000.000</p>
            </div>
            <div className="card">
              <h3>Rekap Tahunan</h3>
              <p>Rp.200.000.000</p>
            </div>
            <div className="card">
              <h3>Rekap Bulanan</h3>
              <p>Rp.200.000.000</p>
            </div>
          </div>
          <div className="chart-container">
              <div className="chart-header">

              </div>
              <div className="chart-container">
                  <div className="chart-header">
                      <h3>Monthly Expenses</h3>
                      <button className="secondary-button">
                          <img src={calendarMonth} alt="Month" />
                          2025
                      </button>
                  </div>
                  <div ref={chartRef} className="apex-chart-wrapper"> </div>{/* Add a wrapper div */}
                </div>
              
          </div>
          <div className="header">
                        <h3>Statistik Asset</h3>
                    </div>
                    <div className="dashboard-cards">
                    <div className="card-statistic" onClick={() => handleCardClick("/gedung")}> {/* Changed class name */}
                            <h3>
                                Total Gedung <span className="card-arrow">→</span>
                            </h3>
                            <h2>24</h2>
                        </div>
                        <div className="card-statistic" onClick={() => handleCardClick("/asset-page")}> {/* Changed class name */}
                            <h3>
                                Total Item <span className="card-arrow">→</span>
                            </h3>
                            <h2>8241</h2>
                        </div>
                    </div>

                    {/* ... chart ... */}
                </div>
      </div>
    </div>
  );
}

export default AssetHome;