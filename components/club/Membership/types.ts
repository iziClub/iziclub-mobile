export type QuestionOption = {
  id: string;
  label: string;
};

export type QuestionType =
  | "text"
  | "document"
  | "radio"
  | "checkbox";

export type Question = {
  id: string;
  type: QuestionType;
  name: string;
  description: string;
  required: boolean;
  options?: QuestionOption[];
};

export type DynamicForm = {
  id: string;
  name: string;
  status: "active" | "draft";
  createdAt: string;
  information: string;
  questions: Question[];
};