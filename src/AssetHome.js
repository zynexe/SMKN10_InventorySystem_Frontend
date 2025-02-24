import React, { useState, useEffect, useRef } from "react";
import "./Asset.css"; // Import the CSS file
import { useNavigate } from "react-router-dom";
import calendarYear from "./assets/calenderYear.png";
import ApexCharts from 'apexcharts'
import Sidebar from './Layout/Sidebar'; // Import Sidebar
import Dropdown from "./Components/Dropdown"; // Import Dropdown
import ProfileBar from "./Components/ProfileBar"; // Import ProfileBar


function AssetHome() {
    const navigate = useNavigate();

    const handleCardClick = (route) => {
        navigate(route); // Navigate to the specified route
    };
    const [monthlyExpenses, setMonthlyExpenses] = useState([ // Sample data
        { month: "JAN", expenses: 20000000 },
        { month: "FEB", expenses: 25000000 },
        { month: "MAR", expenses: 25000000 },
        { month: "APR", expenses: 30000000 },
        { month: "MAY", expenses: 38000000 },
        { month: "JUN", expenses: 40000000 },
        { month: "JUL", expenses: 42000000 },
        { month: "AUG", expenses: 60000000 },
        { month: "SEP", expenses: 68000000 },
        { month: "OCT", expenses: 75000000 },
        { month: "NOV", expenses: 82000000 },
        { month: "DEC", expenses: 90000000 },
    ]);

    const chartRef = useRef(null); // Create a ref for the chart container
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 40 }, (_, index) => currentYear - index);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

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

   // Function to toggle year dropdown
   const toggleYearDropdown = (isOpen) => {
    setIsYearDropdownOpen(isOpen !== undefined ? isOpen : !isYearDropdownOpen);
   
  };


    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setIsYearDropdownOpen(false);
    };

    return (
        <div className="asset-home-container">
            {/* Sidebar/Navbar */}
            <Sidebar />
            <ProfileBar />
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
                                <Dropdown
                                    options={years}
                                    isOpen={isYearDropdownOpen}
                                    toggleDropdown={toggleYearDropdown}
                                    handleSelect={handleYearSelect}
                                    buttonContent={<><img src={calendarYear} alt="CalendarYear" /> {selectedYear || currentYear}</>}
                                />
                            </div>
                            <div ref={chartRef} className="apex-chart-wrapper"> </div>{/* Add a wrapper div */}
                        </div>

                    </div>
                    <div className="header">
                        <h3>Asset Statistics</h3>
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