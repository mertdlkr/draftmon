import { ChatBedrockConverse } from "@langchain/aws";
import { PromptTemplate } from "@langchain/core/prompts";
import * as dotenv from "dotenv";

dotenv.config({ path: "../.env" });

// Boilerplate setup for a LangChain agent using AWS Bedrock
export async function runStrategyAgent(agentName: string, identity: any, teamAvg: any) {
    console.log(`[Agent: ${agentName}] Initialized autonomous thinking protocol...`);

    // Fallback if AWS credentials are not set
    if (!process.env.AWS_ACCESS_KEY_ID) {
        console.log(`[Agent: ${agentName}] Warning: No AWS credentials found. Running in mock mode.`);
        return { strategyId: 1, reasoning: "Boilerplate fallback reasoning." };
    }

    const llm = new ChatBedrockConverse({
        model: "anthropic.claude-3-haiku-20240307-v1:0",
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        }
    });

    const prompt = PromptTemplate.fromTemplate(`
        You are {agentName}, an AI Football Manager in Monad League.
        Identity: {identity}
        Team Stats: {teamAvg}
        
        Based on your stats, choose a strategy (1-6) and provide a reasoning.
        Return ONLY valid JSON format: {{"strategyId": number, "reasoning": "string max 256 chars"}}
    `);

    const chain = prompt.pipe(llm);

    try {
        /* Example invocation (Uncomment to test live)
        const response = await chain.invoke({
            agentName,
            identity: JSON.stringify(identity),
            teamAvg: JSON.stringify(teamAvg)
        });
        
        const aiText = response.content.toString().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(aiText);
        */

        return { strategyId: 1, reasoning: "LangChain boilerplate ready for action." };
    } catch (error) {
        console.error(`[Agent: ${agentName}] Encountered an error during reasoning:`, error);
        return { strategyId: 3, reasoning: "Error fallback strategy." };
    }
}
