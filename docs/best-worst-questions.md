## Goal: Get Best and Worst Question on average For Each Category

### Examine our Data

Ok let's look at our table first. Each row has assessment results as a jsonb field. This is a special Postgres data type that allows you to query within the table. [Learn more about JSONB](https://www.crunchydata.com/developers/playground/basics-of-jsonb)

`assessment_result` field looks like this:

```
{
    "Battle Planning": {
        "Assigning heroic roles based on each hero's powers": 3,
        "Clearly defining how the villain would be defeated": 1,
        "Planning to minimize collateral damage to the city": 2,
        "Anticipating villain traps, twists, and dirty tricks": 1,
        "Reviewing the fight afterward to level up for next time": 2,
        "Preparing backup plans when the first plan inevitably failed": 2
    },
    "Hero Team Synergy": {
        "Communicating clearly during high-stakes fights": 1,
        "Training and supporting new heroes joining the team": 5,
        "Trusting teammates to handle their part of the fight": 2,
        "Handling ego clashes and dramatic tension constructively": 2,
        "Keeping morale high even when the villain had the upper hand": 5,
        "Executing multi-step plans without stepping on each other's capes": 1
    },
    "Gadgets & Combat Tricks": {
        "Keeping hero comms secure during the showdown": 5,
        "Defending against villain tech, hacks, or sabotage": 5,
        "Using sensors, scans, or intel to track villain activity": 1,
        "Using standard battle playbooks effectively in the field": 4,
        "Improvising heroically when gadgets broke or went missing": 1,
        "Building, upgrading, or repurposing gadgets under pressure": 1
    },
  ...
}
```

Our goal is to get average responses for each question, then choose the question that scores the best and the one that scores the worst for each category:

| category | best | worst |
|----------|------|-------|
| Battle Planning | (best question result) | (worst question result) |
| Gadgets & Combat Tricks | (best question result) | (worst question result) |
| Hero Team Synergy | (best question result) | (worst question result) |

### Step 1 - Get all the results from under the 'Battle Planning' category

`jsonb_each_text()` converts the JSON object into multiple rows

```
SELECT jsonb_each_text(assessment_result->'Battle Planning')
FROM assessments
```

### Step 2 - make columns for the key (question name) and value (assessment result)

`CROSS JOIN LATERAL` converts the results into columns for `key` and `value`

```
SELECT key, value
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Battle Planning')
```

### Step 3 - now let's group those questions together and get average score for each question for a given category

```
SELECT key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Battle Planning')
GROUP BY key
```

### Step 4 - recreate this query for each category we've got

```
SELECT key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Gadgets & Combat Tricks')
GROUP BY key
```

```
SELECT key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Hero Team Synergy')
GROUP BY key
```

Ok now we have three separate queries. We don't want to have to hit the database 3 times for this data. What do you think we want to do next?

### Step 5 - unite this data together

Use `UNION ALL` to join data from multiple queries

```
SELECT key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Battle Planning')
GROUP BY key
UNION ALL
SELECT key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Gadgets & Combat Tricks')
GROUP BY key
UNION ALL
SELECT key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Hero Team Synergy')
GROUP BY key
```

Nice! Now all the results are together. But I can't tell what category they belong to anymore. What should I do next?

### Step 6 - Add another column for category.

We're doing this manually so that we don't have to do an extra query to get that value. We could technically name it anything we want. Here's an example with just one category.

```
SELECT 'My Category' AS category, key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Battle Planning')
GROUP BY key
```

And now the whole query:

```
SELECT 'Battle Planning' as category, key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Battle Planning')
GROUP BY key
UNION ALL
SELECT 'Gadgets & Combat Tricks' as category, key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Gadgets & Combat Tricks')
GROUP BY key
UNION ALL
SELECT 'Hero Team Synergy' as category, key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Hero Team Synergy')
GROUP BY key
```

Ok now we want to query on our query to get the best question. This is where we need a [CTE - Common Table Expression.](https://neon.com/postgresql/postgresql-tutorial/postgresql-cte)

### Step 7 - Save this query as a CTE

`WITH question_avgs AS (query)` allows you to save the results of your query as a temporary result set. You can then query on this set as if you were querying a table in your database. In our case, we're saving it as `question_avgs`.

```
WITH question_avgs AS (
  SELECT 'Battle Planning' AS category, key AS question, AVG(value::numeric) AS avg_score
  FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Battle Planning')
  GROUP BY key
  UNION ALL
  SELECT 'Gadgets & Combat Tricks', key, AVG(value::numeric)
  FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Gadgets & Combat Tricks')
  GROUP BY key
  UNION ALL
  SELECT 'Hero Team Synergy', key, AVG(value::numeric)
  FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Hero Team Synergy')
  GROUP BY key
)
SELECT category, question, avg_score
FROM question_avgs
```

### Step 8 - Use Row numbers and Partitions to get the best question in each category

`ROW_NUMBER` assigns a sequential number to each row.

`PARITION BY` groups rows by category name.

This combination means that each category will be sorted by `avg_score` and assigned a number, where `1` is the best score for each category.

```
WITH question_avgs AS (
  SELECT 'Battle Planning' AS category, key AS question, AVG(value::numeric) AS avg_score
  FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Battle Planning')
  GROUP BY key
  UNION ALL
  SELECT 'Gadgets & Combat Tricks', key, AVG(value::numeric)
  FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Gadgets & Combat Tricks')
  GROUP BY key
  UNION ALL
  SELECT 'Hero Team Synergy', key, AVG(value::numeric)
  FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Hero Team Synergy')
  GROUP BY key
)
    SELECT category, question, avg_score,
           ROW_NUMBER() OVER (PARTITION BY category ORDER BY avg_score DESC, question ASC) rn
    FROM question_avgs
```

### Step 9 - Select the best question for each category

Which one is the best? Where row number (saved as `rn`) is equal to 1.

```
WITH question_avgs AS (
  SELECT 'Battle Planning' AS category, key AS question, AVG(value::numeric) AS avg_score
  FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Battle Planning')
  GROUP BY key
  UNION ALL
  SELECT 'Gadgets & Combat Tricks', key, AVG(value::numeric)
  FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Gadgets & Combat Tricks')
  GROUP BY key
  UNION ALL
  SELECT 'Hero Team Synergy', key, AVG(value::numeric)
  FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Hero Team Synergy')
  GROUP BY key
)
  SELECT category, question AS best_question
  FROM (
    SELECT category, question, avg_score,
           ROW_NUMBER() OVER (PARTITION BY category ORDER BY avg_score DESC, question ASC) rn
    FROM question_avgs
  ) s WHERE rn = 1
```

### Step 10 - Save `best` as a CTE

This way we can start to query for worst questions too. Don't forget your comma before `best`!

```
WITH question_avgs AS (
  SELECT 'Battle Planning' AS category, key AS question, AVG(value::numeric) AS avg_score
  FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Battle Planning')
  GROUP BY key
  UNION ALL
  SELECT 'Gadgets & Combat Tricks', key, AVG(value::numeric)
  FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Gadgets & Combat Tricks')
  GROUP BY key
  UNION ALL
  SELECT 'Hero Team Synergy', key, AVG(value::numeric)
  FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Hero Team Synergy')
  GROUP BY key
),
best AS (
  SELECT category, question AS best_question
  FROM (
    SELECT category, question,
           ROW_NUMBER() OVER (PARTITION BY category ORDER BY avg_score DESC, question ASC) rn
    FROM question_avgs
  ) s WHERE rn = 1
)
SELECT
  best.category,
  best.best_question
FROM best
```

### Step 11 - Add `worst` CTE

Use `best` format to create a `worst` CTE. Only difference is the `ORDER BY` direction is `ASC`. And we'll name our selected question `worst_question`

```
WITH question_avgs AS (
  SELECT 'Battle Planning' AS category, key AS question, AVG(value::numeric) AS avg_score
  FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Battle Planning')
  GROUP BY key
  UNION ALL
  SELECT 'Gadgets & Combat Tricks', key, AVG(value::numeric)
  FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Gadgets & Combat Tricks')
  GROUP BY key
  UNION ALL
  SELECT 'Hero Team Synergy', key, AVG(value::numeric)
  FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Hero Team Synergy')
  GROUP BY key
),
best AS (
  SELECT category, question AS best_question
  FROM (
    SELECT category, question,
           ROW_NUMBER() OVER (PARTITION BY category ORDER BY avg_score DESC, question ASC) rn
    FROM question_avgs
  ) s WHERE rn = 1
),
worst AS (
  SELECT category, question AS worst_question
  FROM (
    SELECT category, question,
           ROW_NUMBER() OVER (PARTITION BY category ORDER BY avg_score ASC, question ASC) rn
    FROM question_avgs
  ) s WHERE rn = 1
)
SELECT
  worst.category,
  worst.worst_question
FROM worst
```

### Step 12 - Join `best` and `worst` into same final `SELECT`

`JOIN worst USING (category)` matches the two CTE results where category is the same. This way we can have a row for each one.

```
WITH question_avgs AS (
  SELECT 'Battle Planning' AS category, key AS question, AVG(value::numeric) AS avg_score
  FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Battle Planning')
  GROUP BY key
  UNION ALL
  SELECT 'Gadgets & Combat Tricks', key, AVG(value::numeric)
  FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Gadgets & Combat Tricks')
  GROUP BY key
  UNION ALL
  SELECT 'Hero Team Synergy', key, AVG(value::numeric)
  FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Hero Team Synergy')
  GROUP BY key
),
best AS (
  SELECT category, question AS best_question
  FROM (
    SELECT category, question,
           ROW_NUMBER() OVER (PARTITION BY category ORDER BY avg_score DESC, question ASC) rn
    FROM question_avgs
  ) s WHERE rn = 1
),
worst AS (
  SELECT category, question AS worst_question
  FROM (
    SELECT category, question,
           ROW_NUMBER() OVER (PARTITION BY category ORDER BY avg_score ASC, question ASC) rn
    FROM question_avgs
  ) s WHERE rn = 1
)
SELECT
  worst.category,
  worst.worst_question,
  best.best_question
FROM best
JOIN worst USING (category)
```

## 🦸‍♀️ DONE! 🦸🏾‍♂️