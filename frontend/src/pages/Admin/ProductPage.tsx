import { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getSubCategories,
} from "@/utils/products";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type SizeVariant = {
  _id?: string;
  label: string;
  sku: string;
  stock: number;
  price?: number | null;
  isAvailable?: boolean;
};

type MaterialVariant = {
  _id?: string;
  material: "gold" | "silver" | "stainless steel" | string;
  metalPurity?: string;
  weight?: number | null;
  price?: number | null;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  stock?: number;
  sizeVariants: SizeVariant[];
};

type ImageItem = { url: string; alt?: string; isPrimary?: boolean };

type Product = {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  category?: string;
  subCategory?: string;
  materialVariants?: MaterialVariant[];
  tags?: string[];
  images?: ImageItem[];
  isActive?: boolean;
  isFeatured?: boolean;
  lowStockThreshold?: number;
  metaTitle?: string;
  metaDescription?: string;
  rating?: number;
  numReviews?: number;
};

type Category = { _id: string; name: string };
type SubCategory = { _id: string; name: string; category: string };

export default function ProductsPage() {
  // data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const emptyProduct = (): Product => ({
    name: "",
    slug: "",
    description: "",
    category: "",
    subCategory: "",
    materialVariants: [],
    tags: [],
    images: [],
    isActive: true,
    isFeatured: false,
    lowStockThreshold: 5,
    metaTitle: "",
    metaDescription: "",
    rating: 0,
    numReviews: 0,
  });

  const [form, setForm] = useState<Product>(emptyProduct());

  const unwrap = (res: any) => (res && (res.data ?? res)) || res || [];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);
        const prods = unwrap(prodRes);
        const cats = unwrap(catRes);
        setProducts(Array.isArray(prods) ? prods : prods.data ?? prods);
        setCategories(Array.isArray(cats) ? cats : cats.data ?? cats);
      } catch (err) {
        console.error("Failed to load products/categories", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // whenever category select changes, fetch subcategories dynamically
  useEffect(() => {
    const loadSub = async () => {
      if (!form.category) {
        setSubCategories([]);
        return;
      }
      try {
        const res = await getSubCategories(); // your util returns whole list
        const allSubs = unwrap(res) as SubCategory[];
        // filter client-side by category id (server-side filter endpoint optional)
        const filtered = allSubs.filter((s) => s.category === form.category);
        setSubCategories(filtered);
      } catch (err) {
        console.error("Failed to load subcategories", err);
        setSubCategories([]);
      }
    };
    loadSub();
  }, [form.category]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyProduct());
    setOpen(true);
  };

  // open edit modal (deep copy)
  const openEdit = (p: Product) => {
    const copy: Product = JSON.parse(JSON.stringify(p));
    copy.materialVariants = copy.materialVariants || [];
    copy.images = copy.images || [];
    copy.tags = copy.tags || [];
    setEditing(p);
    setForm(copy);
    setOpen(true);
  };

  // delete product
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((x) => x._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };
  const addMaterialVariant = () =>
    setForm((prev) => ({
      ...prev,
      materialVariants: [
        ...(prev.materialVariants || []),
        {
          material: "gold",
          metalPurity: "",
          weight: 0,
          price: 0,
          compareAtPrice: 0,
          costPrice: 0,
          stock: 0,
          sizeVariants: [],
        } as MaterialVariant,
      ],
    }));

  const removeMaterialVariant = (idx: number) =>
    setForm((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.materialVariants = copy.materialVariants || [];
      copy.materialVariants.splice(idx, 1);
      return copy;
    });

  const addSizeVariant = (mIdx: number) =>
    setForm((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.materialVariants = copy.materialVariants || [];
      copy.materialVariants[mIdx].sizeVariants =
        copy.materialVariants[mIdx].sizeVariants || [];
      copy.materialVariants[mIdx].sizeVariants.push({
        label: "S",
        sku: "",
        stock: 0,
        price: 0,
        isAvailable: true,
      });
      return copy;
    });

  const removeSizeVariant = (mIdx: number, sIdx: number) =>
    setForm((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.materialVariants[mIdx].sizeVariants.splice(sIdx, 1);
      return copy;
    });

  const updateMaterialField = (mIdx: number, field: string, value: any) =>
    setForm((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.materialVariants[mIdx][field] = value;
      return copy;
    });

  const updateSizeField = (mIdx: number, sIdx: number, field: string, value: any) =>
    setForm((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.materialVariants[mIdx].sizeVariants[sIdx][field] = value;
      return copy;
    });

  const addImage = () =>
    setForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), { url: "", alt: "", isPrimary: false }],
    }));

  const removeImage = (idx: number) =>
    setForm((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.images.splice(idx, 1);
      return copy;
    });

  const updateImage = (idx: number, key: keyof ImageItem, value: any) =>
    setForm((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.images[idx] = { ...copy.images[idx], [key]: value };
      if (key === "isPrimary" && value) {
        copy.images = copy.images.map((im, i) => ({ ...im, isPrimary: i === idx }));
      }
      return copy;
    });

  const setField = (field: keyof Product, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // save (create/update)
  const handleSave = async () => {
    try {
      // prepare payload (convert some fields)
      const payload = JSON.parse(JSON.stringify(form));

      payload.materialVariants = (payload.materialVariants || []).map((mv: any) => ({
        ...mv,
        weight: mv.weight !== undefined && mv.weight !== null ? Number(mv.weight) : undefined,
        price: mv.price !== undefined && mv.price !== null ? Number(mv.price) : undefined,
        compareAtPrice: mv.compareAtPrice ? Number(mv.compareAtPrice) : undefined,
        costPrice: mv.costPrice ? Number(mv.costPrice) : undefined,
        stock: mv.stock ? Number(mv.stock) : 0,
        sizeVariants: (mv.sizeVariants || []).map((sv: any) => ({
          ...sv,
          stock: sv.stock ? Number(sv.stock) : 0,
          price: sv.price !== undefined && sv.price !== null ? Number(sv.price) : undefined,
        })),
      }));

      payload.tags = Array.isArray(payload.tags)
        ? payload.tags
        : typeof payload.tags === "string"
        ? (payload.tags as string).split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      payload.lowStockThreshold = payload.lowStockThreshold ? Number(payload.lowStockThreshold) : 5;
      payload.rating = payload.rating ? Number(payload.rating) : 0;
      payload.numReviews = payload.numReviews ? Number(payload.numReviews) : 0;

      if (!editing) {
        const res = await createProduct(payload);
        const created = unwrap(res);
        setProducts((prev) => [created, ...prev]);
      } else {
        const res = await updateProduct(editing._id!, payload);
        const updated = unwrap(res);
        setProducts((prev) => prev.map((p) => (p._id === editing._id ? updated : p)));
      }

      setOpen(false);
      setEditing(null);
      setForm(emptyProduct());
    } catch (err) {
      console.error("Save product failed", err);
      alert("Save failed: " + String(err));
    }
  };

  if (loading) return <div className="p-6">Loading products...</div>;

  return (
    <div className="px-6 pb-6">
      <Card className="shadow-sm">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Products</CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={openCreate}>+ New Product</Button>
          </div>
        </CardHeader>

        <CardContent>
          {products.length === 0 ? (
            <p className="text-muted-foreground">No products yet.</p>
          ) : (
        <>
        <div className="w-full overflow-x-auto min-[460px]:block hidden ">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-sm font-medium">Name</th>
                <th className="p-2 text-sm font-medium">Category</th>
                <th className="p-2 text-sm font-medium">Price</th>
                <th className="p-2 text-sm font-medium">Active</th>
                <th className="p-2 text-sm font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="p-2 text-sm break-words max-w-[120px]">{p.name}</td>
                  <td className="p-2 text-sm break-words max-w-[100px]">
                    {typeof p.category === "object"
                      ? p.category?.name || p.category?.slug || "—"
                      : p.category || "—"}
                  </td>
                  <td className="p-2 text-sm">
                    {p.materialVariants?.length
                      ? `LE ${Number(p.materialVariants[0].price ?? 0).toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="p-2 text-sm">{p.isActive ? "Yes" : "No"}</td>
                  <td className="p-2 text-sm text-right space-x-2">
                    <Button variant="outline" size="sm" className="px-2 text-xs" onClick={() => openEdit(p)}>Edit</Button>
                    <Button variant="destructive" size="sm" className="px-2 text-xs" onClick={() => handleDelete(p._id)} >Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="min-[460px]:hidden space-y-2 ">
          {products.map((p) => (
            <div key={p._id} className="border p-3 rounded-lg text-sm bg-white">
              <p><strong>Name:</strong> {p.name}</p>
              <p><strong>Category:</strong> {p.category?.name || p.category || "—"}</p>
              <p><strong>Price:</strong> {p.materialVariants?.[0]?.price || "—"}</p>
              <p><strong>Active:</strong> {p.isActive ? "Yes" : "No"}</p>
              <div className="flex justify-end gap-2 mt-2">
                <Button size="sm" variant="outline" className="text-xs px-2">Edit</Button>
                <Button size="sm" variant="destructive" className="text-xs px-2">Del</Button>
              </div>
            </div>
          ))}
        </div>
        </>

          )}
        </CardContent>


      </Card>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Create Product"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Tabs defaultValue="general" className="w-full">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="variants">Variants</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>
              {/* General */}
              <TabsContent value="general" className="pt-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label>Name</Label>
                    <Input value={form.name || ""} onChange={(e) => setField("name", e.target.value)} />
                  </div>

                  <div>
                    <Label>Slug</Label>
                    <Input value={form.slug || ""} onChange={(e) => setField("slug", e.target.value)} />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Description</Label>
                    <textarea className="w-full border rounded-md p-2" value={form.description || ""} onChange={(e) => setField("description", e.target.value)} />
                  </div>

                  <div>
                    <Label>Category</Label>
                    <select className="w-full border rounded-md p-2" value={form.category || ""} onChange={(e) => setField("category", e.target.value)}>
                      <option value="">Select category</option>
                      {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <Label>Subcategory</Label>
                    <select className="w-full border rounded-md p-2" value={form.subCategory || ""} onChange={(e) => setField("subCategory", e.target.value)}>
                      <option value="">Select subcategory</option>
                      {subCategories.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <Label>Tags (comma separated)</Label>
                    <Input value={(form.tags || []).join(", ")} onChange={(e) => setField("tags", e.target.value)} />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={!!form.isActive} onChange={(e) => setField("isActive", e.target.checked)} />
                      <span>Active</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={!!form.isFeatured} onChange={(e) => setField("isFeatured", e.target.checked)} />
                      <span>Featured</span>
                    </label>
                  </div>
                </div>
              </TabsContent>

              {/* Variants */}
          <TabsContent value="variants" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Material Variants</h3>
              <Button onClick={addMaterialVariant}>+ Add Variant</Button>
            </div>

            {(form.materialVariants || []).map((mv, mIdx) => (
              <div key={mIdx} className="border rounded-lg p-4 bg-white space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Material</Label>
                    <select
                      value={mv.material}
                      onChange={(e) => updateMaterialField(mIdx, "material", e.target.value)}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="gold">Gold</option>
                      <option value="silver">Silver</option>
                      <option value="stainless steel">Stainless Steel</option>
                    </select>
                  </div>

                  <div>
                    <Label>Metal Purity</Label>
                    <Input
                      value={mv.metalPurity || ""}
                      onChange={(e) => updateMaterialField(mIdx, "metalPurity", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Weight (g)</Label>
                    <Input
                      type="number"
                      value={mv.weight ?? ""}
                      onChange={(e) => updateMaterialField(mIdx, "weight", Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label>Price (LE)</Label>
                    <Input
                      type="number"
                      value={mv.price ?? ""}
                      onChange={(e) => updateMaterialField(mIdx, "price", Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label>Compare At Price</Label>
                    <Input
                      type="number"
                      value={mv.compareAtPrice ?? ""}
                      onChange={(e) => updateMaterialField(mIdx, "compareAtPrice", Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label>Cost Price</Label>
                    <Input
                      type="number"
                      value={mv.costPrice ?? ""}
                      onChange={(e) => updateMaterialField(mIdx, "costPrice", Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={mv.stock ?? 0}
                      onChange={(e) => updateMaterialField(mIdx, "stock", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm">Size Variants</h4>
                  <Button variant="outline" size="sm" onClick={() => addSizeVariant(mIdx)}>
                    + Add Size
                  </Button>
                </div>

                <div className="space-y-2">
                  {(mv.sizeVariants || []).map((sv, sIdx) => (
                    <div key={sIdx} className="flex flex-wrap items-center gap-2">
                      <Input
                        className="w-36"
                        value={sv.label || ""}
                        onChange={(e) => updateSizeField(mIdx, sIdx, "label", e.target.value)}
                        placeholder="Label"
                      />
                      <Input
                        className="w-44"
                        value={sv.sku || ""}
                        onChange={(e) => updateSizeField(mIdx, sIdx, "sku", e.target.value)}
                        placeholder="SKU"
                      />
                      <Input
                        type="number"
                        className="w-28"
                        value={sv.stock ?? 0}
                        onChange={(e) => updateSizeField(mIdx, sIdx, "stock", Number(e.target.value))}
                        placeholder="Stock"
                      />
                      <Input
                        type="number"
                        className="w-28"
                        value={sv.price ?? ""}
                        onChange={(e) =>
                          updateSizeField(mIdx, sIdx, "price", Number(e.target.value))
                        }
                        placeholder="Price"
                      />
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!!sv.isAvailable}
                          onChange={(e) =>
                            updateSizeField(mIdx, sIdx, "isAvailable", e.target.checked)
                          }
                        />
                        Available
                      </label>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSizeVariant(mIdx, sIdx)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeMaterialVariant(mIdx)}
                >
                  Remove Material
                </Button>
              </div>
            ))}
          </TabsContent>



              {/* Images */}
              <TabsContent value="images" className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Images (use URLs)</div>
                    <Button onClick={addImage}>+ Add Image URL</Button>
                  </div>

                  {(form.images || []).map((im, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input value={im.url || ""} placeholder="Image URL" onChange={(e) => updateImage(idx, "url", e.target.value)} />
                      <Input value={im.alt || ""} placeholder="Alt text" onChange={(e) => updateImage(idx, "alt", e.target.value)} />
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={!!im.isPrimary} onChange={(e) => updateImage(idx, "isPrimary", e.target.checked)} />
                        Primary
                      </label>
                      <Button variant="destructive" onClick={() => removeImage(idx)}>Remove</Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* SEO */}
              <TabsContent value="seo" className="pt-4">
                <div className="grid gap-3">
                  <div>
                    <Label>Meta Title</Label>
                    <Input value={form.metaTitle || ""} onChange={(e) => setField("metaTitle", e.target.value)} />
                  </div>
                  <div>
                    <Label>Meta Description</Label>
                    <textarea className="w-full border rounded-md p-2" value={form.metaDescription || ""} onChange={(e) => setField("metaDescription", e.target.value)} />
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div>
                      <Label>Low Stock Threshold</Label>
                      <Input type="number" value={form.lowStockThreshold ?? 5} onChange={(e) => setField("lowStockThreshold", Number(e.target.value))} />
                    </div>
                    <div>
                      <Label>Rating</Label>
                      <Input type="number" value={form.rating ?? 0} onChange={(e) => setField("rating", Number(e.target.value))} />
                    </div>
                    <div>
                      <Label>Num Reviews</Label>
                      <Input type="number" value={form.numReviews ?? 0} onChange={(e) => setField("numReviews", Number(e.target.value))} />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
            </Tabs>
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button onClick={() => { setOpen(false); setEditing(null); setForm(emptyProduct()); }}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Update Product" : "Create Product"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
