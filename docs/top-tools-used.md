## Goal: Get Most Frequently Selected tool for each Category

### Examine our Data

Ok let's look at our table first. Each row has assessment results as a jsonb field. This is a special Postgres data type that allows you to query within the table. [Learn more about JSONB](https://www.crunchydata.com/developers/playground/basics-of-jsonb)

`assessment_result` field looks like this:

```
{
    ...
    "Equipment Used": {
        "suits": [
            "Nano-armor suit",
            "Stealth suit",
            "Exo-suit"
        ],
        "weapons": [
            "Stun baton",
            "Energy shield projector",
            "Grappling hook launcher"
        ],
        "vehicles": [
            "VTOL dropship"
        ]
    },
   ...
}
```

We want to count how many times each option has been chosen, and get results that look like this, where the most frequently chosen option is under each category.

| suits | vehicles | weapons |
|-------|----------|---------|
| Iron Man Armor | Quinjet | Mjolnir |

### Step 1 - Get all the `suits` entries from under the 'Equipment Used' category, across all superheroes

`jsonb_array_elements_text()` takes all the entries in the array and expands it into rows of text.

```
SELECT
'suits' AS category,
jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'suits') AS tool
FROM
assessments
```

### Step 2 - do the same for `weapons` and `vehicles`, uniting all the results together

Use `UNION ALL` to join data from multiple queries

```
SELECT
'suits' AS category,
jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'suits') AS tool
FROM
assessments
UNION ALL
SELECT
'weapons' AS category,
jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'weapons') AS tool
FROM
assessments
UNION ALL
SELECT
'vehicles' AS category,
jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'vehicles') AS tool
FROM
assessments
```

### Step 3 - Save tools into `all_tools` CTE

```
WITH all_tools AS (
  SELECT
  'suits' AS category,
  jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'suits') AS tool
  FROM
  assessments
  UNION ALL
  SELECT
  'weapons' AS category,
  jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'weapons') AS tool
  FROM
  assessments
  UNION ALL
  SELECT
  'vehicles' AS category,
  jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'vehicles') AS tool
  FROM
  assessments
)
  SELECT
    category,
    tool
  FROM
    all_tools
```

### Step 4 - group tool results by name, count each group

Notice we are grouping by BOTH `category` and `tool`. This way SQL knows which category to put on each row with each tool. It also keeps counts separate if the same tool name appears across categories.

```
WITH all_tools AS (
  SELECT
  'suits' AS category,
  jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'suits') AS tool
  FROM
  assessments
  UNION ALL
  SELECT
  'weapons' AS category,
  jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'weapons') AS tool
  FROM
  assessments
  UNION ALL
  SELECT
  'vehicles' AS category,
  jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'vehicles') AS tool
  FROM
  assessments
)
  SELECT
    category,
    tool,
    COUNT(*) as tool_count
  FROM
    all_tools
  GROUP BY category, tool
```

### Step 5 - Number the rows within each category

Use `ROW_NUMBER` and `PARTITION` to apply numeric values to each row

Select only results where row number is 1, to get top tool.

```
WITH all_tools AS (
  SELECT
  'suits' AS category,
  jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'suits') AS tool
  FROM
  assessments
  UNION ALL
  SELECT
  'weapons' AS category,
  jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'weapons') AS tool
  FROM
  assessments
  UNION ALL
  SELECT
  'vehicles' AS category,
  jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'vehicles') AS tool
  FROM
  assessments
)
SELECT
	category,
	tool,
	COUNT(*) as tool_count,
	ROW_NUMBER() OVER (
		PARTITION BY
			category
		ORDER BY
			COUNT(*) DESC,
			tool ASC
	) AS row_number
FROM
	all_tools
GROUP BY category, tool
```

### Step 6 - Choose top tool from each category

```
WITH all_tools AS (
  SELECT
  'suits' AS category,
  jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'suits') AS tool
  FROM
  assessments
  UNION ALL
  SELECT
  'weapons' AS category,
  jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'weapons') AS tool
  FROM
  assessments
  UNION ALL
  SELECT
  'vehicles' AS category,
  jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'vehicles') AS tool
  FROM
  assessments
)
SELECT
	category, tool
FROM
	(
		SELECT
			category,
			tool,
			ROW_NUMBER() OVER (
				PARTITION BY
					category
				ORDER BY
					COUNT(*) DESC,
					tool ASC
			) AS row_number
		FROM
			all_tools
		GROUP BY
			category,
			tool
	) t
WHERE
	row_number = 1;
```

### Step 7 - Pivot the table!

Now we have a list of categories and tools. What we really want for our UI is for each column to be a category (weapons, suits, vehicles), each with one entry listing the top tool for that category.

This requires us to pivot ⤵️ the table, so the rows become colums.

We are going to do this somewhat manually since we only have 3 rows, naming each column with the row value.

```
WITH all_tools AS (
  SELECT
  'suits' AS category,
  jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'suits') AS tool
  FROM
  assessments
  UNION ALL
  SELECT
  'weapons' AS category,
  jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'weapons') AS tool
  FROM
  assessments
  UNION ALL
  SELECT
  'vehicles' AS category,
  jsonb_array_elements_text(assessments.assessment_result -> 'Equipment Used' -> 'vehicles') AS tool
  FROM
  assessments
)
SELECT
	MAX(tool) FILTER(
    WHERE category='vehicles'
  ) as "vehicle",
	MAX(tool) FILTER(
    WHERE category='suits'
  ) as "suits",
	MAX(tool) FILTER(
    WHERE category='weapons'
  ) as "weapons"
FROM
	(
		SELECT
			category,
			tool,
			ROW_NUMBER() OVER (
				PARTITION BY
					category
				ORDER BY
					COUNT(*) DESC,
					tool ASC
			) AS row_number
		FROM
			all_tools
		GROUP BY
			category,
			tool
	) t
WHERE
	row_number = 1;
```

## 🦸‍♀️ DONE! 🦸🏾‍♂️