// This component is used for selecting an image from a list of available images

import type React from "react";
import { useState, useRef } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import type { Image } from "@/pages/media/types";
import { DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Define the props for the ImageSelector component
interface ImageSelectorProps {
	onImageSelect: (image: Image) => void; // Callback function when an image is selected
	children: React.ReactNode; // Child components to render
	isOpen: boolean; // Whether the image selector dialog is open
	onOpenChange: (open: boolean) => void; // Callback to handle opening/closing the dialog
	initialSelectedImage: Image | null; // Initially selected image, if any
	images: Image[] | undefined; // Array of available images
	isLoading: boolean; // Whether images are currently loading
	error: unknown; // Any error that occurred while loading images
	onFileUpload: (file: File) => Promise<void>; // New prop for uploading files
}

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define the ImageSelector component
const ImageSelector: React.FC<ImageSelectorProps> = ({
	onImageSelect,
	children,
	isOpen,
	onOpenChange,
	initialSelectedImage,
	images,
	isLoading,
	error,
	onFileUpload,
}) => {
	// State to keep track of the currently selected image
	const [selectedImage, setSelectedImage] = useState<string | null>(
		initialSelectedImage?.id || null,
	);

	// Handler for when an image is selected
	const handleImageSelect = (imageId: string) => {
		setSelectedImage(imageId);
	};

	// Handler for confirming the image selection
	const handleConfirm = () => {
		const selected = images?.find((img) => img.id === selectedImage);
		if (selected) {
			onImageSelect(selected);
		}
		onOpenChange(false); // Close the dialog after selection
	};

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			await onFileUpload(file);
			onOpenChange(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold mb-4">
						Choose Your Image
					</DialogTitle>
					<DialogDescription>
						Select an image from the gallery below to use in your blog post.
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className="h-[450px] w-full">
					<div className="p-1">
						{isLoading ? (
							<p>Loading images...</p>
						) : error ? (
							<p>Error loading images. Please try again.</p>
						) : (
							// Grid layout for displaying images
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
								{images?.map((img) => (
									<div key={img.id} className="p-2">
										<div
											onClick={() => handleImageSelect(img.id)}
											// biome-ignore lint/a11y/useSemanticElements: <explanation>
											role="button"
											tabIndex={0}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													handleImageSelect(img.id);
												}
											}}
											className={`w-full aspect-square relative rounded-lg transition-all duration-300 overflow-hidden cursor-pointer ${
												selectedImage === img.id
													? "ring-2 ring-primary ring-offset-2"
													: "hover:scale-105"
											}`}
										>
											<img
												src={`${API_BASE_URL}${img.url}`}
												alt={img.description}
												className="w-full h-full object-cover"
											/>
											{selectedImage === img.id && (
												<div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
													<Check className="w-10 h-10 text-primary-foreground" />
												</div>
											)}
										</div>
										{/* <button
											onClick={() => handleImageSelect(img.id)}
											type="button"
											className={`w-full aspect-square relative rounded-lg transition-all duration-300 overflow-hidden ${
												selectedImage === img.id
													? "ring-2 ring-primary ring-offset-2"
													: "hover:scale-105"
											}`}
										>
											<img
												src={`${API_BASE_URL}${img.url}`}
												alt={img.description}
												className="w-full h-full object-cover"
											/>
											{selectedImage === img.id && (
												// Overlay to indicate selected image
												<div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
													<Check className="w-10 h-10 text-primary-foreground" />
												</div>
											)}
										</button> */}
									</div>
								))}
							</div>
						)}
					</div>
				</ScrollArea>
				<DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
					<Button
						onClick={handleConfirm}
						disabled={!selectedImage}
						className="w-full sm:w-auto"
					>
						Confirm Selection
					</Button>
					<Button onClick={handleFileUploadClick} className="w-full sm:w-auto">
						Upload from your computer
					</Button>
					<Input
						type="file"
						accept="image/*"
						ref={fileInputRef}
						className="hidden"
						onChange={handleFileChange}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ImageSelector;
