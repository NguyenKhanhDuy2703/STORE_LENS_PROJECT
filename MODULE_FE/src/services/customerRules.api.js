import axiosInstance from "./axios"
const BASE_URL = "/customer-config-rule";
export const getCustomerRules = async ({locationId }) => {
    try {
        const response = await axiosInstance.get(
            `${BASE_URL}`,
            {
                params: { locationId },
            }
        );
        if (response.status !== 200) {
            throw new Error(`Failed to fetch customer rules: ${response.statusText}`);
        }
        return response.data.data;
    } catch (error) {
            console.error("Error fetching customer rules:", error);
            throw error;
    }
}
export const createCustomerRule = async ({ruleData}) => {
    try {
        const response = await axiosInstance.post(`${BASE_URL}`, {
            listRules: ruleData,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating customer rule:", error);
        throw error;
    }
}
export const deleteCustomerRule = async ({locationId , ruleId}) => {
    try {
        const response = await axiosInstance.delete(`${BASE_URL}` , {
            params: { locationId, ruleId },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting customer rule:", error);
        throw error;
    }   

}
