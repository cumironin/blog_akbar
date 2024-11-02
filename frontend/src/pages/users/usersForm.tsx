import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
	useCreateUser,
	useGetUserById,
	useUpdateUser,
	useGetRoles,
} from "@/api/usersApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User, Role } from "./types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import ImageSelector from "./showImage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getMediaList, uploadMedia } from "@/api/mediaApi";
import type { Image } from "@/pages/media/types";

// Update the userSchema to make password optional
const userSchema = z.object({
	username: z.string().min(1, "Username is required"),
	email: z.string().email("Invalid email address"),
	name: z.string().min(1, "Name is required"),
	roleId: z.string().min(1, "Role is required"),
	about_me: z.string().nullable().optional().default(null),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters long")
		.optional(),
	image_url: z.string().optional(),
	hasPasswordSet: z.boolean().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserForm: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const isEditing = Boolean(id);

	const { data: userData, isLoading: isUserLoading } = useGetUserById(id);
	const { data: roles, isLoading: isRolesLoading } = useGetRoles();
	const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
	const [selectedImage, setSelectedImage] = useState<Image | null>(null);
	const [images, setImages] = useState<Image[]>([]);
	const [isImagesLoading, setIsImagesLoading] = useState(false);
	const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
	const [maskedPassword, setMaskedPassword] = useState<string>("");

	const {
		control,
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors },
	} = useForm<UserFormData>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			username: "",
			email: "",
			name: "",
			roleId: "",
			password: "",
			image_url: "",
			hasPasswordSet: false,
		},
	});

	const getFullImageUrl = useCallback((url: string | undefined) => {
		if (!url) return undefined;
		if (url.startsWith("http://") || url.startsWith("https://")) {
			return url;
		}
		const fullUrl = `${API_BASE_URL}${url}`;
		return fullUrl;
	}, []);

	useEffect(() => {
		if (isEditing && userData) {
			reset({
				username: userData.username,
				email: userData.email,
				name: userData.name,
				roleId: userData.roleId || "",
				password: "", // Don't pre-fill password for security reasons
				image_url: userData.image_url || "",
				hasPasswordSet: userData.hasPasswordSet,
			});
			if (userData.image_url) {
				const fullImageUrl = getFullImageUrl(userData.image_url);
				setAvatarUrl(fullImageUrl);
			} else {
				setAvatarUrl(undefined);
			}
			if (userData.hasPasswordSet) {
				setMaskedPassword("*".repeat(10)); // Arbitrary length, e.g., 10 asterisks
			} else {
				setMaskedPassword("");
			}
		}
	}, [isEditing, userData, reset, getFullImageUrl]);

	useEffect(() => {
		const fetchImages = async () => {
			setIsImagesLoading(true);
			try {
				const fetchedImages = await getMediaList();
				setImages(fetchedImages);
			} catch (error) {
				console.error("Error fetching images:", error);
			} finally {
				setIsImagesLoading(false);
			}
		};

		fetchImages();
	}, []);

	useEffect(() => {
		if (selectedImage?.url) {
			const fullUrl = getFullImageUrl(selectedImage.url);
			setAvatarUrl(fullUrl);
		} else if (userData?.image_url && !avatarUrl) {
			const fullUrl = getFullImageUrl(userData.image_url);
			setAvatarUrl(fullUrl);
		}
	}, [selectedImage, userData, avatarUrl, getFullImageUrl]);

	const { mutateAsync: createUserMutation } = useCreateUser();
	const { mutateAsync: updateUserMutation } = useUpdateUser();

	const onSubmit = handleSubmit(async (data: UserFormData) => {
		try {
			if (isEditing && id) {
				// Create a new object without the password and hasPasswordSet fields
				const { password, hasPasswordSet, ...updatedData } = data;

				// Create a new object that includes all fields from updatedData
				const finalUpdatedData: Partial<User> = {
					...updatedData,
					// Only include password if it's provided
					...(password ? { password } : {}),
				};

				await updateUserMutation({ id, updatedUser: finalUpdatedData });
			} else {
				// Ensure password is provided for new user creation
				if (!data.password) {
					throw new Error("Password is required when creating a new user");
				}
				// Create a new user with required fields
				const newUserData = {
					username: data.username,
					email: data.email,
					name: data.name,
					roleId: data.roleId,
					password: data.password,
					image_url: data.image_url,
					about_me: data.about_me || null,
				};
				await createUserMutation(newUserData);
			}

			// Invalidate and refetch users query
			await queryClient.invalidateQueries({ queryKey: ["users"] });

			// Navigate back to the users list
			navigate("/dashboard/users");
		} catch (error) {
			console.error("Error saving user:", error);
			// Optionally, you can show an error message to the user here
		}
	});

	const handleImageSelect = (image: Image) => {
		setSelectedImage(image);
		const fullUrl = getFullImageUrl(image.url);
		setAvatarUrl(fullUrl);
		setValue("image_url", image.url);
	};

	const handleFileUpload = async (file: File) => {
		try {
			const uploadedImage = await uploadMedia(file);
			handleImageSelect(uploadedImage);
		} catch (error) {
			console.error("Error uploading image:", error);
		}
	};

	if (isUserLoading || isRolesLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="p-2">
			<div className="flex items-center mb-6">
				<h1 className="text-lg font-semibold mr-2">Dashboard</h1>
				<span className="text-gray-500">/</span>
				<h2 className="text-lg font-semibold ml-2">
					{isEditing ? "Edit User" : "Add User"}
				</h2>
			</div>

			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="flex">
					<div className="w-2/3 pr-6">
						<form onSubmit={onSubmit} className="space-y-4">
							<div>
								<Label htmlFor="username">Username</Label>
								<Input
									id="username"
									{...register("username")}
									placeholder="Enter username"
								/>
								{errors.username && (
									<p className="text-red-500">{errors.username.message}</p>
								)}
							</div>

							<div>
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									{...register("email")}
									placeholder="Enter email"
									type="email"
								/>
								{errors.email && (
									<p className="text-red-500">{errors.email.message}</p>
								)}
							</div>

							<div>
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									{...register("name")}
									placeholder="Enter name"
								/>
								{errors.name && (
									<p className="text-red-500">{errors.name.message}</p>
								)}
							</div>

							<div>
								<Label htmlFor="roleId">Role</Label>
								<Controller
									name="roleId"
									control={control}
									render={({ field }) => (
										<Select onValueChange={field.onChange} value={field.value}>
											<SelectTrigger>
												<SelectValue placeholder="Select a role" />
											</SelectTrigger>
											<SelectContent>
												{roles?.map((role: Role) => (
													<SelectItem key={role.id} value={role.id}>
														{role.roleName}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
								{errors.roleId && (
									<p className="text-red-500">{errors.roleId.message}</p>
								)}
							</div>

							{isEditing && (
								<div>
									<Label htmlFor="password">Current Password</Label>
									<Input
										id="password"
										value={maskedPassword}
										readOnly
										type="text"
									/>
									<p className="text-sm text-gray-500 mt-1">
										{userData?.hasPasswordSet
											? "Password is set. Use change password feature to update."
											: "No password set for this user."}
									</p>
								</div>
							)}

							<div>
								<Label htmlFor="newPassword">
									{isEditing ? "New Password" : "Password"}
								</Label>
								<Input
									id="newPassword"
									{...register("password")}
									placeholder={
										isEditing
											? "Enter new password to change"
											: "Enter password"
									}
									type="password"
									autoComplete={isEditing ? "new-password" : "current-password"}
								/>
								{errors.password && (
									<p className="text-red-500">{errors.password.message}</p>
								)}
							</div>

							<div className="flex justify-end pt-5">
								<Button type="submit" className="bg-black text-white">
									{isEditing ? (
										<>
											<Edit className="mr-2" size={20} />
											Edit User
										</>
									) : (
										<>
											<Plus className="mr-2" size={20} />
											Add User
										</>
									)}
								</Button>
							</div>
						</form>
					</div>

					<div className="w-1/3 flex flex-col items-center justify-center">
						<Avatar className="w-32 h-32 mb-4">
							{avatarUrl ? (
								<AvatarImage
									src={avatarUrl}
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
								<AvatarFallback>
									{userData?.name?.charAt(0) || "U"}
								</AvatarFallback>
							)}
						</Avatar>
						<ImageSelector
							onImageSelect={handleImageSelect}
							isOpen={isImageSelectorOpen}
							onOpenChange={setIsImageSelectorOpen}
							initialSelectedImage={selectedImage}
							images={images}
							isLoading={isImagesLoading}
							error={null}
							onFileUpload={handleFileUpload}
						>
							<Button type="button" variant="outline">
								{avatarUrl ? "Change Image" : "Choose Image"}
							</Button>
						</ImageSelector>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserForm;
