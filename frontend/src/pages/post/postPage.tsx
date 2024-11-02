import {
  useCreateBlogPost,
  useEditBlogPost,
  useGetAuthorBlog,
  useGetBlogPostById,
  useGetCategoryBlog,
  useGetImageBlog,
} from "@/api/blogPostAPI";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Image } from "@/pages/media/types"; // Add this import
import { Image as TiptapImage } from "@tiptap/extension-image";
import type { Content } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { format } from "date-fns";
import { CalendarIcon, Upload } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { User } from "../auth/type";
import type { Category } from "../category/types";
import { Combobox } from "./multiSelect";
import ImageSelector from "./showImage";

import { uploadMedia } from "@/api/mediaApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEditor } from "@tiptap/react";
import { forwardRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
// Remove the duplicate import of StarterKit

const BlogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  authorId: z.string().min(1, "Author is required"),
  categories: z.array(z.string()).optional(),
  image_url: z.string().optional(),
  metatitle: z.string().optional(),
  slug: z.string().optional(),
  publishedAt: z.date(),
});

type BlogPostSchemaType = z.infer<typeof BlogPostSchema>;

const CustomImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "auto",
        renderHTML: (attributes) => ({ width: attributes.width }),
      },
      height: {
        default: "auto",
        renderHTML: (attributes) => ({ height: attributes.height }),
      },
    };
  },
});

const BlogPostEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { data: existingPost, isLoading: isLoadingPost } =
    useGetBlogPostById(id);
  const editBlogPost = useEditBlogPost();
  const createBlogPost = useCreateBlogPost();

  const [editorContent, setEditorContent] = useState<Content>("");

  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BlogPostSchemaType>({
    resolver: zodResolver(BlogPostSchema),
    defaultValues: {
      title: "",
      content: "",
      authorId: "",
      categories: [],
      image_url: "",
      metatitle: "",
      slug: "",
      publishedAt: new Date(),
    },
  });

  useEffect(() => {
    if (isEditing && existingPost) {
      console.log("Existing post loaded:", existingPost);
      reset({
        title: existingPost.title,
        content: existingPost.content,
        authorId: existingPost.authorId,
        categories: existingPost.categories,
        image_url: existingPost.image_url,
        metatitle: existingPost.metatitle,
        slug: existingPost.slug,
        publishedAt: new Date(existingPost.publishedAt),
      });
      setEditorContent(existingPost.content || "");
      console.log("Editor content set to:", existingPost.content);
    }
  }, [isEditing, existingPost, reset]);

  // Log editor content changes
  useEffect(() => {
    console.log("Editor content updated:", editorContent);
  }, [editorContent]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "tiptap-image",
        },
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setValue("content", editor.getHTML());
    },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(watch("content"));
    }
  }, [editor, watch("content")]);

  const imageUploadHandler = async (file: File) => {
    try {
      const result = await uploadMedia(file);
      return result.url;
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  };

  const replaceBase64ImagesWithUrls = async (
    content: string
  ): Promise<string> => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const images = doc.getElementsByTagName("img");

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = img.getAttribute("src");
      // biome-ignore lint/complexity/useOptionalChain: <explanation>
      if (src && src.startsWith("data:image")) {
        const file = await (await fetch(src)).blob();
        const url = await imageUploadHandler(
          new File([file], "image.png", { type: file.type })
        );
        const vitUrl = `${import.meta.env.VITE_API_BASE_URL}${url}`;
        img.setAttribute("src", vitUrl);
      }
    }

    return doc.body.innerHTML;
  };

  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);

  const {
    data: categoryData,
    isLoading: categoryLoading,
    error: categoryError,
  } = useGetCategoryBlog();
  const {
    data: authorData,
    isLoading: authorLoading,
    error: authorError,
  } = useGetAuthorBlog();

  const {
    data: imageData,
    isLoading: imageLoading,
    error: imageError,
  } = useGetImageBlog();

  const handleImageSelect = (image: Image) => {
    console.log("Selected image:", image);
    setValue("image_url", image.url);
    setIsImageSelectorOpen(false);
  };

  const onSubmit = async (data: BlogPostSchemaType) => {
    console.log("Submitting data to server:", JSON.stringify(data, null, 2));
    try {
      const contentWithUrls = await replaceBase64ImagesWithUrls(data.content);
      const postData = {
        ...data,
        content: contentWithUrls,
        categories: data.categories || [],
        image_url: data.image_url || "",
        metatitle: data.metatitle || "",
        slug: data.slug || "",
      };

      if (isEditing) {
        await editBlogPost.mutateAsync({ id, updatedPost: postData });
      } else {
        await createBlogPost.mutateAsync(postData);
      }

      navigate("/dashboard/blog/");

      if (editor) {
        editor.commands.setContent("");
      }

      alert("Blog post saved successfully!");
    } catch (error) {
      console.error("Error saving blog post:", error);
      alert(
        `Error saving blog post: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleSaveClick = () => {
    console.log("Save button clicked");
    handleSubmit(
      (data) => {
        console.log("Form is valid. Submitting data:", data);
        onSubmit(data);
      },
      (errors) => {
        console.log("Form has errors:", errors);
      }
    )();
  };

  const ImageButton = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
  >((props, ref) => (
    <div
      ref={ref}
      {...props}
      className="w-full h-48 border-2 rounded-md bg-slate-200 hover:bg-slate-100 p-0 overflow-hidden relative cursor-pointer"
    >
      {watch("image_url") ? (
        <>
          <img
            src={`${import.meta.env.VITE_API_BASE_URL}${watch("image_url")}`}
            alt="Selected pict"
            className="w-full h-full object-cover"
          />
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            className="absolute top-2 right-2 bg-secondary text-secondary-foreground px-2 py-1 text-sm rounded"
            onClick={(e) => {
              e.stopPropagation();
              setIsImageSelectorOpen(true);
            }}
          >
            Change Image
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            Upload a file or drag and drop
          </p>
        </div>
      )}
    </div>
  ));

  return (
    <div className="p-2">
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold mr-2">Dashboard</h1>
        <span className="text-gray-500">/</span>
        <h2 className="text-lg font-semibold ml-2">Blog Post Editor</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log("Form submitted");
            handleSubmit(onSubmit)(e);
          }}
        >
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <div className="w-[65.9%]">
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter the title here"
                      className="text-sm  w-full"
                    />
                  )}
                />
              </div>
              <div className="space-x-2">
                <Button type="button" variant="outline">
                  Preview
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveClick}
                  disabled={createBlogPost.isPending}
                >
                  {createBlogPost.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <div className="space-y-2">
                  <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                      <MinimalTiptapEditor
                        // editor={editor}
                        value={editorContent}
                        onChange={(newContent) => {
                          console.log(
                            "Editor onChange called with:",
                            newContent
                          );
                          field.onChange(newContent);
                          setEditorContent(newContent);
                          // if (editor) {
                          // 	editor.commands.setContent(newContent);
                          // }
                        }}
                        throttleDelay={2000}
                        className="w-full"
                        editorContentClassName="p-5"
                        output="html"
                        // placeholder="Type your description here..."
                        autofocus={false}
                        immediatelyRender={true}
                        editable={true}
                        injectCSS={true}
                        // editorClassName="focus:outline-none"
                        extensions={[
                          StarterKit,
                          CustomImage.configure({
                            inline: true,
                            allowBase64: true,
                            HTMLAttributes: {
                              class: "tiptap-image",
                            },
                          }),
                        ]}
                        placeholder="Type your description here..."
                        editorClassName="focus:outline-none p-5"
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">Image</h2>
                  <Controller
                    name="image_url"
                    control={control}
                    render={({ field }) => (
                      <ImageSelector
                        onImageSelect={(image) => {
                          handleImageSelect(image);
                          field.onChange(image.url);
                        }}
                        isOpen={isImageSelectorOpen}
                        onOpenChange={setIsImageSelectorOpen}
                        initialSelectedImage={
                          field.value ? ({ url: field.value } as Image) : null
                        }
                        images={imageData}
                        isLoading={imageLoading}
                        error={imageError}
                        onFileUpload={async (file) => {
                          try {
                            const result = await uploadMedia(file);
                            handleImageSelect({
                              id: result.id,
                              url: result.url,
                            } as Image);
                            field.onChange(result.url);
                          } catch (error) {
                            console.error("File upload failed:", error);
                          }
                        }}
                      >
                        <ImageButton
                          onClick={() => setIsImageSelectorOpen(true)}
                        />
                      </ImageSelector>
                    )}
                  />
                  <Controller
                    name="metatitle"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Caption" />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">Description</h2>
                  <Controller
                    name="slug"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        placeholder="Enter a short description..."
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">Author</h2>
                  <Controller
                    name="authorId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select author" />
                        </SelectTrigger>
                        <SelectContent>
                          {console.log("Author loading:", authorLoading)}
                          {console.log("Author error:", authorError)}
                          {console.log("Author data:", authorData)}
                          {authorLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading...
                            </SelectItem>
                          ) : authorError ? (
                            <SelectItem value="error" disabled>
                              Error loading authors
                            </SelectItem>
                          ) : (
                            authorData?.map((author: User) => (
                              <SelectItem key={author.id} value={author.id}>
                                {author.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">Post date</h2>
                  <Controller
                    name="publishedAt"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={`w-full justify-start text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "PPP")
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">Category</h2>
                  <Controller
                    name="categories"
                    control={control}
                    render={({ field }) => (
                      <Combobox
                        data={categoryData as Category[] | undefined}
                        isLoading={categoryLoading}
                        error={categoryError}
                        placeholder="Select categories..."
                        onValueChange={field.onChange}
                        value={field.value || []}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      {Object.keys(errors).length > 0 && (
        <div className="text-red-500 mt-4">
          <p>Form has errors:</p>
          <ul>
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BlogPostEditor;
