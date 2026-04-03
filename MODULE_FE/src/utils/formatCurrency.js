export const formatCurrency = (value) => {
  const numeric = Number(value ?? 0);

  if (!Number.isFinite(numeric)) {
    return "0 VND";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numeric);
};
