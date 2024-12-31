import { useGetImageBlog } from "@/api/blogPostAPI";
import { Button } from "@/components/ui/button";
import type { Image } from "@/pages/media/types";
import ImageSelector from "@/pages/post/showImage";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react";
import { useState } from "react";

interface ImageBubbleMenuProps {
	editor: Editor;
}

export const ImageBubbleMenu: React.FC<ImageBubbleMenuProps> = ({ editor }) => {
	const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
	const { data: imageData, isLoading, error } = useGetImageBlog();

	const handleImageSelect = (image: Image) => {
		editor
			.chain()
			.focus()
			.setImage({ src: `${import.meta.env.VITE_API_BASE_URL}${image.url}` })
			.run();
		setIsImageSelectorOpen(false);
	};

	return (
		<BubbleMenu
			editor={editor}
			tippyOptions={{ duration: 100 }}
			shouldShow={({ editor }) => editor.isEmpty}
		>
			<ImageSelector
				onImageSelect={handleImageSelect}
				isOpen={isImageSelectorOpen}
				onFileUpload={async () => {}}
				onOpenChange={setIsImageSelectorOpen}
				initialSelectedImage={null}
				images={imageData}
				isLoading={isLoading}
				error={error}
			>
				<Button
					onClick={() => setIsImageSelectorOpen(true)}
					size="sm"
					variant="secondary"
				>
					Insert Image
				</Button>
			</ImageSelector>
		</BubbleMenu>
	);
};
