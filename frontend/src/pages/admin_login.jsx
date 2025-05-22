import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminLogin = () => {
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send a GET request to the admin login route with the provided admin key.
      const response = await axios.get("http://localhost:3000/api/v1/admin/adminlogin", {
        params: { key: adminKey },
      });

      if (response.data.success) {
        // On success, store the token in localStorage
        console.log('Token created successfully: ', response.data.tokens);
        localStorage.setItem("token", response.data.token);
        // Then navigate to the admin dashboard
        navigate("/admindashboard");
      } else {
        // Display any error message returned from the server.
        setError(response.data.message || "Invalid admin key. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <input
          type="password"
          placeholder="Enter admin key"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          className="w-full p-2 border border-gray-400 rounded mb-4"
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition duration-200"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
