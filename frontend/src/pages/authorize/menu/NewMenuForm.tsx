import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateMenu, useUpdateMenu } from "@/api/menuApi";

const menuSchema = z.object({
	name: z.string().max(50, "Menu name must be 50 characters or less"),
	numsort: z.number().int().positive(),
	svg: z.string(),
	url_menu: z.string(),
});

type MenuFormData = z.infer<typeof menuSchema>;

interface NewMenuFormProps {
	isDialogOpen: boolean;
	handleDialogOpenChange: (open: boolean) => void;
	editingMenuId: string | null;
	initialMenuData: {
		name: string;
		numsort: number;
		svg: string;
		url_menu: string;
	};
}

const NewMenuForm: React.FC<NewMenuFormProps> = ({
	isDialogOpen,
	handleDialogOpenChange,
	editingMenuId,
	initialMenuData,
}) => {
	const createMenuMutation = useCreateMenu();
	const updateMenuMutation = useUpdateMenu();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<MenuFormData>({
		resolver: zodResolver(menuSchema),
		defaultValues: initialMenuData,
	});

	useEffect(() => {
		reset(initialMenuData);
	}, [initialMenuData, reset]);

	const onSubmit = async (data: MenuFormData) => {
		try {
			if (editingMenuId) {
				await updateMenuMutation.mutateAsync({
					menuData: data,
					id: editingMenuId,
				});
			} else {
				await createMenuMutation.mutateAsync(data);
			}
			reset();
			handleDialogOpenChange(false);
		} catch (error) {
			console.error("Error saving menu:", error);
		}
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
			<DialogTrigger asChild>
				<Button className="bg-black text-white">
					<Plus className="mr-2" size={20} />
					Add New Menu
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{editingMenuId ? "Edit Menu" : "Add New Menu"}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Name
							</Label>
							<Input id="name" className="col-span-3" {...register("name")} />
						</div>
						{errors.name && (
							<p className="text-red-500">{errors.name.message}</p>
						)}

						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="numsort" className="text-right">
								Num Sort
							</Label>
							<Input
								id="numsort"
								type="number"
								className="col-span-3"
								{...register("numsort", { valueAsNumber: true })}
							/>
						</div>
						{errors.numsort && (
							<p className="text-red-500">{errors.numsort.message}</p>
						)}

						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="svg" className="text-right">
								SVG
							</Label>
							<Input id="svg" className="col-span-3" {...register("svg")} />
						</div>
						{errors.svg && <p className="text-red-500">{errors.svg.message}</p>}

						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="url_menu" className="text-right">
								URL
							</Label>
							<Input id="url_menu" className="col-span-3" {...register("url_menu")} />
						</div>
						{errors.url_menu && <p className="text-red-500">{errors.url_menu.message}</p>}
					</div>
					<Button type="submit">
						{editingMenuId ? "Update Menu" : "Add Menu"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default NewMenuForm;
