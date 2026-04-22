import axiosInstance from "./axios";

const BASE_URL = "/notification";


export const getNotifications = async () => {
    const res = await axiosInstance.get(`${BASE_URL}/list`);
    return res.data.data;
};

export const markReadNotification = async (id) => {
    const res = await axiosInstance.patch(`${BASE_URL}/read/${id}`);
    return res.data.data;
};