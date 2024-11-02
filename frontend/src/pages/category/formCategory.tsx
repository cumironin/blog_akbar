import type React from "react";
import {useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Plus, Edit} from "lucide-react";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {useNavigate, useParams} from "react-router-dom";
import {
    useCreateCategory,
    useGetCategoryById,
    useUpdateCategory,
} from "@/api/categoryApi";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import type {Category} from "./types";

const categorySchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const FormCategory: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEditing = Boolean(id);

    const {data: categoryData, isLoading: isCategoryLoading} =
        useGetCategoryById(id);

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {title: "", description: ""},
    });

    useEffect(() => {
        if (isEditing && categoryData && typeof categoryData === "object") {
            reset({
                title: categoryData.title,
                description: categoryData.description,
            });
        }
    }, [isEditing, categoryData, reset]);

    const createMutation = useMutation({
        mutationFn: useCreateCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["categories"]});
            navigate("/dashboard/category");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (params: { data: Partial<Category>; id: string }) =>
            useUpdateCategory(params.data, params.id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["categories"]});
            navigate("/dashboard/category");
        },
    });

    const onSubmit = handleSubmit((data: CategoryFormData) => {
        if (isEditing && id) {
            updateMutation.mutate({data, id});
        } else {
            createMutation.mutate(data);
        }
    });

    if (isCategoryLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-2">
            <div className="flex items-center mb-6">
                <h1 className="text-lg font-semibold mr-2">Dashboard</h1>
                <span className="text-gray-500">/</span>
                <h2 className="text-lg font-semibold ml-2">
                    {isEditing ? "Edit Category" : "Add Category"}
                </h2>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            {...register("title")}
                            placeholder="Enter title"
                        />
                        {errors.title && (
                            <p className="text-red-500">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Enter description"
                        />
                        {errors.description && (
                            <p className="text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-5">
                        <Button type="submit" className="bg-black text-white">
                            {isEditing ? (
                                <>
                                    <Edit className="mr-2" size={20}/>
                                    Edit Category
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2" size={20}/>
                                    Add Category
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormCategory;
