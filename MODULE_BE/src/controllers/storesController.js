const Store = require('../schemas/location.schema');

const getAllStores = async (req, res) => {
    try {
        const { role, location_id } = req.user; // Lấy thông tin từ middleware authenticationToken
        let query = {};

        // Nếu là MANAGER hoặc USER, chỉ cho phép lấy thông tin của chính cửa hàng họ
        if (role !== 'ADMIN_SUPER' && role !== 'ADMIN') {
            query = { location_code: location_id }; 
        }

        const stores = await Store.find(query, { _id: 1, location_code: 1, name: 1 });
        
        return res.status(200).json({
            status: "success",
            data: stores
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
const getStoreById = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID từ đường dẫn API (ví dụ: /api/v1/stores/65f...)

        // Tìm cửa hàng theo ID
        const store = await Store.findById(id);

        if (!store) {
            return res.status(404).json({ 
                status: "error", 
                message: "Không tìm thấy cửa hàng này" 
            });
        }

        return res.status(200).json({
            status: "success",
            data: store
        });
    } catch (error) {
        console.error('Error fetching store by ID:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
module.exports = { getAllStores  , getStoreById};