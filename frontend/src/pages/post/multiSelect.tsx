import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Category } from "../category/types";

type ComboboxProps = {
  className?: string;
  data: Category[] | undefined;
  isLoading: boolean;
  error: unknown;
  placeholder: string;
  onValueChange: (value: string[]) => void;
  value: string[];
  // multiple?: boolean;
};

export function Combobox({
  className,
  data,
  isLoading,
  error,
  placeholder,
  onValueChange,
  value,
}: // multiple = false,
ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  // const [values, setValues] = React.useState<string[]>([]);

  const handleSetValue = (val: string) => {
    let newValues: string[];
    // if (multiple) {
    // If multiple selection is allowed
    if (value.includes(val)) {
      // If the value is already selected, remove it
      newValues = value.filter((v) => v !== val);
    } else {
      // If the value is not selected, add it to the array
      newValues = [...value, val];
    }
    // } else {
    // 	// If single selection is allowed
    // 	// Set the new value as a single-item array
    // 	newValues = [val];
    // 	// Close the popover after selection in single-select mode
    // 	setOpen(false);
    // }
    // Update the local state with the new values
    // setValues(newValues);
    // Call the onValueChange prop with the new values
    // This allows the parent component to react to the change
    onValueChange(newValues);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          // biome-ignore lint/a11y/useSemanticElements: <explanation>
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-[2.5rem] h-auto items-start py-2 relative",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 items-center pr-8 flex-1">
            {value.length > 0
              ? value.map((v) => (
                  <div
                    key={v}
                    className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                  >
                    {data?.find((item) => item.id === v)?.title}
                  </div>
                ))
              : placeholder}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 absolute right-3 top-1/2 -translate-y-1/2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0"
        align="start"
        side="bottom"
        sideOffset={5}
      >
        <Command className="w-full">
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            className="w-full"
          />
          <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
          <CommandList className="max-h-[200px] overflow-y-auto">
            <CommandGroup>
              {isLoading ? (
                <CommandItem>Loading...</CommandItem>
              ) : error ? (
                <CommandItem>Error loading data</CommandItem>
              ) : (
                data?.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleSetValue(item.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(item.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.title}
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
