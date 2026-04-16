import BloomChatbot from "@/components/chatbot/BloomChatbot";
import Card from "@/components/ui/Card";

export default function ChatPage() {
  return (
    <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
      <BloomChatbot />
      <Card title="Ask Bloom Guide">
        <p className="text-sm text-[#5a2d4b]/70">
          Ask about cycle predictions, symptom patterns, or gentle wellness tips. Bloom Guide is designed for
          friendly, supportive answers.
        </p>
      </Card>
    </div>
  );
}
