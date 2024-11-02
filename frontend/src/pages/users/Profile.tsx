import type React from "react";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGetUserById, useUpdateProfile } from "@/api/usersApi";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const profileSchema = z.object({
	fullName: z.string().min(1, "Full name is required"),
	username: z.string().min(1, "Username is required"),
	aboutMe: z.string(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileProps {
	userId: string;
}

const Profile: React.FC<ProfileProps> = ({ userId }) => {
	const { data: user, isLoading, error } = useGetUserById(userId);
	const [avatarUrl, setAvatarUrl] = useState("/path/to/default/avatar.png");
	const navigate = useNavigate();
	const updateProfileMutation = useUpdateProfile();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			fullName: "",
			username: "",
			aboutMe: "",
		},
	});

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

	const getFullImageUrl = useCallback((url: string | undefined) => {
		if (!url) return "";
		if (url.startsWith("http://") || url.startsWith("https://")) {
			return url;
		}
		return `${API_BASE_URL}${url}`;
	}, []);

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((word) => word[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	useEffect(() => {
		if (user) {
			console.log("User object:", user);
			console.log("User about_me:", user.about_me);

			reset({
				fullName: user.name || "",
				username: user.username || "",
				aboutMe: user.about_me || "",
			});
			console.log("Reset aboutMe value:", user.about_me || "");

			setAvatarUrl(user.image_url || "/path/to/default/avatar.png");
		}
	}, [user, reset]);

	const onSubmit = handleSubmit((data: ProfileFormData) => {
		updateProfileMutation.mutate(
			{
				id: userId,
				name: data.fullName,
				about_me: data.aboutMe || "",
			},
			{
				onSuccess: () => {
					console.log("Profile updated successfully");
					navigate("/dashboard/users");
				},
				onError: (error) => {
					console.error("Error updating profile:", error);
				},
			},
		);
	});

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error loading user data</div>;

	return (
		<div className="p-2">
			<div className="flex items-center mb-6">
				<h1 className="text-lg font-semibold mr-2">Dashboard</h1>
				<span className="text-gray-500">/</span>
				<h2 className="text-lg font-semibold ml-2">Profile</h2>
			</div>

			<div className="bg-white rounded-lg shadow-md p-6">
				<form onSubmit={onSubmit}>
					<div className="flex flex-col md:flex-row gap-8">
						<div className="w-full md:w-1/2 flex flex-col justify-center items-center">
							<Avatar className="w-32 h-32 mb-4">
								{avatarUrl ? (
									<AvatarImage
										src={getFullImageUrl(avatarUrl)}
										alt="User avatar"
										onError={(e) => {
											console.error("Error loading avatar image:", avatarUrl);
											console.error(
												"Error details:",
												(e.target as HTMLImageElement).onerror,
											);
										}}
									/>
								) : (
									<AvatarFallback className="text-2xl font-bold text-white bg-gray-400">
										{getInitials(user?.name || "") || "U"}
									</AvatarFallback>
								)}
							</Avatar>
						</div>
						<div className="w-full md:w-1/2 space-y-4">
							<div>
								<Label htmlFor="username">Username</Label>
								<Controller
									name="username"
									control={control}
									render={({ field }) => (
										<Input {...field} id="username" className="mt-1" disabled />
									)}
								/>
								{errors.username && (
									<p className="text-red-500">{errors.username.message}</p>
								)}
							</div>
							<div>
								<Label htmlFor="fullName">Full Name</Label>
								<Controller
									name="fullName"
									control={control}
									render={({ field }) => (
										<Input {...field} id="fullName" className="mt-1" />
									)}
								/>
								{errors.fullName && (
									<p className="text-red-500">{errors.fullName.message}</p>
								)}
							</div>
							<div>
								<Label htmlFor="aboutMe">About Me</Label>
								<Controller
									name="aboutMe"
									control={control}
									render={({ field }) => (
										<Textarea
											{...field}
											id="aboutMe"
											className="mt-1"
											rows={4}
										/>
									)}
								/>
							</div>
							<Button type="submit">Save Profile</Button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Profile;
