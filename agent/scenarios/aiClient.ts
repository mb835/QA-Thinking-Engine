export const openai = {
  chat: {
    completions: {
      create: async () => {
        return { choices: [{ message: { content: "stub" } }] };
      },
    },
  },
};