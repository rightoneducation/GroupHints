import { OpenAI } from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

export async function handler(event) {
    const openai = new OpenAI(process.env.OPENAI_API_KEY);

    // Parse input data from the event object
    const { hints, questionText, correctAnswer } = JSON.parse(event.body);
    
    // Format hints
    const formattedHints = hints?.map((hint) => `${hint.teamName}: ${hint.rawHint}`).join("\n");

    console.log(formattedHints);


    // Define Zod schema
    const themeSchema = z.object({
        themeText: z.string(),
        teams: z.array(z.string()),
        teamCount: z.number().int(),
    });

    const structuredResponse = z.object({
        themes: z.array(themeSchema)
    });


    // Initialize messages with system prompt
    let messages = [{
        role: "system",
        content: `You are a helpful assistant designed to output JSON. Respond with a JSON object following this structure: ${structuredResponse}`
    }];

    // Add user prompt
    messages.push({
        role: "user",
        content: `
            Given this question: ${questionText} with a correct answer of ${correctAnswer}.
            Analyze student responses from a class and identify any common themes or categories they can be grouped into.
            Each response has the following format: team name: "hint text".
            The responses are here:
            ${formattedHints}
            Categorize these responses into distinct themes or patterns you identify. Do not include the word theme or pattern in this category. If there is the mention of different mathematical operation (addition/subtraction/simplification), sort each into a separate category. Do not include generalize categories related to math (example: 'advice on mathematical operations' is unacceptable). 
            If there is only one answer provided, just return its hint text as a single category within the "themes" array. Do not append any text to it. Only do this for cases with one answer.
            Otherwise, categories should not match submitted responses exactly. They should be a generalization of the responses.

            Currently, I am receiving a lot of responses from you with made up teams that are outside of those included in the responses above. DO NOT DO THIS. THE ONLY GENERATION YOU SHOULD DO IS FOR THE THEMES. OTHERWISE JUST ORGANIZE EXISTING DATA.

            Do not provide any content outside of the requested JSON object, this is of the utmost importance.
            Include the number of responses that fall into each category as well as the associated team names. 
            Never provide any made up or generated responses. Only ever give back responses that have been sent over in the teams array. Do not make anything up.
        `
    });

    console.log(messages);

    try {
        // Make the API call to OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o', 
            messages: messages,
            response_format: zodResponseFormat(structuredResponse, 'structuredResponse')
        });

        // Parse and validate the response
        const content = JSON.parse(completion.choices[0].message.content);
        const response = structuredResponse.parse(content);
        console.log(response);
        // Return the response
        return {
            statusCode: 200,
            body: JSON.stringify({
                gptHints: response
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
