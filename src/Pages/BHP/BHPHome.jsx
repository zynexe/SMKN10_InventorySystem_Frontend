import React, { useState, useEffect, useRef } from "react";
import ApexCharts from 'apexcharts'

import { useNavigate } from "react-router-dom";
import calendarYear from "../../assets/calenderYear.png"; 
import SidebarBHP from '../../Layout/SidebarBHP'; 
import Dropdown from "../../Components/Dropdown"; 
import ProfileBar from "../../Components/ProfileBar"; 
import BalanceModal from "../../Components/BalanceModal";

// Import API functions
import { 
  getBalance, 
  addBalance, 
  updateBalance, 
  getAssets,
  getCurrentTotals,  // New import
  getTotalAssetCount, // New import
  getTotalGedungCount, // New import
  getTotalPriceByYear
} from "../../services/api";

function AssetHome() {
    const navigate = useNavigate();
    const chartRef = useRef(null);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 40 }, (_, index) => currentYear - index);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    
    // State for statistics
    const [rekapTahunan, setRekapTahunan] = useState(0);
    const [rekapBulanan, setRekapBulanan] = useState(0);
    const [totalGedung, setTotalGedung] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    
    // State for loading indicators
    const [loadingStats, setLoadingStats] = useState(true);
    const [statsError, setStatsError] = useState(null);
    
    // State for expenses data
    const [expensesData, setExpensesData] = useState({});
    
    // State for balance
    const [balance, setBalance] = useState(0);
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
    const [isLoadingBalance, setIsLoadingBalance] = useState(true);
    const [balanceError, setBalanceError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Function to format currency
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value).replace('IDR', 'Rp.');
    };

    // Fetch all statistics data
    useEffect(() => {
      const fetchAllStats = async () => {
        try {
          setLoadingStats(true);
          setStatsError(null);
          
          // Fetch monthly and yearly totals using the new endpoint
          const currentTotalsResponse = await getCurrentTotals();
          if (currentTotalsResponse) {
            setRekapTahunan(Number(currentTotalsResponse.yearly || 0));
            setRekapBulanan(Number(currentTotalsResponse.monthly || 0));
            console.log("Current totals loaded:", {
              yearly: currentTotalsResponse.yearly,
              monthly: currentTotalsResponse.monthly
            });
          }
          
          // Fetch total asset count
          const totalAssetsResponse = await getTotalAssetCount();
          if (totalAssetsResponse && totalAssetsResponse.data !== undefined) {
            setTotalItems(Number(totalAssetsResponse.data || 0));
            console.log("Total assets loaded:", totalAssetsResponse.data);
          }
          
          // Fetch total gedung count
          const totalGedungResponse = await getTotalGedungCount();
          if (totalGedungResponse && totalGedungResponse.data !== undefined) {
            setTotalGedung(Number(totalGedungResponse.data || 0));
            console.log("Total gedung loaded:", totalGedungResponse.data);
          }
          
        } catch (error) {
          console.error("Error fetching statistics:", error);
          setStatsError("Failed to load statistics data");
        } finally {
          setLoadingStats(false);
        }
      };
      
      fetchAllStats();
    }, [refreshTrigger]);
    
    // Fetch expense data for chart
    useEffect(() => {
      const fetchExpensesData = async () => {
        try {
          // Create an array of months
          const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", 
                         "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
          
          // Fetch assets
          const assetsResponse = await getAssets();
          let assets = [];
          
          if (Array.isArray(assetsResponse)) {
            assets = assetsResponse;
          } else if (assetsResponse && Array.isArray(assetsResponse.data)) {
            assets = assetsResponse.data;
          }
          
          // Calculate monthly expenses for each year
          const expenses = {};
          
          // Create data structure for years
          years.forEach(year => {
            expenses[year] = months.map(month => ({
              month,
              expenses: 0
            }));
          });
          
          // Populate with real data - FIX: multiply price by quantity
          assets.forEach(asset => {
            const purchaseDate = new Date(asset.tanggal || asset.tanggal_pembelian);
            const year = purchaseDate.getFullYear();
            const month = purchaseDate.getMonth();
            
            // Get price, handling different formats and parsing
            let price = 0;
            if (typeof asset.harga === 'string') {
              // Remove non-numeric characters if price is string format like "Rp. 9.743.000"
              price = parseFloat(asset.harga.replace(/[^\d]/g, ''));
            } else {
              price = Number(asset.harga) || 0;
            }
            
            // Get quantity, default to 1 if not specified
            const quantity = Number(asset.jumlah) || 1;
            
            // Calculate total expense for this asset
            const totalExpense = price * quantity;
            
            if (expenses[year] && expenses[year][month]) {
              expenses[year][month].expenses += totalExpense;
            }
          });
          
          setExpensesData(expenses);
          console.log('Updated expenses data:', expenses);
          
        } catch (error) {
          console.error("Error fetching expenses data:", error);
        }
      };
      
      fetchExpensesData();
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

    // Fetch balance
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
    }, [refreshTrigger]);

    // Function to toggle year dropdown
    const toggleYearDropdown = (isOpen) => {
      setIsYearDropdownOpen(isOpen !== undefined ? isOpen : !isYearDropdownOpen);
    };

    const handleYearSelect = (year) => {
      setSelectedYear(parseInt(year));
      setIsYearDropdownOpen(false);
    };

    // Handle balance update
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
    
    const handleCardClick = (route) => {
      navigate(route); 
    };

    return (
        <div className="asset-home-container">
            {/* Sidebar/Navbar */}
            <SidebarBHP />
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
                        <h3>Asset Statistics</h3>
                    </div>
                    <div className="dashboard-cards">
                        <div className="card-statistic" onClick={() => handleCardClick("/gedung")}>
                            <h3>
                                Total Gedung <span className="card-arrow">→</span>
                            </h3>
                            {loadingStats ? (
                                <h2>Loading...</h2>
                            ) : statsError ? (
                                <h2 className="error-text">Error</h2>
                            ) : (
                                <h2>{totalGedung}</h2>
                            )}
                        </div>
                        <div className="card-statistic" onClick={() => handleCardClick("/asset-page")}>
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

export default AssetHome;