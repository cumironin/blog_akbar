import { fetchUserDetails, getSessionId, logoutUser } from "@/api/authApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, UserCircle } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    image_url: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const sessionData = await getSessionId();
        // biome-ignore lint/complexity/useOptionalChain: <explanation>
        if (sessionData && sessionData.userId) {
          const userDetails = await fetchUserDetails(sessionData.userId);
          setUser({
            id: sessionData.userId,
            name: userDetails.name,
            email: userDetails.email,
            image_url: userDetails.image_url,
          });
        } else {
          throw new Error("No valid session found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch user data"
        );
        navigate("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  return (
    <header className="p-4 flex justify-end items-center bg-white shadow-sm">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {user?.image_url ? (
                <AvatarImage
                  src={`${import.meta.env.VITE_API_BASE_URL}${user.image_url}`}
                  alt={user?.name || "User"}
                />
              ) : (
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              {loading ? (
                <p className="text-sm font-medium leading-none">Loading...</p>
              ) : error ? (
                <p className="text-sm font-medium leading-none text-red-500">
                  {error}
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium leading-none">
                    {user?.name || "No name available"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "No email available"}
                  </p>
                </>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => user && navigate(`/dashboard/users/${user.id}`)}
            >
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              try {
                await logoutUser();
                // Redirect to login page after successful logout
                window.location.href = "/auth/login";
              } catch (error) {
                console.error("Logout failed:", error);
                // Handle logout error (e.g., show an error message to the user)
              }
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Header;
