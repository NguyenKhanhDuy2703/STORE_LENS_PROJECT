import axiosInstance from './axios';

export const uploadPosExcel = async ({ file, locationId }) => {
    const formData = new FormData();
    formData.append('file', file);
    if (locationId) {
        formData.append('location_id', locationId);
    }
    const response = await axiosInstance.post('/business-event/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
