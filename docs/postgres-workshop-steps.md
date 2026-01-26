## Get Best Question For Each Category

### Categories:

```
[
    'Mission Planning',
    'Tech And Tactics',
    'Team Dynamics'
]
```

Ok let's look at our table first. Each row has assessment results as a jsonb field. This is a special Postgres data type that allows you to query within the table. [Learn more about JSONB](https://www.crunchydata.com/developers/playground/basics-of-jsonb)

### Step 1 - Get all the results from under the 'Mission Planning' category

`jsonb_each_text` converts the JSON object into multiple rows

```
SELECT jsonb_each_text(assessment_result->'Mission Planning')
FROM assessments
```

### Step 2 - make columns for the key (question name) and value (assessment result)

`CROSS JOIN LATERAL` converts the results into columns for `key` and `value`

```
SELECT key, value
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Mission Planning')
```

### Step 3 - now let's group those questions together and get average score for each question for a given category

```
SELECT key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Mission Planning')
GROUP BY key
```

### Step 4 - recreate this query for each category we've got

```
SELECT key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Tech And Tactics')
GROUP BY key
```

```
SELECT key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Team Dynamics')
GROUP BY key
```

Ok now we have three separate queries. We don't want to have to hit the database 3 times for this data. What do you think we want to do next?

### Step 5 - unite this data together

Use `UNION ALL` to join data from multiple queries

```
SELECT key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Mission Planning')
GROUP BY key
UNION ALL
SELECT key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Tech And Tactics')
GROUP BY key
UNION ALL
SELECT key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Team Dynamics')
GROUP BY key
```

Nice! Now all the results are together. But I can't tell what category they belong to anymore. What should I do next?

### Step 6 - Add another column for category.

We're doing this manually so that we don't have to do an extra query to get that value. We could technically name it anything we want. Here's an example with just one category.

```
SELECT 'My Category' AS category, key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Mission Planning')
GROUP BY key
```

And now the whole query:

```
SELECT 'Mission Planning' as category, key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Mission Planning')
GROUP BY key
UNION ALL
SELECT 'Tech And Tactics' as category, key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Tech And Tactics')
GROUP BY key
UNION ALL
SELECT 'Team Dynamics' as category, key AS question, AVG(value::numeric) AS avg_score
FROM assessments CROSS JOIN LATERAL jsonb_each_text(assessment_result->'Team Dynamics')
GROUP BY key
```

Ok now we want to query on our query to get the best question. This is where we need a CTE - Common Table Expression.