import { query } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoalSearch } from "@/components/goal-search";

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

async function getTopEquipment() {
  let topEquipment = {
    suits: "<<UNKNOWN>>",
    vehicles: "<<UNKNOWN>>",
    weapons: "<<UNKNOWN>>",
  };

  // topEquipment = (await query<{
  //   suits: string;
  //   vehicles: string;
  //   weapons: string;
  // }>(`
  // ---
  // QUERY GOES HERE
  // ---
  // `))[0];

  return topEquipment;
}

async function searchGoals(searchTerm: string) {
  "use server";
  let goals: { one_year_goal: string }[] = [{ one_year_goal: '<<UNKNOWN>>' }];

  // NOTE:
  // Use $1 as the parameter placeholder, e.g.:
  // WHERE some_column ILIKE '%' || $1 || '%'

  /*************************/

  //   goals = await query<{
  //     one_year_goal: string;
  //   }>(`
  //   ---
  // QUERY GOES HERE
  //   ---
  //   `, [searchTerm]);

  return goals;
}

export default async function Home() {
  const categoryStats = await getBestWorstQuestions();
  const topEquipment = await getTopEquipment();

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Superhero Assessment Results
        </h1>
        <p className="text-muted-foreground mb-8">
          Superhero Mission Readiness Assessment Results
        </p>

        <div className="grid gap-6">
          {categoryStats.map((stat) => (
            <Card key={stat.category}>
              <CardHeader>
                <CardTitle>{stat.category} Questions</CardTitle>
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

        <div className="grid grid-cols-3 gap-6 mt-8">
          <GoalSearch searchAction={searchGoals} />

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Weapon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-primary">{topEquipment.weapons}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Suit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-primary">{topEquipment.suits}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Vehicle</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-primary">{topEquipment.vehicles}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
