import { Editor, Element as SlateElement, Transforms } from "slate";
import type {
	BlockType,
	CustomEditor,
	CustomElement,
	MarkFormat,
} from "../types/slate";

export const toggleBlock = (editor: CustomEditor, format: BlockType) => {
	const isActive = isBlockActive(editor, format);
	const isList = ["numbered-list", "bulleted-list"].includes(format);

	Transforms.unwrapNodes(editor, {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		match: (n: any) =>
			!Editor.isEditor(n) &&
			SlateElement.isElement(n) &&
			["numbered-list", "bulleted-list"].includes(n.type as BlockType),
		split: true,
	});

	const newProperties: Partial<SlateElement> = {
		type: isActive ? "paragraph" : isList ? "list-item" : format,
	};
	Transforms.setNodes<SlateElement>(editor, newProperties);

	if (!isActive && isList) {
		const block: CustomElement = { type: format, children: [] };
		Transforms.wrapNodes(editor, block);
	}
};

export const toggleMark = (editor: CustomEditor, format: MarkFormat) => {
	const isActive = isMarkActive(editor, format);

	if (isActive) {
		Editor.removeMark(editor, format);
	} else {
		Editor.addMark(editor, format, true);
	}
};

export const isBlockActive = (editor: CustomEditor, format: BlockType) => {
	const { selection } = editor;
	if (!selection) return false;

	const [match] = Array.from(
		Editor.nodes(editor, {
			at: Editor.unhangRange(editor, selection),
			match: (n) =>
				!Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
		}),
	);

	return !!match;
};

export const isMarkActive = (editor: CustomEditor, format: MarkFormat) => {
	const marks = Editor.marks(editor);
	return marks ? marks[format] === true : false;
};
