export type ContentKey = string;

export type ContentType = "text" | "cta" | "insight" | "checkpoint";

export type ContentEntry = {
  key: ContentKey;
  type: ContentType;
  value: string;
  locale?: string;
  context?: Record<string, string>;
  active?: boolean;
  priority?: number;
};

