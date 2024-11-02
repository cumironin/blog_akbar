import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react";
import ImageSelector from "@/pages/post/showImage";
import type { Image } from "@/pages/media/types";
import { useGetImageBlog } from "@/api/blogPostAPI";
import { Button } from "@/components/ui/button";

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
