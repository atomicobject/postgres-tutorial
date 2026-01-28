## Goal: Search goals using an input box

### Examine our Data

Ok let's look at our table first. Each row has assessment results as a jsonb field. This is a special Postgres data type that allows you to query within the table. [Learn more about JSONB](https://www.crunchydata.com/developers/playground/basics-of-jsonb)

`assessment_result` field looks like this:

```
{
    ...
  "Team Goals": {
    "oneYear": "Foil several villain plots, survive at least one plan going sideways, and turn messy fights into repeatable hero tactics without burning out the team.",
    "threeYear": "Lead a resilient hero unit that stays adaptable as villains evolve their tricks and tech while sharpening The Tracker's signature move each mission."
  },
   ...
}
```

We want to search within the one year goals given a string and find any goals that match that string

### Step 1 - Get all the `oneYear` entries from under the `Team Goals` category, across all superheroes.

You can simply drill down into the JSON structure using arrows. Notice the double arrow `->>` on the final level of the query.

```
SELECT assessment_result->'Team Goals'->>'oneYear' AS "one_year_goal" from assessments
```

### Step 2 - Match on a string, case insensitive

```
SELECT assessment_result->'Team Goals'->>'oneYear' AS "one_year_goal" from assessments
WHERE assessment_result->'Team Goals'->>'oneYear' ILIKE '%teamwork%'
```

That's it! now you're ready to put this into your app. Just remember to replace "teamwork" with the variable name as indicated.

## 🦸‍♀️ DONE! 🦸🏾‍♂️