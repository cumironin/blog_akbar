import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { registerUser } from "@/api/authApi";

// Define the registration schema using Zod
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Define the type for registration credentials
type RegisterCredentials = z.infer<typeof registerSchema>;

export default function Register() {
	const [serverError, setServerError] = useState<string | null>(null);
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterCredentials>({
		resolver: zodResolver(registerSchema),
	});

	const onSubmit = async (data: RegisterCredentials) => {
		try {
			await registerUser(data);
			// If successful, redirect to login page
			navigate("/auth/login");
		} catch (error) {
			console.error("Registration error:", error);
			setServerError("Registration failed. Please try again.");
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-3xl font-semibold text-black">
						Sign Up
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									{...register("name")}
									aria-invalid={errors.name ? "true" : "false"}
								/>
								{errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
						</div>
						<div className="space-y-2">
							<Label htmlFor="username">Username</Label>
								<Input
									id="username"
									{...register("username")}
									aria-invalid={errors.username ? "true" : "false"}
								/>
								{errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									{...register("email")}
									aria-invalid={errors.email ? "true" : "false"}
								/>
								{errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									{...register("password")}
									aria-invalid={errors.password ? "true" : "false"}
								/>
								{errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
						</div>
						{serverError && <p className="text-red-500 text-sm">{serverError}</p>}
						<Button type="submit" className="w-full">
							Sign Up
						</Button>
					</form>
					<div className="mt-4 text-right">
						<span className="text-sm">Already registered? </span>
						<Link
							to="/auth/login"
							className="text-sm text-blue-600 hover:underline"
						>
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
