import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type React from "react";

interface SearchInputProps {
	searchTerm: string;
	setSearchTerm: (term: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
	searchTerm,
	setSearchTerm,
}) => {
	return (
		<div className="relative w-1/3">
			<Input
				type="text"
				placeholder="Search by menu name"
				className="pl-10 pr-4 py-2"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
			/>
			<Search
				className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
				size={20}
			/>
		</div>
	);
};

export default SearchInput;
