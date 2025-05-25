import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/admin';

// Add token in Authorization header
export const getDoctorUpdateRequests = (token) => {
  return axios.get(`${BASE_URL}/pending-updates`, {
    headers: {
      Authorization: `Bearer ${token}`, // ✅ use Bearer format
    },
  });
};

export const approveUpdateRequest = (data, token) => {
  return axios.post(`${BASE_URL}/approve-update`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const rejectUpdateRequest = (data, token) => {
  return axios.post(`${BASE_URL}/reject-update`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
