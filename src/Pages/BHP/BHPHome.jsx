import React, { useState, useEffect, useRef } from "react";
import ApexCharts from 'apexcharts'
import '../../CSS/Asset.css'; 
import { useNavigate } from "react-router-dom";
import calendarYear from "../../assets/calenderYear.png"; 
import SidebarBHP from '../../Layout/SidebarBHP'; 
import Dropdown from "../../Components/Dropdown"; 
import ProfileBar from "../../Components/ProfileBar"; 
import BalanceModal from "../../Components/BalanceModal";
import api, { getMonthlyExpenses, getTotalBHP, getTotalPeminjam } from '../../services/api'; 

function BHPHome() {
    const navigate = useNavigate();
    const chartRef = useRef(null);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
    const years = Array.from({ length: 40 }, (_, index) => currentYear - index);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    
    // Update state for statistics
    const [rekapTahunan, setRekapTahunan] = useState(0);
    const [rekapBulanan, setRekapBulanan] = useState(0);
    const [totalPeminjam, setTotalPeminjam] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    
    const [loadingStats, setLoadingStats] = useState(false);
    const [statsError, setStatsError] = useState(null);
    
    // Expense data from API
    const [monthlyExpenses, setMonthlyExpenses] = useState({});
    const [loadingChart, setLoadingChart] = useState(false);
    const [chartError, setChartError] = useState(null);
    
    // Dummy balance
    const [balance, setBalance] = useState(5000000);
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const [balanceError, setBalanceError] = useState(null);
    
    // Fetch monthly expenses data and update rekap values
    useEffect(() => {
        const fetchMonthlyExpenses = async () => {
            setLoadingChart(true);
            setChartError(null);
            setLoadingStats(true);
            
            try {
                // Use the imported function from api.js
                const data = await getMonthlyExpenses(selectedYear);
                setMonthlyExpenses(data);
                
                // Update rekap tahunan from the API response
                if (data && data.total_jumlah_akhir_year) {
                    setRekapTahunan(parseFloat(data.total_jumlah_akhir_year));
                }
                
                // Update rekap bulanan from the current month's data
                if (data && data.monthly_totals) {
                    const currentMonthPadded = String(currentMonth).padStart(2, '0');
                    const currentMonthTotal = data.monthly_totals[currentMonthPadded] || 0;
                    setRekapBulanan(parseFloat(currentMonthTotal));
                }
                
                setStatsError(null);
            } catch (error) {
                console.error("Error fetching monthly expenses:", error);
                setChartError("Failed to load expense data");
                setStatsError("Failed to load rekap data");
                setMonthlyExpenses({});
            } finally {
                setLoadingChart(false);
                setLoadingStats(false);
            }
        };
        
        fetchMonthlyExpenses();
    }, [selectedYear, currentMonth]);

    // Render chart when expenses data or selected year changes
    useEffect(() => {
        if (chartRef.current && !loadingChart && !chartError) {
            // Clear previous chart
            while (chartRef.current.firstChild) {
                chartRef.current.removeChild(chartRef.current.firstChild);
            }
            
            // Format monthly data for the chart based on the object structure
            const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            
            // Extract values from the monthlyExpenses object using padded month numbers (01, 02, etc.)
            const monthlyData = months.map((month, index) => {
                // Create padded month number (01, 02, etc.)
                const paddedMonth = String(index + 1).padStart(2, '0');
                
                // Get value from the API response or use 0 if not found
                const expenseValue = monthlyExpenses?.monthly_totals?.[paddedMonth] || 0;
                
                return {
                    month,
                    expenses: parseFloat(expenseValue)
                };
            });
            
            console.log('Processed monthly data:', monthlyData);
            
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
                    categories: months
                },
                yaxis: {
                    title: {
                        text: 'Expenses'
                    },
                    labels: {
                        formatter: function (value) {
                            return "Rp. " + (value / 1000000).toFixed(1) + "M";
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
                        data: monthlyData.map(item => item.expenses)
                    }
                ]
            });

            chart.render();

            return () => {
                chart.destroy();
            };
        }
    }, [monthlyExpenses, loadingChart, chartError]);

    // Fetch BHP statistics - Total Peminjam and Total Item
    useEffect(() => {
        const fetchStatistics = async () => {
            setLoadingStats(true);
            setStatsError(null);
            
            try {
                // Use the dedicated API endpoints for statistics
                const totalBHPResponse = await getTotalBHP();
                const totalPeminjamResponse = await getTotalPeminjam();
                
                // Extract the values using the correct field names from the responses
                const bhpCount = totalBHPResponse.total_stock_akhir || 0;
                const peminjamCount = totalPeminjamResponse.total_unique_peminjam || 0;
                
                setTotalItems(bhpCount);
                setTotalPeminjam(peminjamCount);
                
                setStatsError(null);
            } catch (error) {
                console.error("Error fetching BHP statistics:", error);
                setStatsError("Failed to load statistics");
            } finally {
                setLoadingStats(false);
            }
        };
        
        fetchStatistics();
    }, []);

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
                        {loadingChart ? (
                            <div className="chart-loading">Loading expense data...</div>
                        ) : chartError ? (
                            <div className="chart-error">{chartError}</div>
                        ) : (
                            <div ref={chartRef} className="apex-chart-wrapper"></div>
                        )}
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