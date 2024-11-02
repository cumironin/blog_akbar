import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

interface PermissionPagingProps {
	currentPage: number;
	totalPages: number;
	setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const PermissionPaging: React.FC<PermissionPagingProps> = ({
	currentPage,
	totalPages,
	setCurrentPage,
}) => {
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	return (
		<Pagination className="mt-4">
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious
						onClick={() => handlePageChange(currentPage - 1)}
						aria-disabled={currentPage === 1}
						// as={Button}
					/>
				</PaginationItem>
				{Array.from({ length: totalPages }, (_, index) => (
					<PaginationItem key={`page-${index + 1}`}>
						<PaginationLink
							onClick={() => handlePageChange(index + 1)}
							isActive={currentPage === index + 1}
						>
							{index + 1}
						</PaginationLink>
					</PaginationItem>
				))}
				<PaginationItem>
					<PaginationNext
						onClick={() => handlePageChange(currentPage + 1)}
						aria-disabled={currentPage === totalPages}
						// as={Button}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
};

export default PermissionPaging;
