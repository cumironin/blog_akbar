import * as React from "react";
import { useRef, useState } from "react";
import "./styles/index.css";

import { EditorContent, useEditor } from "@tiptap/react";
import type { Content, Editor } from "@tiptap/react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SectionOne } from "./components/section/one";
import { SectionTwo } from "./components/section/two";
import { SectionThree } from "./components/section/three";
import { SectionFour } from "./components/section/four";
import { SectionFive } from "./components/section/five";
// import { LinkBubbleMenu } from "./components/bubble-menu/link-bubble-menu";
// import { ImageBubbleMenu } from "./components/bubble-menu/image-bubble-menu";
import type { UseMinimalTiptapEditorProps } from "./hooks/use-minimal-tiptap";
// import { useMinimalTiptapEditor } from "./hooks/use-minimal-tiptap";
import { Image } from "@tiptap/extension-image";
import ImageSelector from "@/pages/post/showImage";
import { useGetImageBlog } from "@/api/blogPostAPI";
import { uploadMedia } from "@/api/mediaApi";
import { ToolbarButton } from "./components/toolbar-button";
import { ImageIcon } from "@radix-ui/react-icons";
import { debounce } from "lodash"; // Make sure to install lodash if not already present

export interface MinimalTiptapProps
	extends Omit<UseMinimalTiptapEditorProps, "onUpdate"> {
	value?: Content;
	onChange?: (value: Content) => void;
	className?: string;
	editorContentClassName?: string;
}

interface ImageData {
	url: string;
	// Add other properties of the image object if needed
}

const Toolbar = ({ editor }: { editor: Editor }) => {
	const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
	const {
		data: imageData,
		isLoading: imageLoading,
		error: imageError,
	} = useGetImageBlog();

	const handleImageSelect = async (image: ImageData) => {
		editor
			.chain()
			.focus()
			.setImage({ src: `${import.meta.env.VITE_API_BASE_URL}${image.url}` })
			.run();
		setIsImageSelectorOpen(false);
	};

	const handleFileUpload = async (file: File) => {
		try {
			const result = await uploadMedia(file);
			editor
				.chain()
				.focus()
				.setImage({ src: `${import.meta.env.VITE_API_BASE_URL}${result.url}` })
				.run();
			setIsImageSelectorOpen(false);
		} catch (error) {
			console.error("Image upload failed:", error);
		}
	};

	return (
		<div className="shrink-0 overflow-x-auto border-b border-border p-2">
			<div className="flex w-max items-center gap-px">
				<SectionOne editor={editor} activeLevels={[1, 2, 3, 4, 5, 6]} />

				<Separator orientation="vertical" className="mx-2 h-7" />

				<SectionTwo
					editor={editor}
					activeActions={[
						"bold",
						"italic",
						"strikethrough",
						"code",
						"clearFormatting",
					]}
					mainActionCount={2}
				/>

				<Separator orientation="vertical" className="mx-2 h-7" />

				<SectionThree editor={editor} />

				<Separator orientation="vertical" className="mx-2 h-7" />

				<SectionFour
					editor={editor}
					activeActions={["orderedList", "bulletList"]}
					mainActionCount={0}
				/>

				<Separator orientation="vertical" className="mx-2 h-7" />

				<SectionFive
					editor={editor}
					activeActions={["codeBlock", "blockquote", "horizontalRule"]}
					mainActionCount={0}
				/>

				{/* ini paling bener */}
				<ImageSelector
					onImageSelect={handleImageSelect}
					isOpen={isImageSelectorOpen}
					onOpenChange={setIsImageSelectorOpen}
					initialSelectedImage={null}
					images={imageData}
					isLoading={imageLoading}
					error={imageError}
					onFileUpload={handleFileUpload}
				>
					<ToolbarButton
						isActive={editor.isActive("image")}
						tooltip="Image"
						aria-label="Image"
						onClick={() => setIsImageSelectorOpen(true)}
					>
						<ImageIcon className="size-5" />
					</ToolbarButton>
				</ImageSelector>
			</div>
		</div>
	);
};

export const MinimalTiptapEditor = React.forwardRef<
	HTMLDivElement,
	MinimalTiptapProps
>(({ value, onChange, className, editorContentClassName, ...props }, ref) => {
	const [editorKey, setEditorKey] = useState(0);
	const editorRef = useRef(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const debouncedOnChange = React.useCallback(
		debounce((newContent: Content) => {
			if (onChange) {
				onChange(newContent);
			}
		}, 300),
		[onChange],
	);

	const editor = useEditor({
		extensions: [
			// ... other extensions
			Image.configure({
				inline: true,
				allowBase64: true,
			}),
		],
		content: value,
		onUpdate: ({ editor }) => {
			const newContent = editor.getHTML();
			debouncedOnChange(newContent as Content);
		},
		editorProps: {
			attributes: {
				class: cn("minimal-tiptap-editor", editorContentClassName),
			},
		},
		shouldRerenderOnTransaction: false,
		...props,
	});

	React.useEffect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value ?? ""); // Provide a default empty string if value is undefined
			setEditorKey((prev) => prev + 1); // Force re-render of EditorContent
		}
	}, [editor, value]);

	if (!editor) {
		return null;
	}

	return (
		<div
			ref={ref}
			className={cn(
				"flex h-auto min-h-72 w-full flex-col rounded-md border border-input shadow-sm focus-within:border-primary",
				className,
			)}
		>
			<Toolbar editor={editor} />
			{editor && (
				<EditorContent key={editorKey} editor={editor} ref={editorRef} />
			)}
			{/* <LinkBubbleMenu editor={editor} />
			<ImageBubbleMenu editor={editor} /> */}
		</div>
	);
});

MinimalTiptapEditor.displayName = "MinimalTiptapEditor";

export default MinimalTiptapEditor;
