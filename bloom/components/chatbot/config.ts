import { createChatBotMessage } from "react-chatbot-kit";

export const createConfig = (token: string | null) => ({
  botName: "Bloom Guide",
  initialMessages: [
    createChatBotMessage("Hi! I'm Bloom Guide. Ask me about your cycle, symptoms, or wellness tips."),
  ],
  customStyles: {
    botMessageBox: { backgroundColor: "#ef7a9a" },
    chatButton: { backgroundColor: "#ef7a9a" },
  },
  state: { token },
});
