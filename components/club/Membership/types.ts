export type QuestionOption = {
  id: string;
  label: string;
};

export type QuestionType = string;

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
  status: string;
  createdAt: string;
  information: string;
  questions: Question[];
};