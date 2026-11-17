import api from "./api";
import {
  Form,
  SubmissionAnswer,
  SubmissionListResponse,
  SubmissionResponse,
  SubmissionUploadUrlResponse,
} from "../types/forms";

export const createDraftSubmission = async (id: string): Promise<SubmissionResponse> => {
  const response = await api.post(`/forms/${id}/submissions`);
  return response.data;
}

export const addAnswersToSubmission = async (
  submissionId: string,
  body: { answers: SubmissionAnswer[] }
): Promise<SubmissionResponse> => {
  const response = await api.patch(`/forms/submissions/${submissionId}`, body);

  return response.data;
}

export const submitFormSubmission = async (submissionId: string): Promise<SubmissionResponse> => {
  const response = await api.post(`/forms/submissions/${submissionId}/submit`);
  return response.data;
} 

export const getAllSubmissions = async (): Promise<SubmissionListResponse> => {
  const response = await api.get(`/me/submissions`);
  return response.data;
}

export const getFormByFormId = async (formId: string): Promise<{ message: string; data: Form }> => {
  const response = await api.get(`/forms/${formId}`);
  return response.data;
}

export const deleteSubmission = async (submissionId: string): Promise<{ message: string }> => {
  const response = await api.delete(`/forms/submissions/${submissionId}`);
  return response.data;
}

export const getUploadUrl = async (
  submissionId: string,
  contentType: string
): Promise<SubmissionUploadUrlResponse> => {
  const response = await api.get(`/forms/submissions/${submissionId}/upload-url`, {
    params: { contentType },
  });
  return response.data;
};
