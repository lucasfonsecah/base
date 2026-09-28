import { ChatPanel } from "./ChatPanel";

export default function ChatPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Chat</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Converse com o assistente sobre suas finanças.
        </p>
      </div>
      <ChatPanel />
    </div>
  );
}
