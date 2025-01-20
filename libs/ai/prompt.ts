import { TodoItem } from "@/types/TodoItem";

export const buildPrompt = (items: TodoItem[], language = "fr-FR") => {
  const prompt = [
    `I want you to suggest 2 or 3 recipes using the ingredients I'm going to provide: `,
    items.map((item) => `${item.summary} (${item.due})`).join(", "),
    "Favors ingredients with best-before dates.",
    "Assume I have basic ingredients (oil, condiments, starches, etc.).",
    `Also, even though I'm asking you in English, answer absolutely in the language: ${language}.`,
  ];

  return prompt.join("\n");
};
