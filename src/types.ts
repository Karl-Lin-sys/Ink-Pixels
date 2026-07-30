export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

export interface StoryState {
  imageBase64: string | null;
  mimeType: string | null;
  openingParagraph: string | null;
}
