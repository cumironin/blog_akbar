import { loginUser } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as z from "zod";

const formSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
});

const LoginPage: React.FC = () => {
	const [errorMessage, setErrorMessage] = useState("");
	const navigate = useNavigate();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
		mode: "onBlur", // This will trigger validation on blur
	});

	const loginMutation = useMutation({
		mutationFn: loginUser,
		onSuccess: (data) => {
			console.log("Login successful", data);
			navigate("/dashboard");
		},
		onError: (error: Error) => {
			console.error("Login failed", error);
			setErrorMessage(error.message || "Login failed. Please try again.");
			// Set form errors
			form.setError("email", { type: "manual", message: " " });
			form.setError("password", { type: "manual", message: " " });
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		setErrorMessage("");
		loginMutation.mutate(values);
	};

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center">
			<Card className="w-96">
				<CardHeader className="text-center">
					<CardTitle className="text-3xl font-medium text-black">
						Login
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input type="email" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input type="password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex justify-center pt-5">
								<Button
									type="submit"
									className="w-44"
									disabled={loginMutation.isPending}
								>
									{loginMutation.isPending ? "Signing In..." : "SIGN IN"}
								</Button>
							</div>
							{errorMessage && (
								<p className="text-red-500 text-sm text-center mt-2">
									{errorMessage}
								</p>
							)}
						</form>
					</Form>
					<div className="mt-4 text-center space-y-2">
						<div className="space-y-1">
							<p className="text-sm text-gray-600">
								Forget{" "}
								<Link to="/reset" className="text-blue-500 hover:underline">
									Username | Password
								</Link>
							</p>
							<p className="text-sm text-gray-600">
								Don't have an account?{" "}
								<Link
									to="/auth/register"
									className="text-blue-500 hover:underline"
								>
									Sign Up
								</Link>
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default LoginPage;
