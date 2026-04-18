import axiosInstance from "./axios";

const API_URL = "/asset";
const getAssets = async (params) => {
  const {
    locationId,
    categoryName,
    productId,
    zoneId,
    zoneName,
    page = 1,
    limit = 10,
  } = params;
  const queryParams = {
    page,
    limit,
  };

  if (locationId && locationId !== "all") {
    queryParams.locationId = locationId;
  }
  if (categoryName && categoryName !== "all") {
    queryParams.categoryName = categoryName;
  }
  if (productId && productId !== "all") {
    queryParams.productId = productId;
  }
  if (zoneId && zoneId !== "all") {
    queryParams.zoneId = zoneId;
  }
  if (zoneName && zoneName !== "all") {
    queryParams.zoneName = zoneName;
  }

  const response = await axiosInstance.get(API_URL, { params: queryParams });
  return response.data.data || response.data;
};

const addOrUpdateAsset = async (productData) => {
  const {
    locationId,
    categoryName,
    name_product,
    product_id,
    zone_name,
    brand,
    price,
    unit,
    stock_quantity,
    status,
    asset_attributes,
  } = productData;
  const response = await axiosInstance.post(`${API_URL}`, {
    locationId,
    categoryName,
    productId: product_id,
    nameProduct: name_product,
    zoneName: zone_name,
    brand,
    price,
    unit,
    stockQuantity: stock_quantity,
    status,
    assetAttributes: asset_attributes,
  });
  return response.data.data || response.data;
};

const deleteAsset = async ({ locationId, categoryName, productId }) => {
  const response = await axiosInstance.delete(`${API_URL}`, {
    params: {
      locationId,
      productId,
    },
  });
  return response.data.data || response.data;
};
const getMestricAssetByLocationID = async (locationId) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/metric`, {
      params: {
        locationId,
      },
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching asset metrics:", error);
    throw error;
  }
};
export { getAssets, addOrUpdateAsset, deleteAsset, getMestricAssetByLocationID };
