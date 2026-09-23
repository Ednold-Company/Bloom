import { createChatBotMessage } from "react-chatbot-kit";

export const createConfig = (token: string | null) => ({
  botName: "Bloom AI Guide",
  initialMessages: [
    (createChatBotMessage as any)(
      "Hi lovely! 🌸 I am Bloom AI Guide. Ask me anything about safe sex days, your next period, cramp relief, or nutrition for your cycle phase!",
      {}
    ),
  ],
  customStyles: {
    botMessageBox: { backgroundColor: "#ff5277" },
    chatButton: { backgroundColor: "#ff5277" },
  },
  state: { token },
});
