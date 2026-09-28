const DISCORD_API = "https://discord.com/api/v10";

/** Edits the original response to a deferred interaction. No bot token needed — the interaction token itself authorizes this. */
export async function editOriginalInteractionResponse(
  applicationId: string,
  interactionToken: string,
  content: string,
): Promise<void> {
  const res = await fetch(
    `${DISCORD_API}/webhooks/${applicationId}/${interactionToken}/messages/@original`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    },
  );

  if (!res.ok) {
    console.error("discord editOriginalInteractionResponse failed", res.status, await res.text());
  }
}
