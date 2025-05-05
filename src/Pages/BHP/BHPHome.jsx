import React, { useState, useEffect, useRef } from "react";
import ApexCharts from 'apexcharts'
import '../../CSS/Asset.css'; 
import { useNavigate } from "react-router-dom";
import calendarYear from "../../assets/calenderYear.png"; 
import SidebarBHP from '../../Layout/SidebarBHP'; 
import Dropdown from "../../Components/Dropdown"; 
import ProfileBar from "../../Components/ProfileBar"; 
import BalanceModal from "../../Components/BalanceModal";

function BHPHome() {
    const navigate = useNavigate();
    const chartRef = useRef(null);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 40 }, (_, index) => currentYear - index);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    
    // Dummy data for statistics
    const [rekapTahunan, setRekapTahunan] = useState(125750000);
    const [rekapBulanan, setRekapBulanan] = useState(15200000);
    const [totalPeminjam, setTotalPeminjam] = useState(42);
    const [totalItems, setTotalItems] = useState(156);
    
    // No loading state needed for dummy data
    const [loadingStats, setLoadingStats] = useState(false);
    const [statsError, setStatsError] = useState(null);
    
    // Dummy data for expenses chart
    const [expensesData, setExpensesData] = useState({});
    
    // Dummy balance
    const [balance, setBalance] = useState(5000000);
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const [balanceError, setBalanceError] = useState(null);
    
    // Generate dummy expenses data
    useEffect(() => {
        // Create dummy expenses data for all years
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", 
                       "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        
        const expenses = {};
        
        // Generate random data for each year and month
        years.forEach(year => {
            expenses[year] = months.map(month => {
                // Generate higher values for the current year
                let baseValue = year === currentYear ? 5000000 : 3000000;
                // Random variation between 0.5x and 1.5x of base value
                let randomFactor = 0.5 + Math.random();
                return {
                    month,
                    expenses: Math.round(baseValue * randomFactor)
                };
            });
        });
        
        setExpensesData(expenses);
    }, []);

    // Render chart when expenses data or selected year changes
    useEffect(() => {
        if (chartRef.current && expensesData[selectedYear]) {
            const yearData = expensesData[selectedYear] || [];
            
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
    }, [selectedYear, expensesData]);

    // Function to toggle year dropdown
    const toggleYearDropdown = (isOpen) => {
        setIsYearDropdownOpen(isOpen !== undefined ? isOpen : !isYearDropdownOpen);
    };

    const handleYearSelect = (year) => {
        setSelectedYear(parseInt(year));
        setIsYearDropdownOpen(false);
    };

    // Handle balance update for dummy data
    const handleBalanceUpdate = async (newBalance, isAddition = false) => {
        try {
            if (isAddition) {
                // Add to existing balance
                setBalance(prevBalance => prevBalance + parseFloat(newBalance));
            } else {
                // Set to exact amount
                setBalance(parseFloat(newBalance));
            }
            
            setIsBalanceModalOpen(false);
        } catch (error) {
            console.error('Error updating balance:', error);
            alert('Failed to update balance. Please try again.');
        }
    };
    
    const handleCardClick = (route) => {
        navigate(route); 
    };

    return (
        <div className="asset-home-container">
            {/* Sidebar/Navbar */}
            <SidebarBHP />
            <ProfileBar isBHP={true} />
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
                            {loadingStats ? (
                                <p>Loading...</p>
                            ) : statsError ? (
                                <p className="error-text">Error loading data</p>
                            ) : (
                                <p>Rp. {rekapTahunan.toLocaleString('id-ID')}</p>
                            )}
                        </div>
                        <div className="card non-clickable">
                            <h3>Rekap Bulanan</h3>
                            {loadingStats ? (
                                <p>Loading...</p>
                            ) : statsError ? (
                                <p className="error-text">Error loading data</p>
                            ) : (
                                <p>Rp. {rekapBulanan.toLocaleString('id-ID')}</p>
                            )}
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
                            <h3>Monthly Expenses</h3>
                            <Dropdown
                                options={years}
                                isOpen={isYearDropdownOpen}
                                toggleDropdown={toggleYearDropdown}
                                handleSelect={handleYearSelect}
                                buttonContent={<><img src={calendarYear} alt="CalendarYear" /> {selectedYear || currentYear}</>}
                            />
                        </div>
                        <div ref={chartRef} className="apex-chart-wrapper"></div>
                    </div>
                    
                    <div className="header">
                        <h3>BHP Statistics</h3>
                    </div>
                    <div className="dashboard-cards">
                        <div className="card-statistic" onClick={() => handleCardClick("/riwayat")}>
                            <h3>
                                Total Peminjam <span className="card-arrow">→</span>
                            </h3>
                            {loadingStats ? (
                                <h2>Loading...</h2>
                            ) : statsError ? (
                                <h2 className="error-text">Error</h2>
                            ) : (
                                <h2>{totalPeminjam}</h2>
                            )}
                        </div>
                        <div className="card-statistic" onClick={() => handleCardClick("/bhp-page")}>
                            <h3>
                                Total Item <span className="card-arrow">→</span>
                            </h3>
                            {loadingStats ? (
                                <h2>Loading...</h2>
                            ) : statsError ? (
                                <h2 className="error-text">Error</h2>
                            ) : (
                                <h2>{totalItems}</h2>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BHPHome;