"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Check, X, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default:
          "border-foreground/10 text-foreground bg-card hover:bg-card/80",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted:
          "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface MultiSelectProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof multiSelectVariants> {
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  onValueChange: (value: string[]) => void;
  defaultValue: string[];
  placeholder?: string;
  animation?: number;
  maxCount?: number;
  asChild?: boolean;
  className?: string;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>((
  {
    options,
    onValueChange,
    variant,
    defaultValue = [],
    placeholder = "Select options",
    animation = 0,
    maxCount = 3,
    asChild = false,
    className,
    ...props
  },
  ref
) => {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const name = (props as any).name as string | undefined;

  React.useEffect(() => {
    setSelectedValues(defaultValue);
  }, [defaultValue]);

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setIsPopoverOpen(true);
    }
    else if (event.key === "Backspace" && !event.currentTarget.value) {
      const newSelectedValues = [...selectedValues];
      newSelectedValues.pop();
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    }
  };

  const toggleOption = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    setSelectedValues(newSelectedValues);
    onValueChange(newSelectedValues);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      {/* Hidden inputs to submit selected values */}
      {name && selectedValues.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          {...props}
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className="flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-card"
        >
          {selectedValues.length > 0 ? (
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-wrap items-center">
                {selectedValues.slice(0, maxCount).map((value) => {
                  const option = options.find((o) => o.value === value);
                  const IconComponent = option?.icon;
                  return (
                    <Badge
                      key={value}
                      className={cn(multiSelectVariants({ variant, className }))}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
                      {option?.label}
                      <X
                        className="h-4 w-4 ml-2 cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleOption(value);
                        }}
                      />
                    </Badge>
                  );
                })}
                {selectedValues.length > maxCount && (
                  <Badge
                    className={cn("bg-transparent text-foreground border-foreground/10", multiSelectVariants({ variant, className }))}
                    style={{ animationDuration: `${animation}s` }}
                  >
                    {`+ ${selectedValues.length - maxCount} more`}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <X
                  className="h-4 w-4 cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedValues([]);
                    onValueChange([]);
                  }}
                />
                <span className="mx-2">|</span>
                <ChevronsUpDown className="h-4 w-4" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full mx-auto">
              <span className="text-sm text-muted-foreground mx-3">{placeholder}</span>
              <ChevronsUpDown className="h-4 w-4 mx-2" />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." onKeyDown={handleInputKeyDown} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                    style={{ pointerEvents: "auto", opacity: 1 }}
                    className="cursor-pointer"
                  >
                    <div className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                    )}>
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
