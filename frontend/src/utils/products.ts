const API_URL = "http://localhost:4000/api/products";

export const getProducts = async () => {
  const res = await fetch(`${API_URL}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

export const createProduct = async (data: any) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateProduct = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteProduct = async (id: string) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return res.json();
};

export const getCategories = async () => {
  const res = await fetch("http://localhost:4000/api/categories", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export const getSubCategories = async () => {
  const res = await fetch("http://localhost:4000/api/subcategories", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch subcategories");
  return res.json();
}