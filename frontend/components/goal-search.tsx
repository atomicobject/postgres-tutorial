"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type Goal = {
  one_year_goal: string;
};

type GoalSearchProps = {
  searchAction: (searchTerm: string) => Promise<Goal[]>;
};

export function GoalSearch({ searchAction }: GoalSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Goal[]>([]);

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    if (value.trim() === "") {
      setResults([]);
      return;
    }
    const goals = await searchAction(value);
    setResults(goals);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Search Goals</h2>
      <Input
        type="text"
        placeholder="Search for goals (e.g. teamwork)"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="mb-4"
      />
      {results.length > 0 && (
        <ul className="space-y-2">
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
  );
}
