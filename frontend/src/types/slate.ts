import type { BaseEditor } from "slate";
import type { ReactEditor } from "slate-react";
import type { HistoryEditor } from "slate-history";

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

export type ParagraphElement = {
	type: "paragraph";
	children: CustomText[];
};

export type HeadingElement = {
	type: "heading-one" | "heading-two";
	children: CustomText[];
};

export type BlockQuoteElement = {
	type: "block-quote";
	children: CustomText[];
};

export type BulletedListElement = {
	type: "bulleted-list";
	children: ListItemElement[];
};

export type NumberedListElement = {
	type: "numbered-list";
	children: ListItemElement[];
};

export type ListItemElement = {
	type: "list-item";
	children: CustomText[];
};

export type CustomElement =
	| ParagraphElement
	| HeadingElement
	| BlockQuoteElement
	| BulletedListElement
	| NumberedListElement
	| ListItemElement;

export type FormattedText = {
	text: string;
	bold?: true;
	italic?: true;
	underline?: true;
};

export type CustomText = FormattedText;

export type BlockType = CustomElement["type"];
export type MarkFormat = keyof Omit<FormattedText, "text">;

declare module "slate" {
	interface CustomTypes {
		Editor: CustomEditor;
		Element: CustomElement;
		Text: CustomText;
	}
}
