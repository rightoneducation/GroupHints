import { OpenAI } from "openai"

export async function handler(event) {
     const openai = new OpenAI(process.env.OPENAI_API_KEY);

    // Parse input data from the event object
    const { hints, questionText, correctAnswer } = JSON.parse(event.body);
    // prompt for open ai
    // first specify the format returned via the role
    const formattedHints = hints?.map((hint) => `${hint.teamName}: "${hint.rawHint}"`).join("\n");
    console.log(formattedHints);
    let messages = [{
      role: "system",
      content: "You are a helpful assistant designed to output JSON. Respond with a JSON object following this structure: [ { themeText: a 3 - 7 word sentence that describes the theme or category that you've found, teams: [the names of the teams whose responses fall into this category], teamCount: the number of teams in the teams array } ]"
    }];
       
    // then provide the actual content
    messages.push({
      role: "user",
      content: `
        Given the following question: ${questionText} that has a correct answer of ${correctAnswer}.
        Please analyze the following student responses from a class and identify any common themes or categories they can be grouped into:
        ${formattedHints}
        Categorize these responses into distinct themes or patterns you identify. If there is the mention of different mathematical operation (addition/subtraction/simplification), sort each into a separate category. Do not include generalize categories related to math (example: 'advice on mathematical operations' is unacceptable). Include the number of responses that fall into each category as well as the associated team names.
        `
    });

    try {
        // Make the API call to OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4', 
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


    
 
