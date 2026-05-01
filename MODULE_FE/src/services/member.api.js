import axiosInstance from "./axios";

const BASE_URL = "/member";

export const getMemberSummary = async ({ locationId, search, status }) => {
    const params = { locationId };
    if (search) params.search = search;
    if (status) params.status = status;
    const response = await axiosInstance.get(`${BASE_URL}/summary`, { params });
    return response.data.data;
};

export const getMemberDetail = async ({ locationId, memberCode }) => {
    const response = await axiosInstance.get(`${BASE_URL}/${memberCode}`, {
        params: { locationId }
    });
    return response.data.data;
};

export const saveMember = async ({ locationId, memberData }) => {
    const response = await axiosInstance.post(`${BASE_URL}`, memberData, {
        params: { locationId }
    });
    return response.data.data;
};

export const deleteMember = async ({ locationId, memberCode }) => {
    const response = await axiosInstance.delete(`${BASE_URL}/${memberCode}`, {
        params: { locationId }
    });
    return response.data.data;
};
