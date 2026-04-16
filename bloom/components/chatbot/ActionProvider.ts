import api from "@/lib/api";

class ActionProvider {
  createChatBotMessage: any;
  setState: any;
  token: string | null;
  stateRef: any;

  constructor(createChatBotMessage: any, setStateFunc: any, _createClientMessage: any, stateRef: any) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.stateRef = stateRef;
    this.token = stateRef?.current?.token || null;
  }

  async handleUserMessage(message: string) {
    try {
      let latestToken =
        this.stateRef?.current?.token ||
        (typeof window !== "undefined" ? localStorage.getItem("bloom_anon_token") : null);

      if (!latestToken && typeof window !== "undefined") {
        const sessionResponse = await fetch("/api/auth/session");
        if (sessionResponse.ok) {
          const session = await sessionResponse.json();
          latestToken = session?.accessToken || null;
        }
      }

      this.token = latestToken;
      if (!this.token) {
        const botMessage = this.createChatBotMessage(
          "Please sign in to ask Bloom Guide questions."
        );
        this.setState((prev: any) => ({
          ...prev,
          messages: [...prev.messages, botMessage],
        }));
        return;
      }
      const response = await api.post(
        "/chat",
        { message },
        { headers: { Authorization: `Bearer ${this.token}` } }
      );
      const botMessage = this.createChatBotMessage(response.data.reply);
      this.setState((prev: any) => ({
        ...prev,
        messages: [...prev.messages, botMessage],
      }));
    } catch (error: any) {
      const status = error?.response?.status;
      const botMessage = this.createChatBotMessage(
        status === 401
          ? "Please sign in to ask Bloom Guide questions."
          : "I'm having trouble connecting right now. Please try again shortly."
      );
      this.setState((prev: any) => ({
        ...prev,
        messages: [...prev.messages, botMessage],
      }));
    }
  }
}

export default ActionProvider;
