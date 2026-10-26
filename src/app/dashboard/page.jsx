"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [myCircles, setMyCircles] = useState([]);
  const [allCircles, setAllCircles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to view your dashboard.");
      router.push("/login");
      return;
    }

    // Decode token payload
    let payload;
    try {
      payload = JSON.parse(atob(token.split(".")[1]));
    } catch {
      toast.error("Invalid session. Please log in again.");
      router.push("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // Fetch user profile + all circles in parallel
    Promise.all([
      axios.get(`http://localhost:5000/user/getbyid/${payload._id}`, { headers }),
      axios.get("http://localhost:5000/circle/getall", { headers }),
    ])
      .then(([userRes, circlesRes]) => {
        setUser(userRes.data);
        const all = circlesRes.data;
        setAllCircles(all);
        // Circles where this user is the admin
        setMyCircles(all.filter((c) => String(c.admin) === String(payload._id)));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          toast.error("Session expired. Please log in again.");
          router.push("/login");
        } else {
          toast.error("Failed to load dashboard.");
          setLoading(false);
        }
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully.");
    router.push("/login");
  };

  const handleDeleteCircle = (id, name) => {
    const token = localStorage.getItem("token");
    if (!confirm(`Delete circle "${name}"? This cannot be undone.`)) return;

    axios
      .delete(`http://localhost:5000/circle/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setMyCircles((prev) => prev.filter((c) => c._id !== id));
        setAllCircles((prev) => prev.filter((c) => c._id !== id));
        toast.success(`"${name}" deleted.`);
      })
      .catch(() => toast.error("Failed to delete circle."));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Circles",
      value: allCircles.length,
      icon: "◎",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "My Circles",
      value: myCircles.length,
      icon: "★",
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Joined As Member",
      value: allCircles.filter((c) => c.members?.includes(user?._id)).length,
      icon: "✓",
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900 tracking-tight">◎ Circles</span>
          <div className="flex items-center gap-3">
            <a
              href="/browse-circle"
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Browse
            </a>
            <a
              href="/add-circle"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Circle
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="text-blue-100 text-sm">Welcome back,</p>
              <h1 className="text-2xl font-bold">{user?.name ?? "User"}</h1>
              <p className="text-blue-200 text-sm mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${s.color}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* My Circles */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">My Circles</h2>
          <a
            href="/add-circle"
            className="text-sm text-blue-600 font-medium hover:underline"
          >
            + Create new
          </a>
        </div>

        {myCircles.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center mb-10">
            <div className="text-4xl mb-3">◎</div>
            <h3 className="text-base font-semibold text-gray-700">
              You have not created any circles yet
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Start by creating your first circle.
            </p>
            <a
              href="/add-circle"
              className="mt-4 inline-block px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Create a Circle
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {myCircles.map((circle) => (
              <div
                key={circle._id}
                className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                      {circle.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {circle.name}
                    </h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium flex-shrink-0">
                    Admin
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 flex-1 mb-4">
                  {circle.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {circle.members?.length ?? 0} member{(circle.members?.length ?? 0) !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => handleDeleteCircle(circle._id, circle.name)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All Circles preview */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">All Circles</h2>
          <a
            href="/browse-circle"
            className="text-sm text-blue-600 font-medium hover:underline"
          >
            View all →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allCircles.slice(0, 6).map((circle) => (
            <div
              key={circle._id}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold text-lg flex-shrink-0">
                {circle.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{circle.name}</p>
                <p className="text-xs text-gray-400 truncate">{circle.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
