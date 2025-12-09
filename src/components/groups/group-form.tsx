"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { SUPPORTED_CURRENCIES, CURRENCY_SYMBOLS } from "@/lib/types";
import type { Currency } from "@/lib/types";

interface GroupFormData {
  name: string;
  description?: string;
  budgetMin?: number;
  budgetMax?: number;
  currency: string;
  exchangeDate?: string;
}

interface GroupFormProps {
  onSubmit: (data: GroupFormData) => Promise<void>;
  loading?: boolean;
  initialData?: Partial<GroupFormData>;
}

export function GroupForm({
  onSubmit,
  loading = false,
  initialData,
}: GroupFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [budgetMin, setBudgetMin] = useState(
    initialData?.budgetMin ? String(initialData.budgetMin / 100) : ""
  );
  const [budgetMax, setBudgetMax] = useState(
    initialData?.budgetMax ? String(initialData.budgetMax / 100) : ""
  );
  const [currency, setCurrency] = useState<Currency>(
    (initialData?.currency as Currency) || "USD"
  );
  const [exchangeDate, setExchangeDate] = useState<Date | undefined>(
    initialData?.exchangeDate ? new Date(initialData.exchangeDate) : undefined
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data: GroupFormData = {
      name: name.trim(),
      currency,
    };

    if (description.trim()) {
      data.description = description.trim();
    }

    if (budgetMin) {
      data.budgetMin = Math.round(parseFloat(budgetMin) * 100);
    }

    if (budgetMax) {
      data.budgetMax = Math.round(parseFloat(budgetMax) * 100);
    }

    if (exchangeDate) {
      data.exchangeDate = exchangeDate.toISOString();
    }

    await onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Group Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Group Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Family Secret Santa 2024"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="A fun gift exchange for the whole family..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          {description.length}/500 characters
        </p>
      </div>

      {/* Exchange Date */}
      <div className="space-y-2">
        <Label>Exchange Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !exchangeDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {exchangeDate ? (
                format(exchangeDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={exchangeDate}
              onSelect={setExchangeDate}
              initialFocus
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
        <p className="text-xs text-muted-foreground">
          When will gifts be exchanged?
        </p>
      </div>

      {/* Currency */}
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_CURRENCIES.map((curr) => (
              <SelectItem key={curr} value={curr}>
                {CURRENCY_SYMBOLS[curr]} {curr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Budget Range */}
      <div className="space-y-2">
        <Label>Budget Range (Optional)</Label>
        <div className="flex gap-4">
          <div className="flex-1 space-y-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {CURRENCY_SYMBOLS[currency]}
              </span>
              <Input
                type="number"
                placeholder="Min"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                min="0"
                step="0.01"
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">Minimum</p>
          </div>
          <div className="flex-1 space-y-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {CURRENCY_SYMBOLS[currency]}
              </span>
              <Input
                type="number"
                placeholder="Max"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                min="0"
                step="0.01"
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">Maximum</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Set a suggested budget range for gifts
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-christmas-red hover:bg-christmas-red/90"
        disabled={loading || !name.trim()}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        ) : initialData ? (
          "Save Changes"
        ) : (
          "Create Group"
        )}
      </Button>
    </form>
  );
}
