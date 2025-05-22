// AdminDashboard.jsx
import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { LogOut, Users, LineChart, Settings } from 'lucide-react'; // Added icons
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token"); // Needed for logout

    // Basic check if admin is logged in (can be enhanced)
    useEffect(() => {
        if (!token) {
            toast.error("Admin access required.");
            navigate('/adminlogin'); // Redirect to admin login if no token
        }
         // Optional: Verify token validity with backend here
    }, [token, navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        toast.success("Logged out successfully.");
        navigate("/"); // Navigate to home or admin login
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-neutral-100 p-6">
             {/* Header */}
            <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-300">
                <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Log Out
                </Button>
            </header>

             {/* Dashboard Content Grid */}
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Manage Counsellors Card */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-medium">Manage Applications</CardTitle>
                        <Users className="h-6 w-6 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-sm text-slate-600 mb-4">
                           Review, accept, or reject counsellor applications.
                        </CardDescription>
                        <Button onClick={() => navigate('/hirecounsellors')} className="w-full md:w-auto">
                             View Applications
                        </Button>
                    </CardContent>
                </Card>

                 {/* Website Analytics Card (Placeholder) */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-medium">Website Analytics</CardTitle>
                        <LineChart className="h-6 w-6 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-sm text-slate-600 mb-4">
                            View user statistics, traffic sources, and site performance.
                        </CardDescription>
                         <Button disabled variant="secondary" className="w-full md:w-auto">
                             Coming Soon
                        </Button>
                    </CardContent>
                </Card>

                 {/* Settings Card (Placeholder) */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-medium">Settings</CardTitle>
                        <Settings className="h-6 w-6 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-sm text-slate-600 mb-4">
                             Configure application settings or manage admin users.
                        </CardDescription>
                         <Button disabled variant="secondary" className="w-full md:w-auto">
                             Coming Soon
                        </Button>
                    </CardContent>
                </Card>
                
                {/* Add more cards for other admin features as needed */} 
                
            </main>
        </div>
    );
};

export default AdminDashboard;