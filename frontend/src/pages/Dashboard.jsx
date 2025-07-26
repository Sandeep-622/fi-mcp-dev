import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

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

  useEffect(() => {
    if (!sessionId) return;
    const fetchData = async () => {
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
      setLoading(false);
    };
    fetchData();
  }, [sessionId]);

  if (loading) return <div>Loading financial data...</div>;

  return (
    <div className="dashboard">
      <h2>Welcome, {sessionId}</h2>
      <div className="dashboard-content">
        {tools.map(tool => (
          <div key={tool} className="dashboard-section">
            <h3>{tool.replace(/_/g, " ")}</h3>
            <pre>{JSON.stringify(data[tool], null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
