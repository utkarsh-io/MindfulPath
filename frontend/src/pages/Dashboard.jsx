import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import UserNavbar from "../components/UserNavbar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Loader2, LogOut, MessageSquarePlus, CalendarDays, Save, Bot, BrainCircuit } from "lucide-react";
import toast from "react-hot-toast";
import { format } from 'date-fns';

const socket = io("http://localhost:3000");

function Dashboard() {
    const [name, setName] = useState("");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Journal state variables
    const today = format(new Date(), 'yyyy-MM-dd'); // Ensure consistent format
    const [journalDate, setJournalDate] = useState(today);
    const [journalTitle, setJournalTitle] = useState("");
    const [journalText, setJournalText] = useState("");
    const [journalMood, setJournalMood] = useState("");
    const [journalExists, setJournalExists] = useState(false);
    const [isEditable, setIsEditable] = useState(true);
    const [journalLoading, setJournalLoading] = useState(false);
    const [journalError, setJournalError] = useState("");

    // Fetch user name and id.
    useEffect(() => {
        const fetchName = async () => {
            setLoading(true);
            setError("");
            if (!token) {
                setError("Authentication required. Please log in.");
                setLoading(false);
                navigate('/signin'); // Redirect if no token
                return;
            }
            try {
                const response = await axios.get(
                    "http://localhost:3000/api/v1/info/user/:id", // The backend should handle resolving :id from token
                    { headers: { Authorization: token } }
                );
                setName(response.data.user_name);
                setUserId(response.data.user_id);
            } catch (err) {
                console.error("Error fetching user info:", err.response?.data?.error);
                setError("Failed to load user information.");
                if (err.response?.status === 401 || err.response?.status === 403) {
                     localStorage.removeItem("token");
                     navigate('/signin');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchName();
    }, [token, navigate]);

    // Fetch journal entry for a given date.
    const fetchJournalEntry = async (date) => {
        setJournalLoading(true);
        setJournalError("");
        setJournalTitle("");
        setJournalText("");
        setJournalMood("");
        setJournalExists(false);

        try {
            const response = await axios.get(
                `http://localhost:3000/api/v1/connect/journal?date=${date}`,
                { headers: { Authorization: token } }
            );
            setJournalTitle(response.data.title || "");
            setJournalText(response.data.journal_text || "");
            setJournalMood(response.data.mood || "");
            setJournalExists(true);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setJournalExists(false);
                // Message will be handled in render
            } else {
                console.error("Error fetching journal:", error);
                setJournalError("Failed to load journal entry.");
            }
        } finally {
            setJournalLoading(false);
        }
    };

    // Handle date change from the date picker.
    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        setJournalDate(selectedDate);
        setIsEditable(selectedDate === today);
        fetchJournalEntry(selectedDate);
    };

    // Handle save (create/update) for today's journal entry.
    const handleSaveJournal = async () => {
        setJournalLoading(true);
        setJournalError("");
        const toastId = toast.loading(journalExists ? 'Updating journal...' : 'Saving journal...');
        try {
            const payload = { title: journalTitle, journal_text: journalText }; // Mood might be added later
            if (journalExists) {
                await axios.put("http://localhost:3000/api/v1/connect/journal", payload, { headers: { Authorization: token } });
                toast.success("Journal updated successfully.", { id: toastId });
            } else {
                await axios.post("http://localhost:3000/api/v1/connect/journal", payload, { headers: { Authorization: token } });
                setJournalExists(true); // Now it exists
                toast.success("Journal saved successfully.", { id: toastId });
            }
        } catch (error) {
            console.error("Error saving journal:", error);
            setJournalError("Error saving journal entry.");
            toast.error("Error saving journal entry.", { id: toastId });
        } finally {
             setJournalLoading(false);
        }
    };

    // Initial fetch for today's journal entry when component mounts (and user is loaded)
    useEffect(() => {
        if (userId) { // Only fetch journal after user ID is available
            fetchJournalEntry(today);
        }
    }, [userId]); // Rerun when userId is set

    // Socket and chat logic.
    useEffect(() => {
        if (userId) {
            socket.emit("registerUser", userId);
        }
        // Cleanup on unmount
        return () => {
             if (userId) {
                 // Consider if deregistration is needed
                 // socket.emit("deregisterUser", userId);
             }
        }
    }, [userId]);

    useEffect(() => {
        socket.on("chatStarted", ({ room, expert_id }) => {
            const time = new Date();
            toast.success(`Connecting you to an expert...`);
            navigate(`/chat/${room}`, {
                state: { room, role: "user", user: userId, expert: expert_id, start_time: time },
            });
        });
        
        socket.on("queueUpdate", (data) => {
            // Optional: Show queue position updates via toast
            // console.log("Queue update:", data);
        });

        socket.on("noExpertsAvailable", () => {
             toast.error("Sorry, no experts are available right now. Please try again later.");
        });
        
        return () => {
            socket.off("chatStarted");
            socket.off("queueUpdate");
            socket.off("noExpertsAvailable");
        };
    }, [navigate, userId]); // name removed as userId is sufficient

    // Function for connecting to an expert.
    const addtoqueue = async () => {
        const toastId = toast.loading('Joining the queue...');
        try {
            const now = new Date();
            const date = format(now, 'yyyy-MM-dd');
            const time = format(now, 'HH:mm:ss');
            await axios.post(
                "http://localhost:3000/api/v1/connect/userqueue",
                { date, start_time: time },
                { headers: { Authorization: token } }
            );
            alert("Added to queue! Waiting for an expert...");
            toast.success('Added to queue! Waiting for an expert...', { id: toastId });
        } catch (error) {
            const errorMsg = error.response?.data?.error;
            if (errorMsg === "User already in the queue") {
                alert("You are already in the queue.");

                toast.error("You are already in the queue.", { id: toastId });
            } else {
                console.error("Queue error:", errorMsg);
                toast.error("Could not join the queue. Please try again.", { id: toastId });
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        toast.success("Logged out successfully.")
        navigate("/");
    };
    
    // Render Loading state for initial user fetch
    if (loading) {
        return (
             <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
                <Loader2 className="h-16 w-16 animate-spin text-rose-500" />
            </div>
        )
    }
    
     // Render Error state for initial user fetch
    if (error) {
         return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 text-center">
                <p className="text-red-600 text-lg mb-4">{error}</p>
                 <Button onClick={() => navigate('/signin')}>Go to Sign In</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
            {/* Header */}
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Welcome, {name}!</h1>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Log Out
                </Button>
            </header>

            {/* Navbar - Assuming UserNavbar handles its own styling */}
             

            <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column / Main Content Area */} 
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Actions Card */}
                    <Card className="shadow-lg animate-fade-in">
                        <CardHeader>
                            <CardTitle>Connect with Support</CardTitle>
                            <CardDescription>Reach out to one of our expert counsellors when you need to talk.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button className="w-full md:w-auto bg-rose-500 hover:bg-rose-600" onClick={addtoqueue}>
                                <MessageSquarePlus className="mr-2 h-5 w-5" /> Connect to an Expert
                            </Button>
                             <p className="text-xs text-slate-500 mt-2">You will be added to a queue and connected automatically.</p>
                        </CardContent>
                    </Card>
                    
                    {/* Depression Prediction Model Card - Added */}
                    <Card className="shadow-lg animate-fade-in">
                        <CardHeader>
                            <CardTitle>Depression Prediction Analysis</CardTitle>
                            <CardDescription>Utilize our ML model to check for potential signs of depression. </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" onClick={() => navigate('/mlmodel')}> 
                                <BrainCircuit className="mr-2 h-5 w-5 text-blue-500" /> Check for Depression
                            </Button>
                            <p className="text-xs text-slate-500 mt-2">Note: This is an informational tool and not a substitute for professional diagnosis.</p>
                        </CardContent>
                    </Card>

                    {/* Chatbot Card - Added */}
                     <Card className="shadow-lg animate-fade-in">
                        <CardHeader>
                            <CardTitle>MindfulPath Chatbot</CardTitle>
                            <CardDescription>Engage with our helpful chatbot for quick answers, resources, or just a supportive conversation anytime you need it.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button variant="outline" onClick={() => navigate('/chatbot')}>
                                <Bot className="mr-2 h-5 w-5 text-purple-500" /> Start Chatting with Bot
                            </Button>
                        </CardContent>
                    </Card>
                    
                </div>

                {/* Right Column - Journaling */}
                <div className="lg:col-span-1 space-y-8">
                     <Card className="shadow-lg animate-fade-in">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <CalendarDays className="mr-2 h-5 w-5" /> Your Journal
                            </CardTitle>
                            <CardDescription>Reflect on your day. Only today's entry is editable.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="mb-4">
                                <Label htmlFor="journalDate">Select Date</Label>
                                <Input
                                    type="date"
                                    id="journalDate"
                                    value={journalDate}
                                    onChange={handleDateChange}
                                    className="mt-1"
                                />
                            </div>
                            
                             {journalLoading ? (
                                <div className="flex justify-center items-center h-40">
                                     <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                                </div>
                            ) : journalError ? (
                                 <p className="text-red-500 text-sm">{journalError}</p>
                            ) : (journalDate !== today && !journalExists) ? (
                                 <p className="text-slate-500 text-sm text-center py-10">No journal entry found for {format(new Date(journalDate + 'T00:00:00'), 'PPP')}.</p> // Added safe date parsing
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="journalTitle">Title</Label>
                                        <Input
                                            type="text"
                                            id="journalTitle"
                                            value={journalTitle}
                                            onChange={(e) => setJournalTitle(e.target.value)}
                                            disabled={!isEditable}
                                            className="mt-1"
                                            placeholder="Entry title (optional)"
                                        />
                                    </div>
                                     <div>
                                        <Label htmlFor="journalText">How was your day?</Label>
                                        <Textarea
                                            id="journalText"
                                            value={journalText}
                                            onChange={(e) => setJournalText(e.target.value)}
                                            disabled={!isEditable}
                                            className="mt-1"
                                            rows={6}
                                            placeholder="Write your thoughts here..."
                                        />
                                    </div>
                                     {journalMood && !isEditable && (
                                        <div>
                                            <Label>Mood Recorded</Label>
                                            <p className="text-sm text-slate-700 mt-1">{journalMood}</p>
                                        </div>
                                    )}
                                    {isEditable && (
                                        <Button onClick={handleSaveJournal} disabled={journalLoading} className="w-full">
                                            {journalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                                            {journalExists ? 'Update Journal' : 'Save Journal'}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
