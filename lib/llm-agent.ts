import * as chrono from "chrono-node";
import { getEventsForDate } from "./google";

export async function agent(messages: any, user: any) {
  const lastMessage = messages[messages.length - 1];
  const msg = lastMessage?.content.toLowerCase();

  const parsedDate = chrono.parseDate(msg || "");

  if (parsedDate) {
    try {
      const events = await getEventsForDate(parsedDate, user.accessToken);

      if (events.length === 0) {
        const formatted = parsedDate.toDateString();
        return {
          role: "assistant",
          content: `You have no events scheduled on ${formatted}.`,
        };
      }

      const eventList = events
        .map((event: any) => {
          const start = event.start.dateTime || event.start.date;
          const dateStr = new Date(start).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          return `- ${dateStr}: ${event.summary || "(No Title)"}`;
        })
        .join("\n");

      return {
        role: "assistant",
        content: `Here are your events for ${parsedDate.toDateString()}:\n${eventList}`,
      };
    } catch (error: any) {
      return {
        role: "assistant",
        content: `Sorry, I couldn't fetch your calendar events due to an error: ${error.message}`,
      };
    }
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      messages,
    }),
  });

  const data = await response.json();
  return {
    role: "assistant",
    content: data.choices[0].message.content,
  };
}
