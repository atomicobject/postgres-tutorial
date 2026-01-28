import { query } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function getBestWorstQuestions() {
  let bestWorstQuestions = [
    {
      category: "Mission Planning",
      best_question: "<<UNKNOWN>>",
      worst_question: "<<UNKNOWN>>",
    },
    {
      category: "Team Dynamics",
      best_question: "<<UNKNOWN>>",
      worst_question: "<<UNKNOWN>>",
    },
    {
      category: "Tech and Tactics",
      best_question: "<<UNKNOWN>>",
      worst_question: "<<UNKNOWN>>",
    },
  ];

  // bestWorstQuestions = await query<{
  //   category: string;
  //   best_question: string;
  //   worst_question: string;
  // }>(`
  // ---
  // QUERY GOES HERE
  // ---
  // `);

  return bestWorstQuestions;
}

export default async function Home() {
  const categoryStats = await getBestWorstQuestions();

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Superhero Assessment Results
        </h1>
        <p className="text-muted-foreground mb-8">
          Superhero Mission Readiness Assessment Results
        </p>

        {/* TODO: Top Performing super hero */}

        <div className="grid gap-6">
          {categoryStats.map((stat) => (
            <Card key={stat.category}>
              <CardHeader>
                <CardTitle>{stat.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Best Performance
                    </h3>
                    <p className="text-lg font-semibold text-primary">
                      {stat.best_question}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Needs Improvement
                    </h3>
                    <p className="text-lg font-semibold text-destructive">
                      {stat.worst_question}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* TODO: Top Equipment for each type */}
        {/* TODO: Search box which list all goals that mention the word you type eg "teamwork" */}
      </div>
    </main>
  );
}
