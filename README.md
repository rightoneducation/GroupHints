## GroupHints
Lambda function that provides student-generated hints to OpenAI for categorization.

### File Breakdown:

`index.mjs` - the Javascript code provided to the NodeJS Lambda function

### Updating Lambda Function:

1. Pull this repo, make changes, test, commit
2. Run `zip -r group-hints-lambda.zip . -x '*.git*'` per https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html
3. Upload zip to `groupHints` Lambda function on console

Note: `node_modules` and the `.zip` file are listed in `.gitignore`

### Prompt:
- Input tokens: ~250 + hints submitted by students (varies with length of question and correct answer that is supplied in the prompt for context). 
- Expected output tokens: ~100 

```
 let messages = [{
      role: "system",
      content: "You are a helpful assistant designed to output JSON. Respond with a JSON object following this structure: [ { themeText: a 3 - 7 word sentence that describes the theme or category that you've found, teams: [the names of the teams whose responses fall into this category], teamCount: the number of teams in the teams array } ]"
    }];
       
    messages.push({
      role: "user",
      content: `
        Given the following question: ${questionText} that has a correct answer of ${correctAnswer}.
        Please analyze the following student responses from a class and identify any common themes or categories they can be grouped into:
        ${formattedHints}
        Categorize these responses into distinct themes or patterns you identify. If there is the mention of different mathematical operation (addition/subtraction/simplification), sort each into a separate category. Do not include generalize categories related to math (example: 'advice on mathematical operations' is unacceptable). Include the number of responses that fall into each category as well as the associated team names.
        `
    });
```

Notes:
1. An example was initially provided but was removed to reduce input token length. It didn't seem to measurably impact precision or consistency in the response. 
2. We try to stray from outlining specific rules in the prompt but we did need to specify that individual mathematical operations should be considered unique. This is to avoid receiving categories like "advice on mathematical operation" when we care about the distinct operation itself. 


### Standardized Inputs:
Here are some test cases that can be used to verify responses in case we change out the model. There is subtle variation across results but I believe they are largely acceptable. 

Numeric Question:
```
Question:
What is the interior angle of a stop sign?
Answer:
1080

Example Hints 
1. I think you need to add the angles together
2. I think you need to multiply the angles
3. You should add the angles
4. I don’t know

Example output 1:
[
  {
    "themeText": "Suggests adding the angles",
    "teams": ["Team d d", "Team b b"],
    "teamCount": 2
  },
  {
    "themeText": "Suggests multiplying the angles",
    "teams": ["Team c c"],
    "teamCount": 1
  },
  {
    "themeText": "Student is uncertain",
    "teams": ["Team a a"],
    "teamCount": 1
  }
]
Example output 2
[
  {
    "themeText": "Suggest to add the angles",
    "teams": ["Team d d", "Team b b"],
    "teamCount": 2
  },
  {
    "themeText": "Suggest to multiply the angles",
    "teams": ["Team c c"],
    "teamCount": 1
  },
  {
    "themeText": "Uncertain about the answer",
    "teams": ["Team a a"],
    "teamCount": 1
  }
]
Example Output 3:
[
  {
    "themeText": "Add the angles",
    "teams": ["Team d d", "Team b b"],
    "teamCount": 2
  },
  {
    "themeText": "Multiplication suggested",
    "teams": ["Team c c"],
    "teamCount": 1
  },
  {
    "themeText": "Student is uncertain",
    "teams": ["Team a a"],
    "teamCount": 1
  }
]
```

Mathematical Expression Question: 

```
Simplify this expression: x^2(3x - 5 + 2x^2) - x(4x^2 + 6 - 3x) + 12x^2
Answer:
2x^4 - x^3 + 10x^2 - 6x

Example Hints 
1. Begin by collecting like terms
2. Remember to follow the order of operations
3. Collect like terms first
4. It looks rainy outside

Note: this should avoid returning results that group hints 1,2,3 under a category like "Operational Advice."

Example Output 1:
[
    { 
        "themeText": "Discussing Similar Terms Collection", 
        "teams": ["Team d d", "Team b b"], 
        "teamCount": 2 
    },
    { 
        "themeText": "Mentioning Order of Operations", 
        "teams": ["Team c c"], 
        "teamCount": 1 
    },
    {
        "themeText": "Unrelated to Math Task",
        "teams": ["Team a a"], 
        "teamCount": 1
    }
]

Example Output 2:
[
    {
        "themeText": "Advice on collecting like terms",
        "teams": ["Team d d", "Team b b"],
        "teamCount": 2
    },
    {
        "themeText": "Emphasis on order of operations",
        "teams": ["Team c c"],
        "teamCount": 1
    },
    {
        "themeText": "Unrelated to problem",
        "teams": ["Team a a"],
        "teamCount": 1
    }
]

Example Output 3:
[
    { 
        "themeText": "Advice on collecting like terms", 
        "teams": ["Team d d", "Team b b"], 
        "teamCount": 2 
    },
    {
        "themeText": "Reminder about order of operations", 
        "teams": ["Team c c"], 
        "teamCount": 1 
    },
    {
        "themeText": "Unrelated to Math problem", 
        "teams": ["Team a a"], 
        "teamCount": 1 
    }
]
```

String Question:

```
Example Question:
From the Latin word for almond, this part of the brain helps with implicit memory, which allows you to remember how to do certain things without remembering how you learned them (like riding a bike or tying your shoes).

Example Answer:
Amygdala

Example Hints:
1. It starts with a
2. Think about the root of almond
3. Think of the first part of almond
4. It’s a part of the brain

Example Output 1:
[
    {
        "themeText": "Hints involving almond",
        "teams": ["Team c c", "Team b b"],
        "teamCount": 2
    },
    {
        "themeText": "Hints about word's beginning",
        "teams": ["Team d d"],
        "teamCount": 1
    },
    {
        "themeText": "Mention of the brain",
        "teams": ["Team a a"],
        "teamCount": 1
    }
]

Example Output 2:
[
  { 
    "themeText": "Hints using almond association",
    "teams": ["Team c c", "Team b b"],
    "teamCount": 2
  },
  {
    "themeText": "Directly mentioning brain part",
    "teams": ["Team a a"],
    "teamCount": 1
  },
  {
    "themeText": "Initial letter clue",
    "teams": ["Team d d"],
    "teamCount": 1
  }
]

Example Output 3:
[
  {
    "themeText": "Hints towards spelling",
    "teams": ["Team a a", "Team c c", "Team b b"],
    "teamCount": 3
  },
  {
    "themeText": "Descriptive identification",
    "teams": ["Team d d"],
    "teamCount": 1
  }
]
```
