import { http, unwrap } from "../api/http";

export async function getCommunications() {
  const response = await http.get("/communications");
  return unwrap(response);
}

export async function sendEmail(data) {
  const response = await http.post("/communications/send-email", data);

  return unwrap(response);
}

export async function getLeadHistory(id) {
  const response = await http.get(`/communications/lead/${id}/history`);

  return unwrap(response);
}

export async function getCustomerHistory(id) {
  const response = await http.get(`/communications/customer/${id}/history`);

  return unwrap(response);
}

export async function addInternalNote(data) {
  const response = await http.post("/communications/internal-note", data);

  return unwrap(response);
}
