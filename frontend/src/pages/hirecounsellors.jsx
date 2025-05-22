import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { ArrowLeft, CheckCircle, XCircle, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns'; // For formatting dates

const HireCounsellors = () => {
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [filterStatus, setFilterStatus] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    // Helper function to force inline display for PDFs
    const getInlineUrl = (url) => {
        if (!url) return '';
        try {
            const urlObj = new URL(url);
            urlObj.searchParams.set('response-content-disposition', 'inline');
            return urlObj.toString();
        } catch (e) {
            console.error("Invalid URL for getInlineUrl:", url);
            return url; // Return original URL if parsing fails
        }
    };

    useEffect(() => {
        const fetchApplications = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get('http://localhost:3000/api/v1/admin/applications', {
                    headers: { Authorization: token }
                });
                setApplications(response.data.applications || []);
            } catch (err) {
                console.error('Error fetching applications:', err.response ? err.response.data : err.message);
                setError('Failed to fetch applications. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchApplications();
        } else {
            setError('Authentication token not found. Please log in.');
            setLoading(false);
        }
    }, [token]);

    const filteredApplications =
        filterStatus === 'all'
            ? applications
            : applications.filter(app => app.status === filterStatus);

    const updateApplicationStatus = async (status) => {
        if (!selectedApplication) return;
        setLoading(true); // Use main loading indicator
        setError('');

        try {
            const response = await axios.put(
                `http://localhost:3000/api/v1/admin/applications/${selectedApplication.application_id}/${status}`,
                {},
                { headers: { Authorization: token } }
            );
            const updatedApplication = response.data.application;
            setSelectedApplication(updatedApplication);
            setApplications(prevApps => prevApps.map(app =>
                app.application_id === updatedApplication.application_id ? updatedApplication : app
            ));
        } catch (err) {
            console.error(`Error ${status === 'accept' ? 'accepting' : 'rejecting'} application:`, err.response ? err.response.data : err.message);
            setError(`Failed to ${status === 'accept' ? 'accept' : 'reject'} application.`);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = () => updateApplicationStatus('accept');
    const handleReject = () => updateApplicationStatus('reject');

    // --- Render Loading State ---
    if (loading && !selectedApplication) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
                <Loader2 className="h-16 w-16 animate-spin text-rose-500" />
            </div>
        );
    }
    
    // --- Render Error State ---
    if (error && !selectedApplication) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
                 <Button
                    variant="ghost"
                    className="absolute top-4 left-4 text-slate-600 hover:text-slate-900"
                    onClick={() => navigate('/admindashboard')}
                    size="sm"
                 >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
                <p className="text-red-600 text-lg">{error}</p>
            </div>
        );
    }

    // --- Render Detailed View ---
    if (selectedApplication) {
        const app = selectedApplication;
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
                <Button
                    variant="ghost"
                    className="mb-6 text-slate-600 hover:text-slate-900"
                    onClick={() => setSelectedApplication(null)}
                    size="sm"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Details */}
                    <Card className="md:col-span-2 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center space-x-4">
                                {app.profile_image_url && (
                                    <img
                                        src={app.profile_image_url}
                                        alt={app.full_name}
                                        className="h-20 w-20 rounded-full border object-cover"
                                    />
                                )}
                                <div>
                                    <CardTitle className="text-2xl font-bold">{app.full_name}</CardTitle>
                                    <CardDescription>{app.email} | {app.phone}</CardDescription>
                                    <CardDescription>Location: {app.location}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div><strong>Application ID:</strong> {app.application_id}</div>
                            <div><strong>Education:</strong> {app.education}</div>
                            <div><strong>Certifications:</strong> {app.certifications}</div>
                            <div><strong>Years of Experience:</strong> {app.years_experience}</div>
                            <div><strong>Areas of Expertise:</strong> {app.areas_of_expertise}</div>
                            <div><strong>Cover Letter:</strong> <p className="text-sm text-slate-700 whitespace-pre-wrap mt-1">{app.cover_letter}</p></div>
                            <div><strong>Applied At:</strong> {format(new Date(app.applied_at), 'PPP p')}</div>
                            <div>
                                <strong>Status:</strong> 
                                <span className={`ml-2 font-semibold ${app.status === 'accepted' ? 'text-green-600' : app.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                </span>
                             </div>
                             {app.status === 'pending' && (
                                <div className="flex space-x-4 pt-4 border-t">
                                    <Button onClick={handleAccept} className="bg-green-600 hover:bg-green-700" disabled={loading}>
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4" />} Accept
                                    </Button>
                                    <Button onClick={handleReject} variant="destructive" disabled={loading}>
                                         {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <XCircle className="mr-2 h-4 w-4" />} Reject
                                    </Button>
                                </div>
                            )}
                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>} 
                        </CardContent>
                    </Card>

                    {/* Right Column: Resume */} 
                    <Card className="shadow-lg">
                         <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="mr-2 h-5 w-5" /> Resume
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {app.resume_url ? (
                                <iframe
                                    src={getInlineUrl(app.resume_url)}
                                    title="Resume Preview"
                                    className="w-full h-[70vh] border rounded-md"
                                />
                            ) : (
                                <p className="text-slate-500 text-center py-10">No resume uploaded.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // --- Render List View ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
            <div className="flex justify-between items-center mb-6">
                 <Button
                    variant="ghost"
                    className="text-slate-600 hover:text-slate-900"
                    onClick={() => navigate('/admindashboard')}
                    size="sm"
                 >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold text-slate-800">Counsellor Applications</h1>
                <div className="flex items-center space-x-2">
                     <Label htmlFor="statusFilter" className="whitespace-nowrap">Filter by status:</Label>
                    <Select onValueChange={setFilterStatus} defaultValue={filterStatus}>
                        <SelectTrigger id="statusFilter" className="w-[180px]">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="all">All</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {filteredApplications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredApplications.map(app => (
                        <Card
                            key={app.application_id}
                            onClick={() => setSelectedApplication(app)}
                            className="cursor-pointer hover:shadow-xl transition-shadow duration-300"
                        >
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                     {app.profile_image_url && (
                                        <img
                                            src={app.profile_image_url}
                                            alt={app.full_name}
                                            className="h-12 w-12 rounded-full border object-cover"
                                        />
                                    )}
                                    <div>
                                        <CardTitle className="text-lg">{app.full_name}</CardTitle>
                                        <CardDescription>Applied: {format(new Date(app.applied_at), 'PP')}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="text-sm space-y-1">
                                <p><strong>Expertise:</strong> {app.areas_of_expertise}</p>
                                <p><strong>Education:</strong> {app.education}</p>
                                <p><strong>Status:</strong> 
                                    <span className={`ml-1 font-medium ${app.status === 'accepted' ? 'text-green-600' : app.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                    </span>
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-slate-500">
                    No applications found matching the filter "{filterStatus}".
                </div>
            )}
        </div>
    );
};

export default HireCounsellors;
