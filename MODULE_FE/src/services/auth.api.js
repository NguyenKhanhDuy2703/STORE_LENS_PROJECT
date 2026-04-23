import axiosInstance from "./axios";

const AUTH_BASE_URL = "/auth";
const SESSION_BASE_URL = "";

const unwrapData = (response) => response?.data?.data ?? response?.data ?? null;

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message || error?.message || fallbackMessage;

export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post(`${AUTH_BASE_URL}/login`, credentials);
    return unwrapData(response);
  } catch (error) {

    throw new Error(getErrorMessage(error, "Failed to login"));
  }
};

export const signup = async (payload) => {
  try {
    const response = await axiosInstance.post(`${AUTH_BASE_URL}/register`, payload);
    return unwrapData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to signup"));
  }
};

export const getProfile = async () => {
  try {
    const response = await axiosInstance.get(`${SESSION_BASE_URL}/gettoken`);
    return unwrapData(response);
  } catch (error) {
    console.error("Error fetching current session:", error);
    throw new Error(getErrorMessage(error, "Failed to get current session"));
  }
};

export const getToken = getProfile;

export const logout = async () => {
  try {
    const response = await axiosInstance.get(`${AUTH_BASE_URL}/logout`);
    return unwrapData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to logout"));
  }
};