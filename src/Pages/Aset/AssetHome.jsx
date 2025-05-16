import React, { useState, useEffect, useRef } from "react";
import ApexCharts from 'apexcharts'
import '../../CSS/Asset.css'; 
import { useNavigate } from "react-router-dom";
import calendarYear from "../../assets/calenderYear.png"; 
import Sidebar from '../../Layout/Sidebar'; 
import Dropdown from "../../Components/Dropdown"; 
import ProfileBar from "../../Components/ProfileBar"; 

// Import API functions
import { 
  getAssets,
  getCurrentTotals,  
  getTotalAssetCount, 
  getTotalGedungCount, 
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
    const [totalLokasi, setTotalLokasi] = useState(0); 
    const [totalAssets, setTotalAssets] = useState(0);  
    
    // State for loading indicators
    const [loadingStats, setLoadingStats] = useState(true);
    const [statsError, setStatsError] = useState(null);
    
    // State for expenses data
    const [expensesData, setExpensesData] = useState({});
    const [totalAssetValue, setTotalAssetValue] = useState(0);
    const [isLoadingTotalValue, setIsLoadingTotalValue] = useState(true);
    const [totalValueError, setTotalValueError] = useState(null);
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
          
          // Run all API calls in parallel
          const [currentTotalsResponse, totalAssetsResponse, totalLokasiResponse] = await Promise.all([
            getCurrentTotals(),
            getTotalAssetCount(),
            getTotalGedungCount()
          ]);
          
          // Process results after all requests complete
          if (currentTotalsResponse) {
            setRekapTahunan(Number(currentTotalsResponse.total_harga_current_year || 0));
            setRekapBulanan(Number(currentTotalsResponse.total_harga_current_month || 0));
          }
          
          if (totalAssetsResponse && totalAssetsResponse.total_assets !== undefined) {
            setTotalAssets(Number(totalAssetsResponse.total_assets || 0));
          }
          
          if (totalLokasiResponse && totalLokasiResponse.total_lokasi !== undefined) {
            setTotalLokasi(Number(totalLokasiResponse.total_lokasi || 0));
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
    
    // Calculate total asset value from all assets
    useEffect(() => {
      const calculateTotalAssetValue = async () => {
        try {
          setIsLoadingTotalValue(true);
          setTotalValueError(null);
          
          const assetsResponse = await getAssets();
          let assets = [];
          
          if (Array.isArray(assetsResponse)) {
            assets = assetsResponse;
          } else if (assetsResponse && Array.isArray(assetsResponse.data)) {
            assets = assetsResponse.data;
          }
          
          let totalValue = 0;
          assets.forEach((item) => {
            // Handle both backend and frontend data formats
            let price = 0;
            if (typeof item.harga === 'string' && item.harga.includes('Rp')) {
              price = parseFloat(item.harga.replace("Rp.", "").replace(/\./g, "").replace(/,/g, ""));
            } else {
              price = parseFloat(item.harga || 0);
            }
            
            totalValue += price * (parseInt(item.jumlah) || 1);
          });
          
          setTotalAssetValue(totalValue);
          
        } catch (error) {
          console.error('Error calculating total asset value:', error);
          setTotalValueError('Failed to calculate total asset value');
        } finally {
          setIsLoadingTotalValue(false);
        }
      };
      
      calculateTotalAssetValue();
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
          
          const expensesByYear = {};
          
          // Process assets in a single pass
          assets.forEach(asset => {
            if (!asset.tanggal && !asset.tanggal_pembelian) return;
            
            const purchaseDate = new Date(asset.tanggal || asset.tanggal_pembelian);
            const year = purchaseDate.getFullYear();
            const month = purchaseDate.getMonth();
            
            // Parse price more efficiently
            let price = 0;
            if (typeof asset.harga === 'string') {
              price = parseFloat(asset.harga.replace(/[^\d]/g, ''));
            } else {
              price = Number(asset.harga) || 0;
            }
            
            const quantity = Number(asset.jumlah) || 1;
            const totalExpense = price * quantity;
            
         
            if (!expensesByYear[year]) {
              expensesByYear[year] = Array(12).fill(0);
            }

            expensesByYear[year][month] += totalExpense;
          });
          
          // Convert to the required format for the chart
          const expenses = {};
          years.forEach(year => {
            if (expensesByYear[year]) {
              expenses[year] = months.map((month, index) => ({
                month,
                expenses: expensesByYear[year][index] || 0
              }));
            } else {
              expenses[year] = months.map(month => ({ month, expenses: 0 }));
            }
          });
          
          setExpensesData(expenses);
          
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

    // Function to toggle year dropdown
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
                            onClick={() => navigate('/asset-page')} 
                        >
                            <h3>Total Aset</h3>
                            {isLoadingTotalValue ? (
                                <p>Loading...</p>
                            ) : totalValueError ? (
                                <p className="error-text">Error loading total value</p>
                            ) : (
                                <p>Rp. {totalAssetValue.toLocaleString('id-ID')}</p>
                            )}
                        </div>
                        <div className="card non-clickable tooltip-container">
                            <div className="tooltip">Total expenses for {currentYear}</div>
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
                        <div ref={chartRef} className="apex-chart-wrapper"></div>
                    </div>
                    
                    <div className="header">
                        <h3>Statistik Aset</h3>
                    </div>
                    <div className="dashboard-cards">
                        <div className="card-statistic" onClick={() => handleCardClick("/gedung")}>
                            <h3>
                                Total Lokasi <span className="card-arrow">→</span>
                            </h3>
                            {loadingStats ? (
                                <h2>Loading...</h2>
                            ) : statsError ? (
                                <h2 className="error-text">Error</h2>
                            ) : (
                                <h2>{totalLokasi}</h2> 
                            )}
                        </div>
                        <div className="card-statistic" onClick={() => handleCardClick("/asset-page")}>
                            <h3>
                                Total Assets <span className="card-arrow">→</span>
                            </h3>
                            {loadingStats ? (
                                <h2>Loading...</h2>
                            ) : statsError ? (
                                <h2 className="error-text">Error</h2>
                            ) : (
                                <h2>{totalAssets}</h2> 
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AssetHome;