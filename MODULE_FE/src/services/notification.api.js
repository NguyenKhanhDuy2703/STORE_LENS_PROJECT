import axiosInstance from "./axios";

const BASE_URL = "/notification";

// locationId bắt buộc để đồng bộ với global filter
export const getNotifications = async (locationId) => {
    const res = await axiosInstance.get(`${BASE_URL}/list`, {
        params: { locationId },
    });
    return res.data.data;
};

export const markReadNotification = async (id) => {
    const res = await axiosInstance.patch(`${BASE_URL}/read/${id}`);
    return res.data.data;
};
