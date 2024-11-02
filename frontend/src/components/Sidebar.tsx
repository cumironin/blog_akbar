import { useGetMenuItems } from "@/api/menuApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigation = useNavigate();
  const { checkElementPermission } = useAuth();

  // Fetch menu items using the hook
  const { data: menuItems, isLoading, error } = useGetMenuItems();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // Function to get the Lucide icon component
  const getIconComponent = (iconName: string) => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.HelpCircle; // Fallback to HelpCircle if icon not found
  };

  // Function to check if a menu item should be visible
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const isMenuItemVisible = (item: any) => {
    if (item.label === "Menu" || item.label === "Role") return false;

    const urlParts = item.url.split("/");
    const elementType = urlParts[urlParts.length - 1]; // Get the last part of the URL
    return checkElementPermission(elementType, "read");
  };

  return (
    <div
      className={cn(
        "bg-white h-screen p-4 transition-all duration-200 ease-in-out flex flex-col relative",
        collapsed ? "w-20" : "w-48"
      )}
    >
      <div
        className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "justify-between",
          "mb-6"
        )}
      >
        {collapsed ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/01.png" alt="@johndoe" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        ) : (
          <span className="text-[16px] font-bold">Lingkar Wilayah</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className={cn(
            collapsed ? "hover:bg-transparent" : "hover:bg-transparent"
          )}
        >
          {collapsed ? (
            <LucideIcons.ChevronRight className="h-[25px] w-[25px] absolute ml-12 z-50 rounded-2xl bg-slate-200" />
          ) : (
            <LucideIcons.ChevronLeft className="h-[25px] w-[25px] absolute ml-16 z-50 rounded-2xl bg-slate-200" />
          )}
        </Button>
      </div>
      <nav className="space-y-2 flex-grow">
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error loading menu items</div>
        ) : (
          <TooltipProvider>
            {(menuItems || []).map((item, index, array) => {
              if (!isMenuItemVisible(item)) return null; // Hide unauthorized items

              const IconComponent = getIconComponent(item.icon);
              return (
                <div key={item.label}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full",
                          collapsed ? "justify-center px-0" : "justify-start",
                          "mr-0"
                        )}
                        onClick={() => item.url && navigation(item.url)}
                      >
                        <IconComponent
                          className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-3")}
                        />
                        {!collapsed && <span>{item.label}</span>}
                      </Button>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                  {item.label === "Pages" && index < array.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              );
            })}
          </TooltipProvider>
        )}
      </nav>
      <Separator
        orientation="vertical"
        className="absolute right-0 top-0 bottom-0 w-[1.5px]"
      />
    </div>
  );
};

export default Sidebar;
