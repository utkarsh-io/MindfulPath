// MLmodel.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle, BrainCircuit } from 'lucide-react';
import toast from 'react-hot-toast';

// Define the keys in a specific order for rendering
const formKeys = [
    "Age", "Gender", "Working Professional or Student", "City", 
    "Degree", "Profession", "CGPA", "Work/Study Hours", 
    "Academic Pressure", "Work Pressure", "Study Satisfaction", "Job Satisfaction", 
    "Financial Stress", "Family History of Mental Illness", "Dietary Habits", 
    "Have you ever had suicidal thoughts ?", "Sleep Duration"
];

function MLmodel() {
    const navigate = useNavigate();
    const [apiStatus, setApiStatus] = useState("Checking prediction service status...");
    const [apiOk, setApiOk] = useState(false);
    // Initialize formData state dynamically based on formKeys
    const [formData, setFormData] = useState(
        formKeys.reduce((acc, key) => ({ ...acc, [key]: "" }), {})
    );
    const [resultMessage, setResultMessage] = useState("");
    const [isDepression, setIsDepression] = useState(null); // null, 0, or 1
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Check API status on mount
    useEffect(() => {
        axios.get("http://localhost:5001/") // Assuming ML API root path returns OK status
            .then(() => {
                setApiStatus("Prediction service is available.");
                setApiOk(true);
            })
            .catch(err => {
                console.error("ML API status check failed:", err);
                setApiStatus("Prediction service is currently unavailable.");
                setApiOk(false);
                toast.error("Prediction service unavailable.");
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!apiOk) {
             toast.error("Prediction service is unavailable.");
             return;
        }
        
        setLoading(true);
        setError(null);
        setResultMessage("");
        setIsDepression(null);
        const toastId = toast.loading("Analyzing data...");

        try {
             // Basic validation: Ensure all fields are filled (adjust as needed)
            const allFilled = formKeys.every(key => formData[key].trim() !== "");
            if (!allFilled) {
                throw new Error("Please fill out all fields before predicting.");
            }
            
            // The ML API expects an array containing one object
            const submissionData = [formData]; 
            
            const response = await axios.post("http://localhost:5001/predict", submissionData, {
                headers: { "Content-Type": "application/json" }
            });
            
            const prediction = response.data[0]; // Assuming API returns [0] or [1]
             setIsDepression(prediction);
            
            if (prediction === 1) {
                setResultMessage("Analysis suggests potential signs of depression. We strongly recommend connecting with one of our counsellors for support and guidance.");
                toast.error("Potential depression signs detected.", { id: toastId, duration: 5000 });
            } else if (prediction === 0) {
                setResultMessage("Analysis does not indicate signs of clinical depression based on this input. Remember, maintaining mental wellness is an ongoing journey. Explore our resources or talk to a counsellor anytime.");
                 toast.success("No signs of clinical depression detected.", { id: toastId, duration: 5000 });
            } else {
                // Handle unexpected response
                throw new Error(`Unexpected prediction result: ${prediction}`);
            }
        } catch (err) {
            console.error("Prediction error:", err);
            const errorMessage = err.message || "An error occurred while fetching the prediction.";
            setError(errorMessage);
             toast.error(errorMessage, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
            <Button 
                variant="ghost" 
                className="absolute top-4 left-4 text-slate-600 hover:text-slate-900"
                onClick={() => navigate('/dashboard')}
                size="sm"
                disabled={loading}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>

            <Card className="w-full max-w-4xl mt-10 shadow-xl animate-fade-in">
                <CardHeader className="text-center">
                    <div className="flex justify-center items-center mb-3">
                         <BrainCircuit className="h-10 w-10 text-blue-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Depression Prediction Analysis</CardTitle>
                    <CardDescription className="text-sm text-slate-600 px-4">
                        Answer the following questions to help our ML model analyze potential indicators. 
                        <br/><strong>Disclaimer:</strong> This is an informational tool only and not a substitute for professional diagnosis.
                    </CardDescription>
                    <p className={`mt-2 text-xs font-medium ${apiOk ? 'text-green-600' : 'text-red-600'}`}>
                        {apiStatus}
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                            {formKeys.map((key) => (
                                <div key={key} className="space-y-1">
                                    <Label htmlFor={key} className="text-xs font-medium">{key}</Label>
                                    <Input
                                        id={key}
                                        type={key === "Age" || key === "Years of Experience" || key === "CGPA" || key === "Work/Study Hours" || key === "Sleep Duration" ? "number" : "text"} // Basic type guessing
                                        name={key}
                                        value={formData[key]}
                                        onChange={handleChange}
                                        placeholder={`Enter ${key}`}
                                        required
                                        className="text-sm h-9" // Smaller input
                                        disabled={loading || !apiOk}
                                        step={key === "CGPA" ? "0.01" : "1"} // Example step for CGPA
                                        min={key === "Age" || key === "Years of Experience" || key === "Work/Study Hours" || key === "Sleep Duration" ? "0" : undefined} // Example min for numeric
                                    />
                                </div>
                            ))}
                        </div>
                        
                        <div className="pt-4 flex justify-center">
                            <Button 
                                type="submit"
                                disabled={loading || !apiOk}
                                className="w-full md:w-1/2 lg:w-1/3 bg-blue-600 hover:bg-blue-700 text-base py-2.5"
                            >
                                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : null}
                                {loading ? 'Analyzing...' : 'Predict Result'}
                            </Button>
                        </div>
                    </form>
                </CardContent>

                {(resultMessage || error) && (
                     <CardFooter className="flex flex-col items-center pt-4 border-t">
                        <h3 className="text-lg font-semibold mb-2">Analysis Result:</h3>
                         {error ? (
                            <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-md w-full">
                                 <AlertTriangle className="h-5 w-5 mr-2 shrink-0" />
                                 <p className="text-sm">{error}</p>
                             </div>
                         ) : (
                             <div className={`flex items-center p-3 rounded-md w-full ${isDepression === 1 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                 {isDepression === 1 ? 
                                     <AlertTriangle className="h-5 w-5 mr-2 shrink-0" /> : 
                                     <CheckCircle className="h-5 w-5 mr-2 shrink-0" />
                                 }
                                 <p className="text-sm">{resultMessage}</p>
                             </div>
                         )}
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}

export default MLmodel;
