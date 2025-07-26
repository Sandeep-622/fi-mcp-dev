import React, { useEffect, useState, useRef } from "react";
// Custom hook for animated count up effect
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef();
  useEffect(() => {
    let start = 0;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(Math.floor(progress * (target - start) + start));
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };
    raf.current = requestAnimationFrame(animate);
    return () => raf.current && cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}
import { useLocation, useNavigate } from "react-router-dom";
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


const palette = {
  light: {
    background: 'linear-gradient(135deg, #f7fafc 0%, #e3e9f3 100%)',
    card: '#ffffff',
    text: '#22223b',
    accent: '#4f8cff',
    accent2: '#20d4aa',
    border: '#e0e0e0',
    faded: '#f0f4fa',
    statBg: '#f5f7fa',
    statText: '#4f8cff',
    label: '#6c757d',
    shadow: '0 2px 12px 0 rgba(79, 140, 255, 0.08)'
  },
  dark: {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    card: 'rgba(45, 45, 45, 0.8)',
    text: '#ffffff',
    accent: '#20d4aa',
    accent2: '#1890ff',
    border: 'rgba(255, 255, 255, 0.1)',
    faded: 'rgba(255,255,255,0.05)',
    statBg: 'rgba(255,255,255,0.05)',
    statText: '#20d4aa',
    label: '#b0b0b0',
    shadow: '0 2px 12px 0 rgba(32, 212, 170, 0.08)'
  }
};

const Dashboard = () => {
  const query = useQuery();
  const sessionId = query.get("sessionId");
  const navigate = useNavigate();
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
  const [theme, setTheme] = useState(() => localStorage.getItem('fimcp_theme') || 'light');
  const toggleTheme = () => {
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light';
      localStorage.setItem('fimcp_theme', next);
      return next;
    });
  };


  useEffect(() => {
    if (!sessionId) {
      const newSessionId = 'temp1';
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
        const newSessionId = 'temp1';
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
      navigate('/');
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

  // Animated metric values using useCountUp (call hooks only once per render)
  const animatedNetWorth = useCountUp(dashboardData.netWorth);
  const animatedBankBalance = useCountUp(dashboardData.bankBalance);
  const animatedCashFlow = useCountUp(dashboardData.cashFlow);

  if (loading) {
    return (
      <div style={styles.loading}>
        <div>Loading financial data...</div>
      </div>
    );
  }

  // Theme palette
  const pal = palette[theme];

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: pal.background,
      color: pal.text,
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      width: '100vw',
      boxSizing: 'border-box',
      overflowX: 'hidden',
      transition: 'background 0.3s, color 0.3s'
    }}>
      {/* Header */}
      <div style={{
        background: theme === 'light' ? 'rgba(255,255,255,0.9)' : pal.card,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${pal.border}`,
        padding: window.innerWidth < 600 ? '12px 10px' : '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: window.innerWidth < 600 ? '16px' : '24px',
          fontWeight: 'bold',
          color: pal.accent
        }}>
          <span style={{color: pal.accent}}>Fi</span>
          <span style={{color: pal.text}}>MCP</span>
          <span style={{color: pal.label, fontSize: '12px', fontWeight: 'normal'}}>DASHBOARD</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <button
            onClick={toggleTheme}
            style={{
              background: pal.faded,
              color: pal.text,
              border: `1px solid ${pal.border}`,
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s, color 0.2s',
              boxShadow: pal.shadow
            }}
            title="Toggle light/dark mode"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <span>User: <span>{userPhone}</span></span>
          <button style={{
            background: pal.accent,
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background 0.3s',
            fontWeight: 500
          }} onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Main Container */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: window.innerWidth < 600 ? '10px' : '40px',
        minHeight: '100vh',
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '16px'}}>
          <button
            style={{
              background: `linear-gradient(90deg, ${pal.accent} 0%, ${pal.accent2} 100%)`,
              color: '#fff',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 'bold',
              boxShadow: pal.shadow,
              transition: 'background 0.3s, transform 0.2s',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={() => navigate(`/qna?sessionId=${sessionId}&phone=${userPhone}`)}
          >
            🧠 Personal Smart Onboarding
          </button>
          <button
            style={{
              background: `linear-gradient(90deg, ${pal.accent2} 0%, ${pal.accent} 100%)`,
              color: '#fff',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 'bold',
              boxShadow: pal.shadow,
              transition: 'background 0.3s, transform 0.2s',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={() => navigate('/chat')}
          >
            💬 Chat with Assistant
          </button>
          <button style={{
            background: pal.accent,
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background 0.3s',
            marginBottom: '20px',
            fontWeight: 500
          }} onClick={loadDashboardData}>
            🔄 Refresh Data
          </button>
        </div>

        {/* Metric Cards with animated numbers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 600 ? '1fr' : 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: window.innerWidth < 600 ? '16px' : '30px',
          marginBottom: window.innerWidth < 600 ? '20px' : '40px'
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${pal.accent2} 0%, ${pal.accent} 100%)`,
            color: '#fff',
            textAlign: 'center',
            fontSize: window.innerWidth < 600 ? '14px' : 'inherit',
            borderRadius: '16px',
            padding: window.innerWidth < 600 ? '16px' : '30px',
            boxShadow: pal.shadow,
            animation: 'fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1)'
          }}>
            <div style={{fontSize: window.innerWidth < 600 ? '22px' : '36px', fontWeight: 'bold', marginBottom: '8px'}}>{formatCurrency(animatedNetWorth)}</div>
            <div style={{fontSize: '14px', opacity: 0.9}}>Total Net Worth</div>
          </div>
          <div style={{
            background: `linear-gradient(135deg, ${pal.accent2} 0%, ${pal.accent} 100%)`,
            color: '#fff',
            textAlign: 'center',
            fontSize: window.innerWidth < 600 ? '14px' : 'inherit',
            borderRadius: '16px',
            padding: window.innerWidth < 600 ? '16px' : '30px',
            boxShadow: pal.shadow,
            animation: 'fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1)'
          }}>
            <div style={{fontSize: window.innerWidth < 600 ? '22px' : '36px', fontWeight: 'bold', marginBottom: '8px'}}>{formatCurrency(animatedBankBalance)}</div>
            <div style={{fontSize: '14px', opacity: 0.9}}>Current Bank Balance</div>
          </div>
          <div style={{
            background: `linear-gradient(135deg, ${pal.accent2} 0%, ${pal.accent} 100%)`,
            color: '#fff',
            textAlign: 'center',
            fontSize: window.innerWidth < 600 ? '14px' : 'inherit',
            borderRadius: '16px',
            padding: window.innerWidth < 600 ? '16px' : '30px',
            boxShadow: pal.shadow,
            animation: 'fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1)'
          }}>
            <div style={{fontSize: window.innerWidth < 600 ? '22px' : '36px', fontWeight: 'bold', marginBottom: '8px'}}>{formatCurrency(animatedCashFlow)}</div>
            <div style={{fontSize: '14px', opacity: 0.9}}>Monthly Cash Flow</div>
          </div>
        </div>

        {/* Charts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 600 ? '1fr' : 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: window.innerWidth < 600 ? '16px' : '30px',
          marginBottom: window.innerWidth < 600 ? '20px' : '40px'
        }}>
          {/* Asset Allocation Chart */}
          <div style={{
            background: pal.card,
            borderRadius: '16px',
            padding: window.innerWidth < 600 ? '16px' : '30px',
            border: `1px solid ${pal.border}`,
            boxShadow: pal.shadow,
            animation: 'fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1)'
          }}>
            <div style={{fontSize: window.innerWidth < 600 ? '16px' : '20px', fontWeight: '600', marginBottom: window.innerWidth < 600 ? '10px' : '20px', color: pal.accent, display: 'flex', alignItems: 'center', gap: '10px'}}>📊 Asset Allocation</div>
            <div style={{position: 'relative', height: window.innerWidth < 600 ? '200px' : '300px', marginTop: window.innerWidth < 600 ? '10px' : '20px'}}>
              {Object.keys(dashboardData.assets).length > 0 ? (
                <Pie data={getAssetChartData()} options={pieChartOptions} />
              ) : (
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: pal.label}}>No asset data available</div>
              )}
            </div>
          </div>
          {/* Monthly Transactions Chart */}
          <div style={{
            background: pal.card,
            borderRadius: '16px',
            padding: window.innerWidth < 600 ? '16px' : '30px',
            border: `1px solid ${pal.border}`,
            boxShadow: pal.shadow,
            animation: 'fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1)'
          }}>
            <div style={{fontSize: window.innerWidth < 600 ? '16px' : '20px', fontWeight: '600', marginBottom: window.innerWidth < 600 ? '10px' : '20px', color: pal.accent, display: 'flex', alignItems: 'center', gap: '10px'}}>📈 Monthly Transactions</div>
            <div style={{position: 'relative', height: window.innerWidth < 600 ? '200px' : '300px', marginTop: window.innerWidth < 600 ? '10px' : '20px'}}>
              {dashboardData.transactions.length > 0 ? (
                <Line data={getTransactionChartData()} options={chartOptions} />
              ) : (
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: pal.label}}>No transaction data available</div>
              )}
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 600 ? '1fr' : 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: window.innerWidth < 600 ? '16px' : '30px',
          marginBottom: window.innerWidth < 600 ? '20px' : '40px'
        }}>
          {/* Transaction Categories */}
          <div style={{
            background: pal.card,
            borderRadius: '16px',
            padding: window.innerWidth < 600 ? '16px' : '30px',
            border: `1px solid ${pal.border}`,
            boxShadow: pal.shadow,
            animation: 'fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1)'
          }}>
            <div style={{fontSize: window.innerWidth < 600 ? '16px' : '20px', fontWeight: '600', marginBottom: window.innerWidth < 600 ? '10px' : '20px', color: pal.accent, display: 'flex', alignItems: 'center', gap: '10px'}}>🏷 Spending Categories</div>
            <div style={{position: 'relative', height: window.innerWidth < 600 ? '200px' : '300px', marginTop: window.innerWidth < 600 ? '10px' : '20px'}}>
              {dashboardData.transactions.length > 0 ? (
                <Doughnut data={getCategoryChartData()} options={pieChartOptions} />
              ) : (
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: pal.label}}>No transaction data available</div>
              )}
            </div>
          </div>
          {/* Recent Transactions */}
          <div style={{
            background: pal.card,
            borderRadius: '16px',
            padding: window.innerWidth < 600 ? '16px' : '30px',
            border: `1px solid ${pal.border}`,
            boxShadow: pal.shadow,
            animation: 'fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1)'
          }}>
            <div style={{fontSize: window.innerWidth < 600 ? '16px' : '20px', fontWeight: '600', marginBottom: window.innerWidth < 600 ? '10px' : '20px', color: pal.accent, display: 'flex', alignItems: 'center', gap: '10px'}}>💳 Recent Transactions</div>
            <div style={{maxHeight: window.innerWidth < 600 ? '220px' : '400px', overflowY: 'auto'}}>
              {dashboardData.transactions.slice(0, 10).map((txn, index) => (
                <div key={index} style={{
                  display: 'flex',
                  flexDirection: window.innerWidth < 600 ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: window.innerWidth < 600 ? 'flex-start' : 'center',
                  padding: window.innerWidth < 600 ? '8px 0' : '15px 0',
                  borderBottom: `1px solid ${pal.border}`
                }}>
                  <div style={{flex: 1}}>
                    <div style={{fontWeight: '500', marginBottom: '5px'}}>{txn.narration}</div>
                    <div style={{fontSize: '12px', color: pal.label}}>{txn.date.toLocaleDateString()}</div>
                  </div>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '16px',
                    color: txn.type === 1 ? pal.statText : '#ff4d4f'
                  }}>
                    {txn.type === 1 ? '+' : '-'}{formatCurrency(Math.abs(txn.amount))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financial Stats */}
        <div style={{
          background: pal.card,
          borderRadius: '16px',
          padding: window.innerWidth < 600 ? '16px' : '30px',
          border: `1px solid ${pal.border}`,
          boxShadow: pal.shadow,
          animation: 'fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1)'
        }}>
          <div style={{fontSize: window.innerWidth < 600 ? '16px' : '20px', fontWeight: '600', marginBottom: window.innerWidth < 600 ? '10px' : '20px', color: pal.accent, display: 'flex', alignItems: 'center', gap: '10px'}}>📋 Financial Overview</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 600 ? '1fr' : 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: window.innerWidth < 600 ? '10px' : '20px',
            marginTop: window.innerWidth < 600 ? '10px' : '20px'
          }}>
            <div style={{
              background: pal.statBg,
              padding: window.innerWidth < 600 ? '10px' : '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: window.innerWidth < 600 ? '16px' : '24px', fontWeight: 'bold', color: pal.statText, marginBottom: '5px'}}>{formatCurrency(dashboardData.netWorth)}</div>
              <div style={{fontSize: '12px', color: pal.label, textTransform: 'uppercase', letterSpacing: '0.5px'}}>Total Assets</div>
            </div>
            <div style={{
              background: pal.statBg,
              padding: window.innerWidth < 600 ? '10px' : '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: window.innerWidth < 600 ? '16px' : '24px', fontWeight: 'bold', color: pal.statText, marginBottom: '5px'}}>
                {dashboardData.financialStats.credit?.creditReports?.[0]?.creditReportData?.creditAccount?.creditAccountSummary?.account?.creditAccountActive || 0}
              </div>
              <div style={{fontSize: '12px', color: pal.label, textTransform: 'uppercase', letterSpacing: '0.5px'}}>Credit Accounts</div>
            </div>
            <div style={{
              background: pal.statBg,
              padding: window.innerWidth < 600 ? '10px' : '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: window.innerWidth < 600 ? '16px' : '24px', fontWeight: 'bold', color: pal.statText, marginBottom: '5px'}}>
                {dashboardData.financialStats.mutualFunds?.mfSchemeAnalytics?.schemeAnalytics?.length || 0}
              </div>
              <div style={{fontSize: '12px', color: pal.label, textTransform: 'uppercase', letterSpacing: '0.5px'}}>MF Holdings</div>
            </div>
            <div style={{
              background: pal.statBg,
              padding: window.innerWidth < 600 ? '10px' : '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: window.innerWidth < 600 ? '16px' : '24px', fontWeight: 'bold', color: pal.statText, marginBottom: '5px'}}>
                {Object.values(dashboardData.financialStats.stocks?.accountDetailsBulkResponse?.accountDetailsMap || {}).filter(acc => acc.equitySummary).length}
              </div>
              <div style={{fontSize: '12px', color: pal.label, textTransform: 'uppercase', letterSpacing: '0.5px'}}>Stock Holdings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Animation keyframes for fade-in
const fadeInKeyframes = {
  from: { opacity: 0, transform: 'translateY(30px)' },
  to: { opacity: 1, transform: 'translateY(0)' }
};

const styles = {
  body: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    color: '#ffffff',
    margin: 0,
    padding: 0,
    minHeight: '100vh',
    width: '100vw',
    boxSizing: 'border-box',
    overflowX: 'hidden',
  },
  header: {
    background: 'rgba(45, 45, 45, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: window.innerWidth < 600 ? '12px 10px' : '20px 40px',
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
    fontSize: window.innerWidth < 600 ? '16px' : '24px',
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
    padding: window.innerWidth < 600 ? '10px' : '40px',
    minHeight: '100vh',
    boxSizing: 'border-box',
    overflowY: 'auto',
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
    gridTemplateColumns: window.innerWidth < 600 ? '1fr' : 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: window.innerWidth < 600 ? '16px' : '30px',
    marginBottom: window.innerWidth < 600 ? '20px' : '40px'
  },
  card: {
    background: 'rgba(45, 45, 45, 0.8)',
    borderRadius: '16px',
    padding: window.innerWidth < 600 ? '16px' : '30px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 12px 0 rgba(32, 212, 170, 0.08)',
    animation: 'fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1)',
    transition: 'box-shadow 0.3s cubic-bezier(0.23, 1, 0.32, 1), transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  },
  metricCard: {
    background: 'linear-gradient(135deg, #20d4aa 0%, #1bc4a0 100%)',
    color: 'white',
    textAlign: 'center',
    fontSize: window.innerWidth < 600 ? '14px' : 'inherit'
  },
  cardTitle: {
    fontSize: window.innerWidth < 600 ? '16px' : '20px',
    fontWeight: '600',
    marginBottom: window.innerWidth < 600 ? '10px' : '20px',
    color: '#20d4aa',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  metricValue: {
    fontSize: window.innerWidth < 600 ? '22px' : '36px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  metricLabel: {
    fontSize: '14px',
    opacity: 0.9
  },
  chartContainer: {
    position: 'relative',
    height: window.innerWidth < 600 ? '200px' : '300px',
    marginTop: window.innerWidth < 600 ? '10px' : '20px'
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
    gridTemplateColumns: window.innerWidth < 600 ? '1fr' : 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: window.innerWidth < 600 ? '10px' : '20px',
    marginTop: window.innerWidth < 600 ? '10px' : '20px'
  },
  statItem: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: window.innerWidth < 600 ? '10px' : '20px',
    borderRadius: '12px',
    textAlign: 'center'
  },
  statValue: {
    fontSize: window.innerWidth < 600 ? '16px' : '24px',
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
    maxHeight: window.innerWidth < 600 ? '220px' : '400px',
    overflowY: 'auto'
  },
  transactionItem: {
    display: 'flex',
    flexDirection: window.innerWidth < 600 ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: window.innerWidth < 600 ? 'flex-start' : 'center',
    padding: window.innerWidth < 600 ? '8px 0' : '15px 0',
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

// Add fadeInUp keyframes to the document (only once)
if (typeof window !== 'undefined' && !window.__fadeInUpKeyframesInjected) {
  const style = document.createElement('style');
  style.innerHTML = `@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }`;
  document.head.appendChild(style);
  window.__fadeInUpKeyframesInjected = true;
}

export default Dashboard;