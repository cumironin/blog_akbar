import React, { useState, useEffect } from "react";
import {
  fetchApi,
  fetchArticlesByCategory,
  fetchCategories,
  getAllAstroBlog,
  getUserAvatar,
} from "../lib/astroblog";

type Articles = {
  id: number;
  title: string;
  metatitle: string;
  slug: string;
  content: string;
  image_url: string;
  createdAt: Date;
  publishedAt: Date;
  author: string;
  category: string;
};

type Category = {
  id: number;
  title: string;
};

type UserAvatar = {
  username: string;
  image_url: string;
};

export default function CategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [articles, setArticles] = useState<Articles[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 3;
  const [userAvatars, setUserAvatars] = useState<UserAvatar[]>([]);

  const getFullImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${import.meta.env.BLOG_URL}${imageUrl}`;
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} hari yang lalu`;
  };

  // Combined function to load articles by category
  const loadArticlesByCategory = async (categoryName: string) => {
    try {
      // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
      let response;
      if (categoryName === "All") {
        response = await getAllAstroBlog<{ data: Articles[] }>({
          endpoint: "api/astroblog/allarticle",
        });
      } else {
        response = await fetchArticlesByCategory<{ data: Articles[] }>({
          category: categoryName,
        });
      }

      const articleData = response?.data || [];
      const uniqueArticles = Array.from(
        new Map(
          (Array.isArray(articleData) ? articleData : [articleData]).map(
            (article) => [article.id, article]
          )
        ).values()
      );
      setArticles(uniqueArticles);
    } catch (error) {
      console.error(
        `Error fetching articles for category ${categoryName}:`,
        error
      );
      setArticles([]);
    }
  };

  // Handle category selection
  const handleCategoryClick = async (categoryName: string) => {
    setSelectedCategory(categoryName);
    setCurrentPage(1);
    await loadArticlesByCategory(categoryName);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const loadInitialData = async () => {
      // Load categories
      const fetchedCategories = await fetchCategories<{ data: Category[] }>();
      if (fetchedCategories?.data) {
        const transformedCategories: Category[] = fetchedCategories.data.map(
          (cat) => ({
            id: cat.id,
            title: cat.title,
          })
        );
        setCategories(transformedCategories);
      }

      // Load user avatars
      try {
        const response = await getUserAvatar<{ data: UserAvatar[] }>();
        if (response?.data) {
          setUserAvatars(response.data);
        }
      } catch (error) {
        console.error("Error fetching user avatars:", error);
      }

      // Load initial articles (All category)
      await loadArticlesByCategory("All");
    };

    loadInitialData();
  }, []);

  // Add helper function to get user avatar
  const getUserAvatarUrl = (author: string) => {
    const userAvatar = userAvatars.find((user) => user.username === author);
    if (userAvatar?.image_url) {
      return getFullImageUrl(userAvatar.image_url);
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      author
    )}&background=random`;
  };

  // Calculate pagination
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(
    indexOfFirstArticle,
    indexOfLastArticle
  );
  const totalPages = Math.ceil(articles.length / articlesPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      {/* Category Buttons */}
      <div className="flex overflow-x-auto space-x-4 mb-6">
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button
          onClick={() => handleCategoryClick("All")}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            selectedCategory === "All"
              ? "bg-gray-200 text-gray-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All News
        </button>
        {categories.map((category) => (
          // biome-ignore lint/a11y/useButtonType: <explanation>
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.title)}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              selectedCategory === category.title
                ? "bg-gray-200 text-gray-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <span>{category.title}</span>
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {articles && articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
            {currentArticles.map((article: Articles) => (
              <div
                key={article.id}
                className="bg-white shadow-lg overflow-hidden"
              >
                <img
                  src={getFullImageUrl(article.image_url)}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 pb-2">
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 text-xs font-semibold mb-2 inline-block">
                    {article.category}
                  </span>
                  <a href={`/blog/${article.id}`} className="block">
                    <h3 className="text-lg font-semibold hover:text-red-600 transition-colors">
                      {article.title}
                    </h3>
                  </a>
                </div>
                <div className="px-4 py-4 text-sm text-gray-500 flex items-center space-x-3">
                  <img
                    src={getUserAvatarUrl(article.author)}
                    alt={article.author}
                    className="w-6 h-6 rounded-full"
                  />
                  <div className="flex items-center">
                    <span className="font-medium">{article.author}</span>
                    <span className="mx-2">|</span>
                    <span>{getTimeAgo(article.publishedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNumber) => (
                  // biome-ignore lint/a11y/useButtonType: <explanation>
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${
                      currentPage === pageNumber
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500">No articles found</div>
      )}
    </div>
  );
}
