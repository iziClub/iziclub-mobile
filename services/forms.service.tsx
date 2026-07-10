import api from "./api";

export const createDraftSubmission = async (id: string) => {
  const response = await api.post(`/forms/${id}/submissions`);
  console.log("Response from createDraftSubmission:", response.data); // Log the response data
  return response.data;
}

export const addAnswersToSubmission = async (submissionId: string, answers: any) => {
    console.log("DATA from addAnswersToSubmission:", answers); // Log the data
  const response = await api.patch(`/forms/submissions/${submissionId}`,  answers );
  console.log("Response from addAnswersToSubmission:", response.data); // Log the response data

  return response.data;
}

export const submitFormSubmission = async (submissionId: string) => {
  const response = await api.post(`/forms/submissions/${submissionId}/submit`);
  return response.data;
} 

export const getAllSubmissions = async () => {
  const response = await api.get(`/me/submissions`);
  return response.data;
}

export const getFormByFormId = async (formId: string) => {
  const response = await api.get(`/forms/${formId}`);
  return response.data;
}

export const deleteSubmission = async (submissionId: string) => {
  const response = await api.delete(`/forms/submissions/${submissionId}`);
  return response.data;
}

export const getUploadUrl = async (submissionId: string, contentType: string) => {
  return api.get(`/forms/submissions/${submissionId}/upload-url`, {
    params: { contentType } // 💡 Transmis proprement sous la forme ?contentType=application/pdf
  });
};
