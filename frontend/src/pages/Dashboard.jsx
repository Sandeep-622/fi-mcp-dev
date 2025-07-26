import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const tools = [
  "fetch_net_worth",
  "fetch_bank_transactions",
  "fetch_credit_report",
  "fetch_epf_details",
  "fetch_mf_transactions",
  "fetch_stock_transactions"
];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Dashboard = () => {
  const query = useQuery();
  const sessionId = query.get("sessionId");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [userPhone, setUserPhone] = useState('Unknown');
  const [dashboardData, setDashboardData] = useState({
    netWorth: 0,
    bankBalance: 0,
    cashFlow: 0,
    transactions: [],
    assets: {},
    financialStats: {}
  });

  useEffect(() => {
    if (!sessionId) {
      const newSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      alert('No session ID found. Redirecting to login...');
      window.location.href = `http://localhost:8080/mockWebPage?sessionId=${newSessionId}`;
      return;
    }
    loadDashboardData();
  }, [sessionId]);

  const loadDashboardData = async () => {
    try {
      // Validate session and get user info
      const sessionInfo = await validateSession();
      if (!sessionInfo.valid) {
        throw new Error('Invalid session');
      }
      
      setUserPhone(sessionInfo.phoneNumber || 'Unknown');
      
      // Fetch all data
      let allData = {};
      for (let tool of tools) {
        try {
          const res = await fetch(`http://localhost:8080/tool?sessionId=${sessionId}&tool=${tool}`);
          allData[tool] = await res.json();
        } catch (e) {
          allData[tool] = { error: "Failed to fetch" };
        }
      }
      setData(allData);
      
      // Process data for dashboard
      processDashboardData(allData);
      setLoading(false);
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      if (error.message.includes('session') || error.message.includes('auth')) {
        const newSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        alert('Session expired. Redirecting to login...');
        window.location.href = `http://localhost:8080/mockWebPage?sessionId=${newSessionId}`;
      }
      setLoading(false);
    }
  };

  const validateSession = async () => {
    const response = await fetch(`http://localhost:8080/check-session?sessionId=${sessionId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  };

  const processDashboardData = (allData) => {
    let processedData = {
      netWorth: 0,
      bankBalance: 0,
      cashFlow: 0,
      transactions: [],
      assets: {},
      financialStats: {}
    };

    // Process Net Worth
    if (allData.fetch_net_worth && allData.fetch_net_worth.netWorthResponse) {
      const netWorthData = allData.fetch_net_worth.netWorthResponse;
      if (netWorthData.totalNetWorthValue) {
        processedData.netWorth = parseFloat(netWorthData.totalNetWorthValue.units || 0);
      }
      
      // Process Assets
      if (netWorthData.assetValues) {
        netWorthData.assetValues.forEach(asset => {
          const assetType = asset.netWorthAttribute.replace('ASSET_TYPE_', '').replace('_', ' ');
          const value = parseFloat(asset.value.units || 0);
          processedData.assets[assetType] = value;
        });
      }
    }

    // Process Bank Transactions
    if (allData.fetch_bank_transactions && allData.fetch_bank_transactions.bankTransactions) {
      const transactions = processTransactions(allData.fetch_bank_transactions.bankTransactions);
      processedData.transactions = transactions;
      processedData.bankBalance = getLatestBalance(transactions);
      processedData.cashFlow = calculateMonthlyCashFlow(transactions);
    }

    // Process Financial Stats
    processedData.financialStats = {
      netWorth: allData.fetch_net_worth,
      credit: allData.fetch_credit_report,
      mutualFunds: allData.fetch_mf_transactions,
      stocks: allData.fetch_stock_transactions
    };

    setDashboardData(processedData);
  };

  const processTransactions = (bankData) => {
    const transactions = [];
    
    bankData.forEach(bank => {
      const bankName = bank.bank || 'Unknown';
      bank.txns.forEach(txn => {
        if (txn.length >= 6) {
          transactions.push({
            bank: bankName,
            amount: parseFloat(txn[0]),
            narration: txn[1],
            date: new Date(txn[2]),
            type: parseInt(txn[3]),
            mode: txn[4],
            balance: parseFloat(txn[5])
          });
        }
      });
    });
    
    return transactions.sort((a, b) => b.date - a.date);
  };

  const getLatestBalance = (transactions) => {
    return transactions.length > 0 ? transactions[0].balance : 0;
  };

  const calculateMonthlyCashFlow = (transactions) => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const recentTransactions = transactions.filter(t => t.date >= oneMonthAgo);
    const credits = recentTransactions.filter(t => t.type === 1).reduce((sum, t) => sum + t.amount, 0);
    const debits = recentTransactions.filter(t => t.type === 2).reduce((sum, t) => sum + t.amount, 0);
    
    return credits - debits;
  };

  const categorizeTransaction = (narration) => {
    const n = narration.toUpperCase();
    if (n.includes('SALARY')) return 'Salary';
    if (n.includes('RENT')) return 'Rent';
    if (n.includes('GROCERY') || n.includes('GROCER')) return 'Groceries';
    if (n.includes('FUEL') || n.includes('PETROL')) return 'Fuel';
    if (n.includes('CREDIT CARD')) return 'Credit Card';
    if (n.includes('SIP') || n.includes('MUTUAL')) return 'Investments';
    if (n.includes('UPI')) return 'UPI Payments';
    return 'Others';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const logout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userPhone');
      localStorage.removeItem('loginTime');
      
      const newSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      window.location.href = `http://localhost:8080/mockWebPage?sessionId=${newSessionId}`;
    }
  };

  // Chart data preparation
  const getTransactionChartData = () => {
    const monthlyData = {};
    dashboardData.transactions.forEach(txn => {
      const monthKey = txn.date.toISOString().substring(0, 7);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { credits: 0, debits: 0 };
      }
      
      if (txn.type === 1) {
        monthlyData[monthKey].credits += txn.amount;
      } else if (txn.type === 2) {
        monthlyData[monthKey].debits += txn.amount;
      }
    });
    
    const sortedMonths = Object.keys(monthlyData).sort();
    const credits = sortedMonths.map(month => monthlyData[month].credits);
    const debits = sortedMonths.map(month => monthlyData[month].debits);
    
    return {
      labels: sortedMonths,
      datasets: [{
        label: 'Credits',
        data: credits,
        borderColor: '#52c41a',
        backgroundColor: 'rgba(82, 196, 26, 0.1)',
        tension: 0.4
      }, {
        label: 'Debits',
        data: debits,
        borderColor: '#ff4d4f',
        backgroundColor: 'rgba(255, 77, 79, 0.1)',
        tension: 0.4
      }]
    };
  };

  const getCategoryChartData = () => {
    const categories = {};
    dashboardData.transactions.filter(t => t.type === 2).forEach(txn => {
      const category = categorizeTransaction(txn.narration);
      categories[category] = (categories[category] || 0) + txn.amount;
    });
    
    return {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: [
          '#20d4aa', '#ff4d4f', '#1890ff', '#faad14',
          '#52c41a', '#722ed1', '#eb2f96', '#fa8c16'
        ]
      }]
    };
  };

  const getAssetChartData = () => {
    return {
      labels: Object.keys(dashboardData.assets),
      datasets: [{
        data: Object.values(dashboardData.assets),
        backgroundColor: [
          '#20d4aa', '#1890ff', '#faad14', '#52c41a',
          '#722ed1', '#eb2f96', '#fa8c16', '#13c2c2'
        ]
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#ffffff' }
      }
    },
    scales: {
      x: { ticks: { color: '#b0b0b0' } },
      y: { ticks: { color: '#b0b0b0' } }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#ffffff' }
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div>Loading financial data...</div>
      </div>
    );
  }

  return (
    <div style={styles.body}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>
          <span style={{color: '#20d4aa'}}>Fi</span>
          <span style={{color: '#ffffff'}}>MCP</span>
          <span style={{color: '#888', fontSize: '12px', fontWeight: 'normal'}}>DASHBOARD</span>
        </div>
        <div style={styles.userInfo}>
          <span>User: <span>{userPhone}</span></span>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Main Container */}
      <div style={styles.container}>
        <button style={styles.refreshBtn} onClick={loadDashboardData}>
          🔄 Refresh Data
        </button>
        
        {/* Metric Cards */}
        <div style={styles.dashboardGrid}>
          <div style={{...styles.card, ...styles.metricCard}}>
            <div style={styles.metricValue}>{formatCurrency(dashboardData.netWorth)}</div>
            <div style={styles.metricLabel}>Total Net Worth</div>
          </div>
          
          <div style={{...styles.card, ...styles.metricCard}}>
            <div style={styles.metricValue}>{formatCurrency(dashboardData.bankBalance)}</div>
            <div style={styles.metricLabel}>Current Bank Balance</div>
          </div>
          
          <div style={{...styles.card, ...styles.metricCard}}>
            <div style={styles.metricValue}>{formatCurrency(dashboardData.cashFlow)}</div>
            <div style={styles.metricLabel}>Monthly Cash Flow</div>
          </div>
        </div>

        {/* Charts */}
        <div style={styles.dashboardGrid}>
          {/* Asset Allocation Chart */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              📊 Asset Allocation
            </div>
            <div style={styles.chartContainer}>
              {Object.keys(dashboardData.assets).length > 0 ? (
                <Pie data={getAssetChartData()} options={pieChartOptions} />
              ) : (
                <div style={styles.loading}>No asset data available</div>
              )}
            </div>
          </div>
          
          {/* Monthly Transactions Chart */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              📈 Monthly Transactions
            </div>
            <div style={styles.chartContainer}>
              {dashboardData.transactions.length > 0 ? (
                <Line data={getTransactionChartData()} options={chartOptions} />
              ) : (
                <div style={styles.loading}>No transaction data available</div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.dashboardGrid}>
          {/* Transaction Categories */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              🏷 Spending Categories
            </div>
            <div style={styles.chartContainer}>
              {dashboardData.transactions.length > 0 ? (
                <Doughnut data={getCategoryChartData()} options={pieChartOptions} />
              ) : (
                <div style={styles.loading}>No transaction data available</div>
              )}
            </div>
          </div>
          
          {/* Recent Transactions */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              💳 Recent Transactions
            </div>
            <div style={styles.transactionList}>
              {dashboardData.transactions.slice(0, 10).map((txn, index) => (
                <div key={index} style={styles.transactionItem}>
                  <div style={styles.transactionInfo}>
                    <div style={styles.transactionNarration}>{txn.narration}</div>
                    <div style={styles.transactionDate}>{txn.date.toLocaleDateString()}</div>
                  </div>
                  <div style={{
                    ...styles.transactionAmount,
                    color: txn.type === 1 ? '#52c41a' : '#ff4d4f'
                  }}>
                    {txn.type === 1 ? '+' : '-'}{formatCurrency(Math.abs(txn.amount))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financial Stats */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            📋 Financial Overview
          </div>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{formatCurrency(dashboardData.netWorth)}</div>
              <div style={styles.statLabel}>Total Assets</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>
                {dashboardData.financialStats.credit?.creditReports?.[0]?.creditReportData?.creditAccount?.creditAccountSummary?.account?.creditAccountActive || 0}
              </div>
              <div style={styles.statLabel}>Credit Accounts</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>
                {dashboardData.financialStats.mutualFunds?.mfSchemeAnalytics?.schemeAnalytics?.length || 0}
              </div>
              <div style={styles.statLabel}>MF Holdings</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>
                {Object.values(dashboardData.financialStats.stocks?.accountDetailsBulkResponse?.accountDetailsMap || {}).filter(acc => acc.equitySummary).length}
              </div>
              <div style={styles.statLabel}>Stock Holdings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  body: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    minHeight: '100vh',
    color: '#ffffff',
    margin: 0,
    padding: 0
  },
  header: {
    background: 'rgba(45, 45, 45, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    color: '#b0b0b0'
  },
  logoutBtn: {
    background: '#ff4d4f',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background 0.3s ease'
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px'
  },
  refreshBtn: {
    background: '#20d4aa',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background 0.3s ease',
    marginBottom: '20px'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '30px',
    marginBottom: '40px'
  },
  card: {
    background: 'rgba(45, 45, 45, 0.8)',
    borderRadius: '16px',
    padding: '30px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)'
  },
  metricCard: {
    background: 'linear-gradient(135deg, #20d4aa 0%, #1bc4a0 100%)',
    color: 'white',
    textAlign: 'center'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#20d4aa',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  metricValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  metricLabel: {
    fontSize: '14px',
    opacity: 0.9
  },
  chartContainer: {
    position: 'relative',
    height: '300px',
    marginTop: '20px'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: '#b0b0b0'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  statItem: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#20d4aa',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#b0b0b0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  transactionList: {
    maxHeight: '400px',
    overflowY: 'auto'
  },
  transactionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  transactionInfo: {
    flex: 1
  },
  transactionNarration: {
    fontWeight: '500',
    marginBottom: '5px'
  },
  transactionDate: {
    fontSize: '12px',
    color: '#b0b0b0'
  },
  transactionAmount: {
    fontWeight: 'bold',
    fontSize: '16px'
  }
};

export default Dashboard;