import React, { useState, useEffect, useRef } from "react";
import ApexCharts from 'apexcharts'
import '../../CSS/Asset.css'; 
import { useNavigate } from "react-router-dom";
import calendarYear from "../../assets/calenderYear.png"; 
import SidebarBHP from '../../Layout/SidebarBHP'; 
import Dropdown from "../../Components/Dropdown"; 
import ProfileBar from "../../Components/ProfileBar"; 
// Remove BalanceModal import since we're not using it anymore
// import BalanceModal from "../../Components/BalanceModal";
import api, { 
  getMonthlyExpenses, 
  getTotalBHP, 
  getTotalPeminjam,
  // Remove balance-related imports
  // getBalance,
  // addBalance,
  // updateBalance,
  getBHPs
} from '../../services/api'; 

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
    
    // Replace balance state with totalBHPValue
    const [totalBHPValue, setTotalBHPValue] = useState(0);
    const [isLoadingTotalValue, setIsLoadingTotalValue] = useState(true);
    const [totalValueError, setTotalValueError] = useState(null);
    // Remove balance modal state
    // const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // Keep the event listener but change it to refresh total value instead of balance
    useEffect(() => {
      const handleBalanceUpdate = () => {
        console.log('BHP update event received in BHPHome');
        setRefreshTrigger(prev => prev + 1);
      };

      // Add event listener
      window.addEventListener('bhp-balance-updated', handleBalanceUpdate);

      return () => {
        window.removeEventListener('bhp-balance-updated', handleBalanceUpdate);
      };
    }, []);

    // Replace balance fetch with total BHP value calculation
    const calculateTotalBHPValue = async () => {
      try {
        setIsLoadingTotalValue(true);
        setTotalValueError(null);
        
        const bhpItems = await getBHPs();
        
        let items = [];
        if (bhpItems && bhpItems.data) {
          items = bhpItems.data;
        } else if (Array.isArray(bhpItems)) {
          items = bhpItems;
        }
        
        let totalValue = 0;
        
        items.forEach((item) => {
          const stockAkhir = Math.max(
            parseInt(item.stock_akhir || 0), 
            parseInt(item['Stock Akhir'] || 0)
          );
          
          const hargaSatuan = parseInt(item.harga_satuan || item['Harga Satuan'] || item.harga || 0);
          
          const itemTotal = stockAkhir * hargaSatuan;
          totalValue += itemTotal;
        });
        
        setTotalBHPValue(totalValue);
        setTotalValueError(null);
      } catch (error) {
        console.error('Failed to calculate total BHP value:', error);
        setTotalValueError('Failed to load total value');
      } finally {
        setIsLoadingTotalValue(false);
      }
    };
    
    // Load total BHP value on component mount and when refreshTrigger changes
    useEffect(() => {
      calculateTotalBHPValue();
    }, [refreshTrigger]);
    
    useEffect(() => {
        const fetchMonthlyExpenses = async () => {
            setLoadingChart(true);
            setChartError(null);
            setLoadingStats(true);
            
            try {
            
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
           
            while (chartRef.current.firstChild) {
                chartRef.current.removeChild(chartRef.current.firstChild);
            }
            
            // Format monthly data for the chart based on the object structure
            const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            
          
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

    
    const toggleYearDropdown = (isOpen) => {
        setIsYearDropdownOpen(isOpen !== undefined ? isOpen : !isYearDropdownOpen);
    };

    const handleYearSelect = (year) => {
        setSelectedYear(parseInt(year));
        setIsYearDropdownOpen(false);
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
                            onClick={() => navigate('/bhp-page')} // Navigate to BHP page instead of opening modal
                        >
                            <h3>Total BHP</h3>
                            {isLoadingTotalValue ? (
                                <p>Loading...</p>
                            ) : totalValueError ? (
                                <p className="error-text">Error loading value</p>
                            ) : (
                                <p>Rp. {totalBHPValue.toLocaleString('id-ID')}</p>
                            )}
                        </div>
                        <div className="card non-clickable tooltip-container">
                            <div className="tooltip">Total expenses for {selectedYear}</div>
                            <h3>Rekap Tahunan</h3>
                            {loadingStats ? (
                                <p>Loading...</p>
                            ) : statsError ? (
                                <p className="error-text">Error loading data</p>
                            ) : (
                                <p>Rp. {rekapTahunan.toLocaleString('id-ID')}</p>
                            )}
                        </div>
                        <div className="card non-clickable tooltip-container">
                            <div className="tooltip">
                                Total expenses for {new Date().toLocaleString('default', { month: 'long' })} {currentYear}
                            </div>
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
                    
                    {/* Remove the BalanceModal */}

                    <div className="chart-container">
                        <div className="chart-header">
                            <h3>Pengeluaran Bulanan</h3>
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
                        <h3>Statistik BHP</h3>
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