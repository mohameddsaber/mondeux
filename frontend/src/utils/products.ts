import { apiFetch } from "../lib/api";

export const getProducts = async () => {
  const res = await apiFetch("/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

export const createProduct = async (data: any) => {
  const res = await apiFetch("/products", {
    method: "POST",
    json: data,
  });
  return res.json();
};

export const updateProduct = async (id: string, data: any) => {
  const res = await apiFetch(`/products/${id}`, {
    method: "PUT",
    json: data,
  });
  return res.json();
};

export const deleteProduct = async (id: string) => {
  const res = await apiFetch(`/products/${id}`, {
    method: "DELETE",
  });
  return res.json();
};

export const getCategories = async () => {
  const res = await apiFetch("/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export const getSubCategories = async () => {
  const res = await apiFetch("/subcategories");
  if (!res.ok) throw new Error("Failed to fetch subcategories");
  return res.json();
}
