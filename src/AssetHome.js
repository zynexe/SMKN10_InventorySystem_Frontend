import React, { useState, useEffect, useRef } from "react";
import "./Asset.css"; // Import the CSS file
import { useNavigate } from "react-router-dom";
import calendarYear from "./assets/calenderYear.png";
import ApexCharts from 'apexcharts'
import Sidebar from './Layout/Sidebar'; // Import Sidebar
import Dropdown from "./Components/Dropdown"; // Import Dropdown
import ProfileBar from "./Components/ProfileBar"; // Import ProfileBar

// Import the data arrays
import { assetData } from './AssetPage'; // Make sure to export assetData from AssetPage
import { gedungData } from './Gedung'; // Make sure to export gedungData from Gedung

function AssetHome() {
    const navigate = useNavigate();

    // Calculate totals
    const totalItems = assetData.reduce((total, item) => total + item.jumlah, 0);
    const totalGedung = gedungData.length;

    const handleCardClick = (route) => {
        navigate(route); // Navigate to the specified route
    };

    const [allExpensesData] = useState({
        2025: [
            { month: "JAN", expenses: 25000000 },
            { month: "FEB", expenses: 28000000 },
            { month: "MAR", expenses: 32000000 },
            { month: "APR", expenses: 35000000 },
            { month: "MAY", expenses: 40000000 },
            { month: "JUN", expenses: 42000000 },
            { month: "JUL", expenses: 45000000 },
            { month: "AUG", expenses: 48000000 },
            { month: "SEP", expenses: 50000000 },
            { month: "OCT", expenses: 52000000 },
            { month: "NOV", expenses: 55000000 },
            { month: "DEC", expenses: 58000000 },
        ],
        2024: [
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
        ],
        2023: [
            { month: "JAN", expenses: 15000000 },
            { month: "FEB", expenses: 18000000 },
            { month: "MAR", expenses: 20000000 },
            { month: "APR", expenses: 22000000 },
            { month: "MAY", expenses: 25000000 },
            { month: "JUN", expenses: 28000000 },
            { month: "JUL", expenses: 30000000 },
            { month: "AUG", expenses: 32000000 },
            { month: "SEP", expenses: 35000000 },
            { month: "OCT", expenses: 38000000 },
            { month: "NOV", expenses: 40000000 },
            { month: "DEC", expenses: 42000000 },
        ],
        2022: [
            { month: "JAN", expenses: 10000000 },
            { month: "FEB", expenses: 12000000 },
            { month: "MAR", expenses: 15000000 },
            { month: "APR", expenses: 18000000 },
            { month: "MAY", expenses: 20000000 },
            { month: "JUN", expenses: 22000000 },
            { month: "JUL", expenses: 25000000 },
            { month: "AUG", expenses: 28000000 },
            { month: "SEP", expenses: 30000000 },
            { month: "OCT", expenses: 32000000 },
            { month: "NOV", expenses: 35000000 },
            { month: "DEC", expenses: 38000000 },
        ],
        2021: [
            { month: "JAN", expenses: 8000000 },
            { month: "FEB", expenses: 10000000 },
            { month: "MAR", expenses: 12000000 },
            { month: "APR", expenses: 15000000 },
            { month: "MAY", expenses: 18000000 },
            { month: "JUN", expenses: 20000000 },
            { month: "JUL", expenses: 22000000 },
            { month: "AUG", expenses: 25000000 },
            { month: "SEP", expenses: 28000000 },
            { month: "OCT", expenses: 30000000 },
            { month: "NOV", expenses: 32000000 },
            { month: "DEC", expenses: 35000000 },
        ],
    });

    const chartRef = useRef(null); // Create a ref for the chart container
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 40 }, (_, index) => currentYear - index);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

    // Add new state for recap values
    const [rekapTahunan, setRekapTahunan] = useState(0);
    const [rekapBulanan, setRekapBulanan] = useState(0);

    useEffect(() => {
        if (chartRef.current) {
            // Get data for selected year (default to current year if not found)
            const yearData = allExpensesData[selectedYear] || allExpensesData[currentYear];

            const chart = new ApexCharts(chartRef.current, {
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
                    categories: yearData.map(item => item.month)
                },
                yaxis: {
                    title: {
                        text: 'Expenses'
                    },
                    labels: {
                        formatter: function (value) {
                            return "Rp. " + (value / 1000000).toFixed(0) + "M";
                        }
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
                        name: `Monthly Expenses ${selectedYear}`,
                        data: yearData.map(item => item.expenses)
                    }
                ]
            });

            chart.render();

            return () => {
                chart.destroy();
            };
        }
    }, [selectedYear, allExpensesData, currentYear]);

    // Add useEffect to calculate recap values
    useEffect(() => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based

        // Calculate total values
        const totals = assetData.reduce((acc, item) => {
            // Parse the date from item (DD/MM/YYYY format)
            const [day, month, year] = item.tanggal.split('/').map(num => parseInt(num));
            
            // Parse the price (remove "Rp. " and dots, then convert to number)
            const price = parseInt(item.harga.replace(/\D/g, '')) * item.jumlah;

            // Check if item is from current year
            if (year === currentYear) {
                acc.yearlyTotal += price;
                
                // Check if item is from current month
                if (month === currentMonth) {
                    acc.monthlyTotal += price;
                }
            }

            return acc;
        }, { yearlyTotal: 0, monthlyTotal: 0 });

        setRekapTahunan(totals.yearlyTotal);
        setRekapBulanan(totals.monthlyTotal);
    }, [assetData]);

   // Function to toggle year dropdown
   const toggleYearDropdown = (isOpen) => {
    setIsYearDropdownOpen(isOpen !== undefined ? isOpen : !isYearDropdownOpen);
   
  };


    const handleYearSelect = (year) => {
        setSelectedYear(parseInt(year));
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
                            <p>Rp. {rekapTahunan.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="card">
                            <h3>Rekap Bulanan</h3>
                            <p>Rp. {rekapBulanan.toLocaleString('id-ID')}</p>
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
                            <h2>{totalGedung}</h2>
                        </div>
                        <div className="card-statistic" onClick={() => handleCardClick("/asset-page")}> {/* Changed class name */}
                            <h3>
                                Total Item <span className="card-arrow">→</span>
                            </h3>
                            <h2>{totalItems}</h2>
                        </div>
                    </div>

                    {/* ... chart ... */}
                </div>
            </div>
        </div>
    );
}

export default AssetHome;