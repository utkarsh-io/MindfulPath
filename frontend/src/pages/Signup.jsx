// Signup.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button"; // Assuming Button component exists
import { Input } from "../components/ui/input"; // Assuming Input component exists
import { Label } from "../components/ui/label"; // Assuming Label component exists
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"; // Assuming Card components exist
import { ArrowLeft } from "lucide-react";

function Signup() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setLoading(true);
        setError(""); // Clear previous errors

        try {
            const response = await axios.post("http://localhost:3000/api/v1/signup/user", {
                user_name: name,
                email,
                password,
            });

            console.log(response.data);
            localStorage.setItem("token", response.data.token);

            if (response.data.success) {
                navigate("/dashboard");
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || "An unexpected error occurred. Please try again.";
            console.error("Signup error:", errorMessage, err.response);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
            <Button 
                variant="ghost" 
                className="absolute top-4 left-4 text-slate-600 hover:text-slate-900"
                onClick={() => navigate('/')}
                size="sm"
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
            <Card className="w-full max-w-md shadow-xl animate-fade-in">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
                    <CardDescription>Enter your details below to sign up.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>
                         {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <Button 
                            type="submit" 
                            className="w-full bg-rose-500 hover:bg-rose-600"
                            disabled={loading}
                        >
                            {loading ? "Signing up..." : "Sign Up"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="text-center text-sm">
                    <p>
                        Already have an account?{" "}
                        <Link to="/signin" className="font-medium text-rose-600 hover:underline">
                            Sign In
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

export default Signup;