"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const BrowseCircle = () => {
  const router = useRouter();
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to browse circles.");
      router.push("/login");
      return;
    }

    axios
      .get("http://localhost:5000/circle/getall", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCircles(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          toast.error("Session expired. Please log in again.");
          router.push("/login");
        } else {
          toast.error("Failed to load circles.");
          setLoading(false);
        }
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully.");
    router.push("/login");
  };

  const filtered = circles.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  // Skeleton loader
  const Skeleton = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
      </div>
      <div className="mt-5 h-9 bg-gray-200 rounded-lg" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            ◎ Circles
          </span>
          <div className="flex items-center gap-3">
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Circles</h1>
          <p className="mt-1 text-gray-500 text-sm">
            Discover communities and connect with like-minded people.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            id="search-circles"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search circles by name or description..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">◎</div>
            <h2 className="text-xl font-semibold text-gray-700">No circles found</h2>
            <p className="text-gray-400 mt-1 text-sm">
              {search ? "Try a different search term." : "Be the first to create one!"}
            </p>
            {!search && (
              <a
                href="/add-circle"
                className="mt-5 inline-block px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Create a Circle
              </a>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">
              Showing {filtered.length} circle{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((circle) => (
                <div
                  key={circle._id}
                  className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col hover:shadow-md transition-shadow"
                >
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg flex-shrink-0">
                      {circle.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-gray-900 truncate">
                        {circle.name}
                      </h2>
                      <p className="text-xs text-gray-400">
                        {circle.members?.length ?? 0} member{(circle.members?.length ?? 0) !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 flex-1">
                    {circle.description}
                  </p>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(circle.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
                      onClick={() => toast.success(`Joined "${circle.name}"!`)}
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseCircle;
