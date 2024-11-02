import {
  useDeleteMultiplePages,
  useDeletePage,
  useGetPages,
} from "@/api/pageAPI";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useAuth from "@/hooks/useAuth";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SearchTable from "../authorize/role/searchTable";
import { usePageStore } from "./pageStore";

const PageList: React.FC = () => {
  const {
    pages,
    searchTerm,
    selectedPages,
    setPages,
    setSearchTerm,
    setSelectedPages,
    removePage,
    removeMultiplePages,
    setIsLoading,
    setError,
  } = usePageStore();

  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedAll, setSelectedAll] = useState(false);

  const { data, isLoading, error } = useGetPages();
  const deletePage = useDeletePage();
  const deleteMultiplePages = useDeleteMultiplePages();
  const { checkElementPermission } = useAuth();

  useEffect(() => {
    if (data) {
      setPages(data);
    }
    setIsLoading(isLoading);
    setError(error ? error.message : null);
  }, [data, isLoading, error, setPages, setIsLoading, setError]);

  const handleDeletePage = useCallback(
    async (id: string) => {
      try {
        await deletePage.mutateAsync(id);
        removePage(id);
      } catch (error) {
        console.error("Error deleting page:", error);
        setError("Failed to delete page");
      }
    },
    [deletePage, removePage, setError]
  );

  const handleDeleteSelected = useCallback(async () => {
    if (selectedPages.length > 0) {
      try {
        await deleteMultiplePages.mutateAsync(selectedPages);
        removeMultiplePages(selectedPages);
      } catch (error) {
        console.error("Error deleting multiple pages:", error);
        setError("Failed to delete multiple pages");
      }
    }
  }, [deleteMultiplePages, selectedPages, removeMultiplePages, setError]);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      setSelectedAll(checked);
      if (checked) {
        setSelectedPages(pages.map((page) => page.id));
      } else {
        setSelectedPages([]);
      }
    },
    [pages, setSelectedPages]
  );

  const handleSelectPage = useCallback(
    (id: string, checked: boolean) => {
      if (checked) {
        setSelectedPages([...selectedPages, id]);
      } else {
        setSelectedPages(selectedPages.filter((pageId) => pageId !== id));
      }
    },
    [selectedPages, setSelectedPages]
  );

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  if (isLoading) {
    return <div>Loading pages...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 5;
  const indexOfLastPage = currentPage * itemsPerPage;
  const indexOfFirstPage = indexOfLastPage - itemsPerPage;
  const currentPages = filteredPages.slice(indexOfFirstPage, indexOfLastPage);
  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);

  return (
    <div className="p-2">
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold mr-2">Dashboard</h1>
        <span className="text-gray-500">/</span>
        <h2 className="text-lg font-semibold ml-2">Page Management</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between mb-6">
          <SearchTable searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <div className="flex space-x-2">
            {checkElementPermission("page", "create") && (
              <Button onClick={() => navigate("/dashboard/pages/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Insert New Page
              </Button>
            )}
            {checkElementPermission("page", "delete") && (
              <Button variant="destructive" onClick={handleDeleteSelected}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedAll}
                      onCheckedChange={(checked) =>
                        handleSelectAll(checked as boolean)
                      }
                    />
                  </TableHead>
                  <TableHead className="w-[100px]">No</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPages.map((page, index) => (
                  <TableRow key={page.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedPages.includes(page.id)}
                        onCheckedChange={(checked) =>
                          handleSelectPage(page.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>{indexOfFirstPage + index + 1}</TableCell>
                    <TableCell>{page.title}</TableCell>
                    <TableCell>{page.author || "Unknown"}</TableCell>
                    <TableCell>
                      {page.createdAt
                        ? new Date(page.createdAt).toLocaleDateString("en-GB")
                        : "Not Published"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {checkElementPermission("page", "update") ||
                          checkElementPermission("page", "delete") ? (
                            <>
                              {checkElementPermission("page", "update") && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/dashboard/pages/${page.id}`)
                                  }
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {checkElementPermission("page", "delete") && (
                                <DropdownMenuItem
                                  onClick={() => handleDeletePage(page.id)}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </>
                          ) : (
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
          </div>
        </div>

        <div className="flex items-center justify-between space-x-2 py-4">
          <div>
            Showing {indexOfFirstPage + 1} to{" "}
            {Math.min(indexOfLastPage, filteredPages?.length || 0)} of{" "}
            {filteredPages?.length || 0} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PageList);
