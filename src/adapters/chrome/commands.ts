export const COMMAND_COPY_PLAIN = "copy-plain";
export const COMMAND_COPY_MARKDOWN = "copy-markdown";

export type CopyCommand = typeof COMMAND_COPY_PLAIN | typeof COMMAND_COPY_MARKDOWN;

export type CopyFormat = "plain" | "markdown";

export function commandToFormat(command: string): CopyFormat | null {
  if (command === COMMAND_COPY_PLAIN) {
    return "plain";
  }
  if (command === COMMAND_COPY_MARKDOWN) {
    return "markdown";
  }
  return null;
}
