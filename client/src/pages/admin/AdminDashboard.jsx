import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  FaUsers,
  FaBoxOpen,
  FaDollarSign,
  FaChartLine,
  FaDownload,
} from "react-icons/fa";

const AdminDashboard = () => {

  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    sales: 0,
    monthlyUsers: 0,
    monthlySales: 0,
    weeklySales: 0,
    paidOrders: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/admin/stats");

        setStats({
          users: res.data.users || 0,
          orders: res.data.orders || 0,
          sales: res.data.sales || 0,
          monthlyUsers: res.data.monthlyUsers || 0,
          monthlySales: res.data.monthlySales || 0,
          weeklySales: res.data.weeklySales || 0,
          paidOrders: res.data.paidOrders || 0,
        });

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ FIXED
  const avgOrder =
    stats.orders > 0
      ? (stats.sales / stats.orders).toFixed(0)
      : 0;

  const conversionRate =
    stats.orders > 0
      ? ((stats.paidOrders / stats.orders) * 100).toFixed(1)
      : 0;

  const downloadReport = () => {
    const csv = `
Users,Orders,Sales,Monthly Users,Monthly Sales,Weekly Sales
${stats.users},${stats.orders},${stats.sales},${stats.monthlyUsers},${stats.monthlySales},${stats.weeklySales}
    `;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-6 rounded-xl flex justify-between">
        <div>
          <h1 className="text-2xl font-bold flex gap-2 items-center">
            <FaChartLine /> Dashboard
          </h1>
          <p className="text-gray-300 text-sm">
            Business analytics overview
          </p>
        </div>

        <button
          onClick={downloadReport}
          className="bg-yellow-400 px-4 py-2 text-black rounded flex gap-2 items-center"
        >
          <FaDownload /> Report
        </button>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Users" value={stats.users} icon={<FaUsers />} />
        <Card title="Orders" value={stats.orders} icon={<FaBoxOpen />} />
        <Card title="Sales" value={`৳ ${stats.sales}`} icon={<FaDollarSign />} />
        <Card title="Weekly" value={`৳ ${stats.weeklySales}`} icon={<FaChartLine />} />
      </div>

      {/* MONTHLY */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Monthly Users" value={`+${stats.monthlyUsers}`} />
        <Card title="Monthly Sales" value={`৳ ${stats.monthlySales}`} />
      </div>

      {/* EXTRA */}
      <div className="bg-white p-6 rounded-xl shadow grid md:grid-cols-3 gap-4 text-center">
        <div>
          <p>Avg Order</p>
          <h3 className="text-xl font-bold">৳ {avgOrder}</h3>
        </div>

        <div>
          <p>Conversion</p>
          <h3 className="text-xl font-bold">{conversionRate}%</h3>
        </div>

        <div>
          <p>Active Users</p>
          <h3 className="text-xl font-bold">{stats.users}</h3>
        </div>
      </div>

    </div>
  );
};

const Card = ({ title, value, icon }) => (
  <div className="bg-white p-5 rounded-xl shadow flex justify-between items-center">
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
    <div className="text-xl text-gray-600">{icon}</div>
  </div>
);

export default AdminDashboard;