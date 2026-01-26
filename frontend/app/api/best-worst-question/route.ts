import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
      category: "missionPlanning",
      best_question: "<<UNKNOWN>>",
      worst_question: "<<UNKNOWN>>",
    },
    {
      category: "teamDynamics",
      best_question: "<<UNKNOWN>>",
      worst_question: "<<UNKNOWN>>",
    },
    {
      category: "techAndTactics",
      best_question: "<<UNKNOWN>>",
      worst_question: "<<UNKNOWN>>",
    },
  ];

  return NextResponse.json(data);
}
