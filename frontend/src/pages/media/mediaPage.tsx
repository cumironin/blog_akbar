import {
  deleteMedia,
  getMediaList,
  uploadMedia,
  editMediaDescription,
} from "@/api/mediaApi";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const uploadSchema = z.object({
  file: z.instanceof(File, { message: "Please select a file" }),
  description: z.string().min(1, "Description is required"),
});

type UploadFormData = z.infer<typeof uploadSchema>;

const MediaPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Changed from 10 to 5
  const { checkElementPermission } = useAuth();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<{
    id: string;
    description: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  const {
    data: mediaList,
    isLoading,
    isError,
  } = useQuery<
    {
      id: string;
      name: string;
      url: string;
      image: string;
      description: string;
    }[],
    Error
  >({
    queryKey: ["mediaList"],
    queryFn: getMediaList,
  });

  const uploadMutation = useMutation({
    mutationFn: (data: UploadFormData) =>
      uploadMedia(data.file, "", data.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mediaList"] });
      setIsDialogOpen(false);
      reset();
      setPreviewUrl(null);
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    },
    onError: (error) => {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mediaList"] });
      toast({
        title: "Success",
        description: "Media deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting media:", error);
      toast({
        title: "Error",
        description: "Failed to delete media",
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, description }: { id: string; description: string }) =>
      editMediaDescription(id, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mediaList"] });
      setEditingMedia(null);
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Media description updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating media description:", error);
      toast({
        title: "Error",
        description: "Failed to update media description",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UploadFormData) => {
    uploadMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      setValue("file", file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSelectMedia = (id: string) => {
    setSelectedMedia((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    for (const id of selectedMedia) {
      deleteMutation.mutate(id);
    }
    setSelectedMedia([]);
  };

  const handleEdit = (id: string, description: string) => {
    setEditingMedia({ id, description });
    setIsEditDialogOpen(true);
  };

  const handleUpdateDescription = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const newDescription = form.description.value;
    if (editingMedia && newDescription) {
      editMutation.mutate({ id: editingMedia.id, description: newDescription });
    }
  };

  const filteredMedia =
    mediaList?.filter(
      (media) =>
        media.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        media.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const totalPages = Math.ceil(filteredMedia.length / itemsPerPage);
  const paginatedMedia = filteredMedia.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching media list</div>;

  return (
    <div className="p-2">
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold mr-2">Dashboard</h1>
        <span className="text-gray-500">/</span>
        <h2 className="text-lg font-semibold ml-2">Media Management</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between mb-6">
          <div className="relative w-1/3">
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
          <div className="flex space-x-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                {checkElementPermission("media", "create") && (
                  <Button
                    className="bg-black text-white"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus className="mr-2" size={20} />
                    Add Image
                  </Button>
                )}
              </DialogTrigger>
              <DialogContent aria-describedby="dialog-description">
                <DialogHeader>
                  <DialogTitle>
                    {editingMedia
                      ? "Edit Media Description"
                      : "Image Management"}
                  </DialogTitle>
                </DialogHeader>
                {editingMedia ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateDescription(
                        e.currentTarget.description.value
                      );
                    }}
                    className="grid gap-4 py-4"
                  >
                    <Input
                      name="description"
                      placeholder="Description"
                      defaultValue={editingMedia.description}
                    />
                    <Button type="submit" disabled={editMutation.isPending}>
                      {editMutation.isPending ? "Updating..." : "Update"}
                    </Button>
                  </form>
                ) : (
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="grid gap-4 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        onClick={() =>
                          document.getElementById("fileInput")?.click()
                        }
                      >
                        Choose File
                      </Button>
                      <Input
                        id="fileInput"
                        type="file"
                        className="hidden"
                        {...register("file")}
                        onChange={handleFileChange}
                        data-testid="fileInput"
                      />
                      {previewUrl && (
                        <div className="w-24 h-24 border rounded">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    {errors.file && (
                      <p className="text-red-500">{errors.file.message}</p>
                    )}
                    <Input
                      placeholder="Description"
                      {...register("description")}
                    />
                    {errors.description && (
                      <p className="text-red-500">
                        {errors.description.message}
                      </p>
                    )}
                    <Button type="submit" disabled={uploadMutation.isPending}>
                      {uploadMutation.isPending ? "Uploading..." : "Upload"}
                    </Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>

            {checkElementPermission("media", "delete") && (
              <Button
                onClick={handleDeleteSelected}
                disabled={selectedMedia.length === 0}
                variant="destructive"
              >
                <Trash2 className="mr-2" size={20} />
                Delete Selected
              </Button>
            )}
          </div>
        </div>

        <Table className="border border-gray-200">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedMedia.length === paginatedMedia.length &&
                    paginatedMedia.length > 0
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedMedia(paginatedMedia.map((media) => media.id));
                    } else {
                      setSelectedMedia([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>No.</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMedia.map((media, index) => (
              <TableRow key={media.id} className="hover:bg-gray-50">
                <TableCell>
                  <Checkbox
                    checked={selectedMedia.includes(media.id)}
                    onCheckedChange={() => handleSelectMedia(media.id)}
                  />
                </TableCell>
                <TableCell>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell>
                  <div className="w-12 h-12">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${media.image}`}
                      alt={media.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                </TableCell>
                <TableCell>{media.description}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {checkElementPermission("media", "update") && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleEdit(media.id, media.description)
                          }
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Edit
                        </DropdownMenuItem>
                      )}
                      {checkElementPermission("media", "delete") && (
                        <DropdownMenuItem
                          onClick={() => handleDelete(media.id)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Delete
                        </DropdownMenuItem>
                      )}
                      {!checkElementPermission("media", "update") &&
                        !checkElementPermission("media", "delete") && (
                          <DropdownMenuItem
                            className="text-gray-400 cursor-not-allowed"
                            disabled
                          >
                            No access to action
                          </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Media Description</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateDescription} className="grid gap-4 py-4">
            <Input
              name="description"
              placeholder="Description"
              defaultValue={editingMedia?.description}
            />
            <Button type="submit" disabled={editMutation.isPending}>
              {editMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaPage;
