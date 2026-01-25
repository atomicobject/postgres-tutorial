import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/app",
});

async function seed() {
  const client = await pool.connect();

  try {
    // Create table
    await client.query(`
      DROP TABLE IF EXISTS assessments;
      
      CREATE TABLE assessments (
        id INTEGER PRIMARY KEY,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        superhero_name VARCHAR(255) NOT NULL,
        assessment_result JSONB NOT NULL
      );
    `);

    console.log("Created assessments table");

    // Load and insert data
    const dataPath = join(__dirname, "../../research/superhero_mission_readiness_wrapped_30.json");
    const rawData = readFileSync(dataPath, "utf-8");
    const assessments = JSON.parse(rawData);

    for (const assessment of assessments) {
      await client.query(
        `INSERT INTO assessments (id, created_at, updated_at, superhero_name, assessment_result)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          assessment.id,
          assessment.createdAt,
          assessment.updatedAt,
          assessment.superheroName,
          assessment.assessmentResult, // pg will handle JSON string -> JSONB
        ]
      );
    }

    console.log(`Inserted ${assessments.length} assessments`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
