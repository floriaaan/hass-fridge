export const getCompletion = async (openAIKey: string, prompt: string): Promise<string | undefined> => {
  const url = "https://api.openai.com/v1/chat/completions";
  const params = {
    model: "gpt-4o-mini",
    messages: [{ role: "developer", content: prompt }],
  };
  const headers = {
    Authorization: `Bearer ${openAIKey}`,
    "Content-Type": "application/json",
  };
  try {
    console.log("fetching completion");
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(params),
    });
    const body = await res.json();
    console.log(body);
    const answers: string[] = [body.choices[0].message.content];
    // handle choices[0].finish_reason === "length"
    if (body.choices[0].finish_reason !== "length") {
      return answers.join("");
    } else {
      const next = await getCompletion(openAIKey, answers[0]);
      if (next) answers.push(next);
      return answers.join("");
    }
  } catch (err) {
    console.error(err);
  }
};
