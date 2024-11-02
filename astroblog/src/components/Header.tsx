import {
  TrendingUp,
  Zap,
  Music,
  Coffee,
  Search,
  Menu,
  MapPinHouse,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { searchArticles } from "../lib/astroblog";

const categories = [
  { name: "Metropolitan", href: "/category/metropolitan", icon: MapPinHouse },
  { name: "Polhukam", href: "/category/polhukam", icon: Zap },
  { name: "Trending", href: "/category/trending", icon: TrendingUp },
  { name: "Entertainment", href: "/category/entertainment", icon: Music },
  { name: "Olahraga", href: "/category/olahraga", icon: Zap },
  { name: "Lifestyle", href: "/category/lifestyle", icon: Coffee },
];

export default function Header() {
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const closeAllOverlays = () => {
    if (searchContainerRef.current)
      searchContainerRef.current.classList.add("hidden");
    if (mobileMenuRef.current) mobileMenuRef.current.classList.add("hidden");
  };

  const handleSearchToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeAllOverlays();
    searchContainerRef.current?.classList.toggle("hidden");
    if (!searchContainerRef.current?.classList.contains("hidden")) {
      searchInputRef.current?.focus();
    }
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeAllOverlays();
    mobileMenuRef.current?.classList.toggle("hidden");
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchValue = searchInputRef.current?.value?.trim();

    if (!searchValue) return;

    window.location.href = `/search?keyword=${encodeURIComponent(
      searchValue.toLowerCase()
    )}`;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const isOutsideSearch = !searchContainerRef.current?.contains(target);
      const isOutsideMenu = !mobileMenuRef.current?.contains(target);

      if (isOutsideSearch && isOutsideMenu) {
        closeAllOverlays();
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  return (
    <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
      <div className="mx-10 px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="text-3xl font-extrabold">
            Lingkar Wilayah
          </a>
          <nav className="hidden md:flex space-x-4" id="categories-nav">
            {categories.map((category) => (
              <a
                key={category.name}
                href={category.href}
                className="flex items-center space-x-1 hover:text-gray-200"
              >
                <category.icon className="w-4 h-4" />
                <span>{category.name}</span>
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div
              ref={searchContainerRef}
              className="hidden fixed left-0 right-0 top-0 px-4 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative max-w-3xl mx-auto">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    ref={searchInputRef}
                    type="search"
                    name="keyword"
                    placeholder="Search news..."
                    className="w-full pl-10 pr-4 py-2 rounded-full bg-white/20 text-white placeholder-gray-300"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" />
                </form>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSearchToggle}
              className="text-white hover:bg-white/20 p-2 rounded-full"
            >
              <Search className="h-6 w-6" />
            </button>

            <button
              type="button"
              onClick={handleMenuToggle}
              className="text-white hover:bg-white/20 md:hidden p-2 rounded-full"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div
              ref={mobileMenuRef}
              className="hidden fixed left-0 right-0 top-16 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg z-50 md:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="flex flex-col space-y-2">
                {categories.map((category) => (
                  <a
                    key={category.name}
                    href={category.href}
                    className="flex items-center space-x-2 hover:bg-white/20 p-2 rounded-lg"
                  >
                    <category.icon className="w-5 h-5" />
                    <span>{category.name}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
