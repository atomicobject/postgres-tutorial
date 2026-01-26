export default async function Home() {
  const categoryStats = [
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

  const formatCategory = (category: string) => {
    return category.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Postgres Workshop</h1>
      <p>Next.js + PostgreSQL running in Docker</p>

      {/* TODO: Top Performing super hero */}

      {categoryStats.map((stat) => (
        <section
          key={stat.category}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "1rem",
            marginTop: "1rem",
          }}
        >
          <h2>{formatCategory(stat.category)}</h2>
          <div style={{ display: "flex", gap: "2rem" }}>
            <div>
              <h3>Best Performance</h3>
              <p>{stat.best_question}</p>
            </div>
            <div>
              <h3>Worst</h3>
              <p>{stat.worst_question}</p>
            </div>
          </div>
        </section>
      ))}

      {/* TODO: Top Equipment for each type */}
      {/* TODO: Search box which list all goals that mention the word you type eg "teamwork" */}
    </main>
  );
}
