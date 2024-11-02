import { useGetSettings, useUpdateSettings } from "@/api/settingsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAuth from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const settingsSchema = z.object({
  siteTitle: z.string().min(1, "Site title is required"),
  tagline: z.string().min(1, "Tagline is required"),
  showBlogPostTypeNumber: z
    .number()
    .int()
    .positive("Must be a positive integer"),
  siteAddress: z.string().url("Must be a valid URL"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const FormSettings: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { checkElementPermission } = useAuth();

  const { data: settings, isLoading: isSettingsLoading } = useGetSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteTitle: "",
      tagline: "",
      showBlogPostTypeNumber: 1,
      siteAddress: "",
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        siteTitle: settings.siteTitle,
        tagline: settings.tagline,
        showBlogPostTypeNumber: settings.showBlogPostTypeNumber,
        siteAddress: settings.siteAddress,
      });
    }
  }, [settings, reset]);

  const updateMutation = useMutation({
    mutationFn: useUpdateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      navigate("/dashboard/settings");
    },
  });

  const onSubmit = handleSubmit((data: SettingsFormData) => {
    updateMutation.mutate(data);
  });

  if (isSettingsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-2">
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold mr-2">Dashboard</h1>
        <span className="text-gray-500">/</span>
        <h2 className="text-lg font-semibold ml-2">Edit Settings</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="siteTitle">Site Title</Label>
            <Input
              id="siteTitle"
              {...register("siteTitle")}
              placeholder="Enter site title"
            />
            {errors.siteTitle && (
              <p className="text-red-500">{errors.siteTitle.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              {...register("tagline")}
              placeholder="Enter tagline"
            />
            {errors.tagline && (
              <p className="text-red-500">{errors.tagline.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="showBlogPostTypeNumber">Show Blog Post</Label>
            <Input
              id="showBlogPostTypeNumber"
              type="number"
              {...register("showBlogPostTypeNumber", { valueAsNumber: true })}
              placeholder="Enter number"
            />
            {errors.showBlogPostTypeNumber && (
              <p className="text-red-500">
                {errors.showBlogPostTypeNumber.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="siteAddress">Site Address</Label>
            <Input
              id="siteAddress"
              {...register("siteAddress")}
              placeholder="Enter site address"
            />
            {errors.siteAddress && (
              <p className="text-red-500">{errors.siteAddress.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-5">
            {checkElementPermission("settings", "update") && (
              <Button type="submit" className="bg-black text-white">
                <Edit className="mr-2" size={20} />
                Update Settings
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormSettings;
