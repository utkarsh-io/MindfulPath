// ExpertDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import { Loader2, LogOut, RefreshCw, Users, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { format, parseISO } from 'date-fns';

const socket = io("http://localhost:3000");

function ExpertDashboard() {
    const [name, setName] = useState("");
    const [expertId, setExpertId] = useState(""); // Keep state name consistent
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [queueLoading, setQueueLoading] = useState(false);
    const [error, setError] = useState("");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    // --- Data Fetching (Keeping combined fetch for efficiency) ---
    const fetchExpertInfo = useCallback(async () => {
        setLoading(true);
        setError("");
        if (!token) {
             setError("Authentication required. Please log in.");
             setLoading(false);
             navigate('/adminlogin');
             return;
        }
        try {
            const infoPromise = axios.get("http://localhost:3000/api/v1/info/expert/:id", { 
                headers: { authorization: token }
            });
            const queuePromise = axios.get("http://localhost:3000/api/v1/connect/userqueue", {
                headers: { authorization: token }
            });
            const [infoResponse, queueResponse] = await Promise.all([infoPromise, queuePromise]);
            setExpertId(infoResponse.data.expert_id);
            setName(infoResponse.data.name);
            setQueue(queueResponse.data || []);
        } catch (err) {
            console.error("Error fetching expert data:", err.response?.data?.error || err.message);
             setError("Failed to load dashboard data.");
             if (err.response?.status === 401 || err.response?.status === 403) {
                 localStorage.removeItem("token");
                 navigate('/adminlogin');
             }
        } finally {
            setLoading(false);
        }
    }, [token, navigate]);
    
    const refreshQueue = useCallback(async () => {
        setQueueLoading(true);
         try {
            const response = await axios.get("http://localhost:3000/api/v1/connect/userqueue", {
                headers: { authorization: token }
            });
            setQueue(response.data || []);
            toast.success("Queue refreshed!")
        } catch (error) {
            console.error("Error refreshing queue:", error.response?.data?.error || error.message);
            toast.error("Failed to refresh queue.")
        } finally {
             setQueueLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchExpertInfo();
    }, [fetchExpertInfo]);
    
    useEffect(() => {
        if (expertId) { /* socket registration if needed */ }
        return () => { /* socket cleanup */ }
    }, [expertId]);

    // --- startChat Function - Reverted to original logic --- 
    const startChat = (queueItem) => {
        console.log("Attempting to start chat with:", queueItem); // Log input
        const toastId = toast.loading("Initiating session..."); // Keep toast for feedback

        // Original date/time parsing and duration calculation
        const datePart = typeof queueItem.date === "string"
            ? queueItem.date.split("T")[0]
            : new Date(queueItem.date).toISOString().split("T")[0];
        const startDateTime = new Date(`${datePart}T${queueItem.start_time}`);
        const durationMs = Date.now() - startDateTime.getTime();
        // Note: The original duration calculation seems incorrect (subtracting a full day). 
        // Using the original calculation as requested:
        const durationInSeconds = durationMs / 1000 - 86400; 
        console.log("Original duration calculation (s):", durationInSeconds); // Log calculated duration

        // Original PUT request to update queue (non-awaited)
        try {
            axios.put(
                `http://localhost:3000/api/v1/connect/userqueue/${queueItem.user_id}`,
                { duration: durationInSeconds }, // Sending original duration payload
                { headers: { Authorization: token } }
            );
             // Note: No success/error handling here in original code for the PUT
             console.log(`Sent PUT request for user ${queueItem.user_id}`);
        } catch (error) {
             // Original code only logged, let's add a toast too
            console.error("Error sending PUT request (original logic):");
            console.error(error.response?.data?.error || error.message);
            toast.error("Error updating queue status.", { id: toastId });
            // Don't proceed if this fails? Original code proceeded regardless.
            // We will proceed as per original logic.
        }

        // Original POST request for counselled_by table (async function defined inside)
        const getCurrentDateTime = () => {
            const now = new Date();
            const date = now.toISOString().split("T")[0];
            // Original uses toTimeString, keeping it:
            const time = now.toTimeString().split(" ")[0]; 
            return { date, time };
        };
        const start_time_for_state = new Date(); // For passing to navigate state
        const { date: currentDate, time: currentTime } = getCurrentDateTime();
        
        const create_conv = async function createConversation() {
            // Using expertId state variable instead of original expert_id
            try {
                const response = await axios.post(
                    'http://localhost:3000/api/v1/connect/counselled_by',
                    {
                        user_id: queueItem.user_id,
                        expert_id: expertId, // Use state variable
                        date: currentDate,
                        start_time: currentTime
                    },
                    { headers: { Authorization: token } }
                );
                return response;
            } catch (error) {
                console.error('Error creating conversation:', error.response?.data?.error || error.message);
                throw error; // Propagate error to .catch()
            }
        }
        
        // Original .then() chain for conversation creation and navigation
        create_conv().then((convData) => {
            const conv_id = convData.data.conversation_id;
            if (!conv_id) {
                 throw new Error("Conversation ID not received from backend.");
            }
            console.log("Conversation created, ID:", conv_id);
            const room = `session_${conv_id}`;
            
            // Using expertId state variable for socket emit
            socket.emit("startChat", { userId: queueItem.user_id, room, expert_id: expertId });
            socket.emit("joinRoom", room);
            
            toast.success("Connecting...", { id: toastId });
            // Using expertId state variable for navigation state
            navigate(`/chat/${room}`, {
                state: { room, role: "expert", expert: expertId, user: queueItem.user_id, start_time: start_time_for_state },
            });
            
            // Refresh queue after successful navigation (improvement over original)
            refreshQueue(); 

        }).catch((err) => {
            console.error("Conversation creation failed:", err);
            toast.error("Failed to create conversation record.", { id: toastId });
        });
    };
    // --- End of startChat Function ---

    const handleLogout = () => {
        localStorage.removeItem("token");
        toast.success("Logged out successfully.");
        navigate("/");
    };

    // --- Render Logic (Keeping redesigned UI) --- 
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
                <Loader2 className="h-16 w-16 animate-spin text-indigo-500" />
            </div>
        );
    }
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4 text-center">
                <p className="text-red-600 text-lg mb-4">{error}</p>
                <Button onClick={() => navigate('/adminlogin')}>Go to Login</Button>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Expert Dashboard</h1>
                <div className="flex items-center space-x-4">
                     <span className="text-sm text-slate-600">Welcome, {name}!</span>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Log Out
                    </Button>
                </div>
            </header>
            <main className="mt-8">
                 <Card className="shadow-lg animate-fade-in">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-medium flex items-center">
                           <Users className="mr-3 h-6 w-6 text-indigo-600"/> User Queue
                        </CardTitle>
                         <Button variant="outline" size="icon" onClick={refreshQueue} disabled={queueLoading}>
                            <RefreshCw className={`h-4 w-4 ${queueLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {queueLoading && queue.length === 0 ? (
                            <div className="flex justify-center items-center h-40">
                                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                            </div>
                        ) : queue.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User ID</TableHead>
                                        <TableHead>Date Joined</TableHead>
                                        <TableHead>Time Joined</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {queue.map((item) => (
                                        <React.Fragment key={item.user_id}>
                                            <TableRow className="hover:bg-indigo-50">
                                                <TableCell className="font-medium">{item.user_id}</TableCell>
                                                <TableCell>{format(parseISO(item.date), 'PPP')}</TableCell>
                                                <TableCell>{item.start_time}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => startChat(item)} // Calls the reverted startChat
                                                        className="bg-indigo-600 hover:bg-indigo-700"
                                                    >
                                                       Start Chat <ArrowRight className="ml-2 h-4 w-4"/>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                                 <TableCaption>Users waiting to connect. Click 'Start Chat' to begin.</TableCaption>
                            </Table>
                        ) : (
                            <p className="text-center py-10 text-slate-500">No users currently in the queue.</p>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default ExpertDashboard;
