"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce";

type Goal = {
  one_year_goal: string;
};

type GoalSearchProps = {
  searchAction: (searchTerm: string) => Promise<Goal[]>;
};

export function GoalSearch({ searchAction }: GoalSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Goal[]>([]);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearch.trim() === "") {
      setResults([]);
      return;
    }
    searchAction(debouncedSearch).then(setResults);
  }, [debouncedSearch, searchAction]);

  return (
    <Card className="h-full flex flex-col col-span-2">
      <CardContent className="pt-4 flex flex-col h-full">
        <Input
          type="text"
          placeholder="Search for goals (e.g. teamwork)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <div className="flex-1 overflow-y-auto">
          {results.length > 0 && (
            <ul className="space-y-2 pr-2">
              {results.map((result, index) => (
                <li key={index}>
                  <Card>
                    <CardContent className="py-3">
                      <p className="font-medium">{result.one_year_goal}</p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
