export interface FormQuestionOption {
  id: string;
  label: string;
}

export interface FormQuestion {
  id: string;
  type: string;
  name: string;
  description: string;
  required: boolean;
  options: FormQuestionOption[];
}

export interface Form {
  id: string;
  clubId: string;
  name: string;
  status: string;
  createdAt: string;
  information: string;
  questions: FormQuestion[];
}

export interface SubmissionAnswer {
  questionId: string;
  value: string | string[];
  downloadUrl?: string;
  fileName?: string;
}

export interface Submission {
  id: string;
  formId: string;
  memberId: string | null;
  memberFirstName?: string;
  memberLastName?: string;
  memberCategories?: { id: string; name: string }[];
  answers: SubmissionAnswer[];
  submittedAt: string;
  status: string;
  requestedInfo: string | null;
  requestedAt: string | null;
  requestedBy: string | null;
  clubId?: string;
  clubName?: string;
  formName?: string;
}

export interface SubmissionResponse {
  message: string;
  data: Submission;
}

export interface SubmissionListResponse {
  message: string;
  data: {
    submissions: Submission[];
    total: number;
  };
}

export interface SubmissionUploadUrlResponse {
  message: string;
  data: {
    uploadUrl: string;
    filePath: string;
    expiresAt: string;
  };
}