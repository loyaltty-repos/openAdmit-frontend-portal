import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLogin } from "@/services/api.services";
import { cn } from "@/lib/utils";

const AdminLogin = () => {    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await adminLogin(formData);
            if (response.success && response.data) {
                localStorage.setItem("authToken", response.data.accessToken);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                const from = location.state?.from || "/admin";
                navigate(from, { replace: true });
            } else {
                alert(response.message || "Login failed");
            }
        } catch (error) {
            alert(error?.response?.data?.message || "Login failed");
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (<div className="min-h-screen flex items-center justify-center bg-background">
        <Card className={cn("w-[400px] border-border shadow-sm")}>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Admin Login</CardTitle>
                <CardDescription>
                    Enter your credentials to access the admin dashboard
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>              <Input
                            id="email"
                            type="email"
                            placeholder="admin@example.com"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            className="w-full"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            className="w-full"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full bg-primary" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
    );
};

export default AdminLogin;
