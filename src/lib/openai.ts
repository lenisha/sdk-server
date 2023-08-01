import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
  HumanMessagePromptTemplate,
} from "langchain/prompts";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationChain } from "langchain/chains";
import { ConversationSummaryMemory } from "langchain/memory";
import { Prompts, SystemPromptParams } from "../constants/prompts";

const chat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo-16k",
  maxTokens: 200,
  temperature: 0.2,
});

/**
 *
 * @returns A new langchain conversational chain with history
 */
export const initializeOpenAi = (
  params: SystemPromptParams
): ConversationChain => {
  // Conversational chain allows us to start a conversation with history
  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(Prompts.SYSTEM(params)),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);

  return new ConversationChain({
    memory: new ConversationSummaryMemory({
      llm: chat,
      returnMessages: true,
      memoryKey: "history",
    }),
    prompt: chatPrompt,
    llm: chat,
  });
};

/**
 *
 * @param chain Conversational chain to send the prompt to
 * @param input Prompt to send to the conversational chain provided
 * @returns Response from the LLM
 */
export const callOpenAi = async (
  chain: ConversationChain,
  input: string
): Promise<string> => {
  const completion = await chain.call({
    input,
  });

  return completion.response.replace('"', "") as string;
};
