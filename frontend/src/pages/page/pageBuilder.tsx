import React, { useEffect, useState, useCallback } from "react";
import type { Content } from "@tiptap/react";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import {
  useCreatePage,
  useGetPageById,
  useEditPage,
  useGetAuthors,
} from "@/api/pageAPI";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "../auth/type";
import { Image as TiptapImage } from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";

import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadMedia } from "@/api/mediaApi";
import { useEditor } from "@tiptap/react";
import { useNavigate, useParams } from "react-router-dom";
import { usePageStore } from "./pageStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().refine((value) => value.trim() !== "", {
    message: "Content is required and cannot be empty",
  }),
  authorId: z.string().min(1, "Author is required"),
  image_url: z.string().optional(),
  metatitle: z.string().optional(),
  slug: z.string().optional(),
});

type PageSchemaType = z.infer<typeof PageSchema>;

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

const PageEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();

  const { currentPage, setCurrentPage, addPage, updatePage } = usePageStore();

  const {
    data: pageData,
    isLoading: isLoadingPage,
    error: pageError,
  } = useGetPageById(id);

  const existingPage = pageData?.page;

  const editPage = useEditPage();
  const createPage = useCreatePage();

  const [editorContent, setEditorContent] = useState<Content>("");

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    trigger,
    formState: { errors, isSubmitted },
  } = useForm<PageSchemaType>({
    resolver: zodResolver(PageSchema),
    defaultValues: {
      title: "",
      content: "",
      authorId: "",
      image_url: "",
      metatitle: "",
      slug: "",
    },
    mode: "onChange", // This will trigger validation on change
  });

  useEffect(() => {
    if (isEditing && existingPage) {
      console.log("Setting form data with existing page:", existingPage);
      reset({
        title: existingPage.title || "",
        content: existingPage.content || "",
        authorId: existingPage.authorId || "",
        image_url: existingPage.image_url || "",
        metatitle: existingPage.metatitle || "",
        slug: existingPage.slug || "",
      });
      setEditorContent(existingPage.content || "");
    }
  }, [isEditing, existingPage, reset]);

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
    content: editorContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setValue("content", html, { shouldValidate: true });
      setEditorContent(html);
      trigger("content"); // This will trigger validation for the content field
    },
  });

  useEffect(() => {
    if (editor && editorContent) {
      editor.commands.setContent(editorContent);
    }
  }, [editor, editorContent]);

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

  const {
    data: authorData,
    isLoading: authorLoading,
    error: authorError,
  } = useGetAuthors();

  const onSubmit = useCallback(
    async (data: PageSchemaType) => {
      try {
        const contentWithUrls = await replaceBase64ImagesWithUrls(data.content);
        const pageData = {
          ...data,
          content: contentWithUrls,
          image_url: data.image_url || "",
          metatitle: data.metatitle || "",
          slug: data.slug || "",
          author: authorData?.find(
            (author: User) => author.id === data.authorId
          ),
        };

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        let result: { page: any };
        if (isEditing && id) {
          result = await editPage.mutateAsync({
            id,
            updatedPage: pageData,
          });
          updatePage(result.page);
        } else {
          result = await createPage.mutateAsync(pageData);
          addPage(result.page);
        }

        navigate("/dashboard/pages/");

        if (editor) {
          editor.commands.setContent("");
        }

        alert(`Page ${isEditing ? "updated" : "created"} successfully!`);
      } catch (error) {
        console.error(
          `Error ${isEditing ? "updating" : "creating"} page:`,
          error
        );
      }
    },
    [
      isEditing,
      id,
      editPage,
      createPage,
      updatePage,
      addPage,
      navigate,
      editor,
      authorData,
      // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
      replaceBase64ImagesWithUrls,
    ]
  );

  if (isLoadingPage) {
    return <div>Loading...</div>;
  }

  if (isEditing && !existingPage) {
    return <div>Error: Page not found</div>;
  }

  return (
    <div className="p-2">
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold mr-2">Dashboard</h1>
        <span className="text-gray-500">/</span>
        <h2 className="text-lg font-semibold ml-2">
          {isEditing ? "Edit Page" : "Create New Page"}
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-8">
            <div className="w-full">
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <div>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter the title here"
                      className="text-sm w-full"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="w-full space-y-6">
              <div className="space-y-2">
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <MinimalTiptapEditor
                        value={field.value}
                        onChange={(newContent) => {
                          field.onChange(newContent);
                          setEditorContent(newContent);
                        }}
                        throttleDelay={2000}
                        className="w-full"
                        editorContentClassName="p-5"
                        output="html"
                        autofocus={false}
                        immediatelyRender={true}
                        editable={true}
                        injectCSS={true}
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
                        placeholder="Type your content here..."
                        editorClassName="focus:outline-none p-5"
                      />
                      {(errors.content || (isSubmitted && !field.value)) && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.content?.message ||
                            "Content is required and cannot be empty"}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            <div className="w-1/3 space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Author</h2>
                <Controller
                  name="authorId"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select author" />
                        </SelectTrigger>
                        <SelectContent>
                          {authorLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading...
                            </SelectItem>
                          ) : authorError ? (
                            <SelectItem value="error" disabled>
                              Error loading authors
                            </SelectItem>
                          ) : (
                            <>
                              {authorData?.map((authorItem: User) => (
                                <SelectItem
                                  key={`option-${authorItem.id}`}
                                  value={authorItem.id}
                                >
                                  {authorItem.name}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.authorId && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.authorId.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="mt-4">
                <Button
                  type="submit"
                  disabled={createPage.isPending || editPage.isPending}
                  className="w-full"
                >
                  {createPage.isPending || editPage.isPending
                    ? "Saving..."
                    : isEditing
                    ? "Update Page"
                    : "Create Page"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(PageEditor);
