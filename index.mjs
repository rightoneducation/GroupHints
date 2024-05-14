import { OpenAI } from "openai"

export async function handler(event) {
     const openai = new OpenAI(process.env.OPENAI_API_KEY);

    // Parse input data from the event object
    const { hints, questionText, correctAnswer } = JSON.parse(event.body);
    // prompt for open ai
    // first specify the format returned via the role
    const formattedHints = hints?.map((hint) => `${hint.teamName}: ${hint.rawHint}`).join("\n");
    console.log(formattedHints);
    let messages = [{
      role: "system",
      content: "You are a helpful assistant designed to output JSON. Respond with a JSON object following this structure: [ { themeText: a 3 - 7 word sentence that describes the theme or category that you've found, teams: [the names of the teams whose responses fall into this category], teamCount: the number of teams in the teams array } ]"
    }];
       
    // then provide the actual content
    messages.push({
      role: "user",
      content: `
        Given this question: ${questionText} with a correct answer of ${correctAnswer}.
        Analyze student responses from a class and identify any common themes or categories they can be grouped into.
        Each response has the following format: team name: "hint text".
        The responses are here:
        ${formattedHints}
        Categorize these responses into distinct themes or patterns you identify. Do not include the word theme or pattern in this category. If there is the mention of different mathematical operation (addition/subtraction/simplification), sort each into a separate category. Do not include generalize categories related to math (example: 'advice on mathematical operations' is unacceptable). 
        If there is only one answer provided, just return its hint text as a single category. Do not append any text to it. Only do this for cases with one answer.
        Otherwise, categories should not match submitted responses exactly. They should be a generalization of the responses.
        Do not provide any content outside of the requested JSON object, this is of the utmost importance.
        Include the number of responses that fall into each category as well as the associated team names. 
        `
    });
    console.log(messages);
    try {
        // Make the API call to OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o', 
            messages: messages,
        });
        // Return the response
        return {
            statusCode: 200,
            body: JSON.stringify({
                gptHints: completion.choices[0].message
            }),
        };
    } catch (error) {
        console.error(error);
        // Handle any errors
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error processing your request' }),
        };
    }
};


    
 
