"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { CalendarIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type DateFilterProps = {
  value?: string | null;
  className?: string;
};

export function DateFilter({ value, className }: DateFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedDate = value ? parseISO(value) : undefined;

  const updateDate = (date?: Date) => {
    const params = new URLSearchParams(searchParams.toString());

    if (date) {
      params.set("date", format(date, "yyyy-MM-dd"));
    } else {
      params.delete("date");
    }

    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="rounded-full border-[#1f1a17]/10 bg-[#fffaf3] text-[#1f1a17] hover:bg-[#efe3d3]"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto border-[#1f1a17]/10 bg-[#fffaf3] p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => updateDate(date || undefined)}
          />
        </PopoverContent>
      </Popover>
      {selectedDate ? (
        <Button
          variant="ghost"
          className="rounded-full text-[#a54d2d] hover:bg-[#f1e4d5] hover:text-[#8f4023]"
          onClick={() => updateDate(undefined)}
        >
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
