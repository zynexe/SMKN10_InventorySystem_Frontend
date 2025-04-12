import React, { useState, useEffect, useRef } from "react";
import ApexCharts from 'apexcharts'
import '../../CSS/Asset.css'; 
import { useNavigate } from "react-router-dom";
import calendarYear from "../../assets/calenderYear.png"; 
import Sidebar from '../../Layout/Sidebar'; 
import Dropdown from "../../Components/Dropdown"; 
import ProfileBar from "../../Components/ProfileBar"; 
import { assetData } from './AssetPage';
import { gedungData } from './Gedung';
import BalanceModal from "../../Components/BalanceModal";

// Update this line to include all required balance functions
import { getBalance, addBalance, updateBalance } from "../../services/api";

function AssetHome() {
    const navigate = useNavigate();

    // Calculate totals
    const totalItems = assetData.reduce((total, item) => total + item.jumlah, 0);
    const totalGedung = gedungData.length;

    const handleCardClick = (route) => {
        navigate(route); 
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

    // Add new state for balance and modal
    const [balance, setBalance] = useState(0);
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
    const [isLoadingBalance, setIsLoadingBalance] = useState(true);
    const [balanceError, setBalanceError] = useState(null);

    // Add a refresh trigger
    const [refreshTrigger, setRefreshTrigger] = useState(0);

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
            const [month, year] = item.tanggal.split('/').map(num => parseInt(num));
            
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
    }, []);

    // Update the fetchBalance function
    const fetchBalance = async () => {
        try {
            setIsLoadingBalance(true);
            console.log('Fetching balance...');
            const response = await getBalance();
            
            console.log('Balance data response:', response);
            console.log('Balance data value:', response?.data);
            
            if (response && response.data !== undefined) {
                const newBalance = Number(response.data);
                console.log('Setting balance state to:', newBalance);
                setBalance(newBalance);
            }
            setBalanceError(null);
        } catch (error) {
            console.error('Failed to fetch balance:', error);
            setBalanceError('Failed to load balance data');
        } finally {
            setIsLoadingBalance(false);
        }
    };

    // Update the useEffect to include refreshTrigger in the dependency array
    useEffect(() => {
        fetchBalance();
    }, [refreshTrigger]); // Now it will re-run when refreshTrigger changes

    // Function to toggle year dropdown
    const toggleYearDropdown = (isOpen) => {
        setIsYearDropdownOpen(isOpen !== undefined ? isOpen : !isYearDropdownOpen);
    };

    const handleYearSelect = (year) => {
        setSelectedYear(parseInt(year));
        setIsYearDropdownOpen(false);
    };

    // Update the handleBalanceUpdate function
    const handleBalanceUpdate = async (newBalance, isAddition = false) => {
        try {
            if (isAddition) {
                console.log(`Adding balance: ${newBalance}`);
                const response = await addBalance(parseFloat(newBalance));
                console.log('Add balance response:', response);
                if (response && response.data !== undefined) {
                    const updatedBalance = Number(response.data);
                    console.log('Setting updated balance to:', updatedBalance);
                    setBalance(updatedBalance);
                }
            } else {
                console.log(`Updating balance to: ${newBalance}`);
                const response = await updateBalance(parseFloat(newBalance));
                console.log('Update balance response:', response);
                if (response && response.data !== undefined) {
                    const updatedBalance = Number(response.data);
                    console.log('Setting updated balance to:', updatedBalance);
                    setBalance(updatedBalance);
                }
            }
            
            // Force a refresh of balance data
            setRefreshTrigger(prev => prev + 1);
            setIsBalanceModalOpen(false);
        } catch (error) {
            console.error('Error updating balance:', error);
            
            // More detailed error logging
            if (error.response) {
                console.error('Error response status:', error.response.status);
                console.error('Error response data:', error.response.data);
                alert(`Failed to update balance: ${error.response.data?.message || 'Please try again.'}`);
            } else if (error.request) {
                console.error('No response received:', error.request);
                alert('No response from server. Please check your internet connection.');
            } else {
                console.error('Request setup error:', error.message);
                alert(`Error: ${error.message}`);
            }
        }
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
                  
                    <div className="dashboard-cards">
                        <div 
                            className="card clickable" 
                            onClick={() => setIsBalanceModalOpen(true)}
                        >
                            <h3>Balance</h3>
                            {isLoadingBalance ? (
                                <p>Loading...</p>
                            ) : balanceError ? (
                                <p className="error-text">Error loading balance</p>
                            ) : (
                                <p>Rp. {balance.toLocaleString('id-ID')}</p>
                            )}
                        </div>
                        <div className="card non-clickable">
                            <h3>Rekap Tahunan</h3>
                            <p>Rp. {rekapTahunan.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="card non-clickable">
                            <h3>Rekap Bulanan</h3>
                            <p>Rp. {rekapBulanan.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    
                    {/* Add Balance Modal */}
                    <BalanceModal 
                        isOpen={isBalanceModalOpen} 
                        closeModal={() => setIsBalanceModalOpen(false)}
                        currentBalance={balance}
                        onUpdateBalance={handleBalanceUpdate}
                        isLoading={isLoadingBalance}
                    />

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

                  
                </div>
            </div>
        </div>
    );
}

export default AssetHome;