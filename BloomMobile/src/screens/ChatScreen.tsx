import React, { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useThemeMode } from "../context/ThemeContext";

export default function ChatScreen() {
  const { token } = useAuth();
  const { colors } = useThemeMode();
  const [messages, setMessages] = useState<IMessage[]>([
    {
      _id: 1,
      text: "Hi! I'm Bloom Guide. Ask me about your cycle or symptoms.",
      createdAt: new Date(),
      user: { _id: 2, name: "Bloom Guide" },
    },
  ]);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    setMessages((previous) => GiftedChat.append(previous, newMessages));

    const userMessage = newMessages[0]?.text;
    if (!userMessage) return;

    const response = await api.post(
      "/chat",
      { message: userMessage },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const reply: IMessage = {
      _id: Math.random().toString(),
      text: response.data.reply,
      createdAt: new Date(),
      user: { _id: 2, name: "Bloom Guide" },
    };

    setMessages((previous) => GiftedChat.append(previous, [reply]));
  }, [token]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <Card.Title title="Ask Bloom Guide" />
        <Card.Content>
          <Text style={{ color: colors.muted }}>
            Ask about cycle predictions, symptom patterns, or gentle wellness tips. Bloom Guide is designed for
            friendly, supportive answers.
          </Text>
        </Card.Content>
      </Card>
      <View style={styles.chatWrapper}>
        <GiftedChat
          messages={messages}
          onSend={(newMessages) => onSend(newMessages)}
          user={{ _id: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoCard: {
    margin: 16,
  },
  chatWrapper: {
    flex: 1,
  },
});
