import { OpenAI } from "openai"

export async function handler(event) {
     const openai = new OpenAI(process.env.OPENAI_API_KEY);

    // Parse input data from the event object
    const { hints, questionText, correctAnswer } = JSON.parse(event.body);
    // prompt for open ai
    // first specify the format returned via the role
    const formattedHints = hints?.map((hint) => `Team ${hint.teamName}: "${hint.rawHint}"`).join("\n");
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
        Categorize these responses into distinct themes or patterns you identify. Include the number of responses that fall into each category as well as the associated team names.
        
        Example Input:
        Question: What is the sum of the interior angles of a stop sign?
        Answer: 1080 degrees
        Team 1 hint: You need to add up all the angles
        Team 2 hint: It's like a circle so its the same degrees as that
        Team 3 hint: Add up the angles
        Team 4 hint: I don't know

        Example Output:
        [
          {
            themeText: "Add up the angles",
            teams: ["Team 1", "Team 3"],
            teamCount: 2
          },
          {
            themeText: "Incorrectly compares to a circle",
            teams: ["Team2 "],
            teamCount: 1
          },
          {
            themeText: "Student is uncertain",
            teams: ["Team 4"],
            teamCount: 1
          }
        ]
      
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
                gptHints: completion.choices[0].message.content
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


    
 
