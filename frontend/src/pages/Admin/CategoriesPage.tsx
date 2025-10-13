import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  category: Category | string;
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: "", description: "", image: "" });
  const [newSubCategory, setNewSubCategory] = useState({ name: "", category: "", description: "", image: "" });
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editSub, setEditSub] = useState<SubCategory | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/categories", { credentials: "include" });
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch {
      toast.error("Failed to fetch categories");
    }
  };

  const fetchSubCategories = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/subcategories", { credentials: "include" });
      const data = await res.json();
      if (data.success) setSubCategories(data.data);
    } catch {
      toast.error("Failed to fetch subcategories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return toast.error("Category name required");
    try {
      const res = await fetch("http://localhost:4000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...newCategory,
          slug: newCategory.name.toLowerCase().replace(/\s+/g, "-"),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Category added");
        setNewCategory({ name: "", description: "", image: "" });
        fetchCategories();
      }
    } catch {
      toast.error("Error adding category");
    }
  };

  const handleAddSub = async () => {
    if (!newSubCategory.name.trim() || !newSubCategory.category)
      return toast.error("Name and category required");

    try {
      const res = await fetch("http://localhost:4000/api/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...newSubCategory,
          slug: newSubCategory.name.toLowerCase().replace(/\s+/g, "-"),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Subcategory added");
        setNewSubCategory({ name: "", category: "", description: "", image: "" });
        fetchSubCategories();
      } else toast.error(data.message);
    } catch {
      toast.error("Error adding subcategory");
    }
  };

  const handleDeleteSub = async (id: string) => {
    if (!confirm("Delete this subcategory?")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/subcategories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Subcategory deleted");
        fetchSubCategories();
      } else toast.error(data.message);
    } catch {
      toast.error("Error deleting subcategory");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCategory) return;
    try {
      const res = await fetch(`http://localhost:4000/api/categories/${editCategory._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editCategory),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Category updated");
        setEditCategory(null);
        fetchCategories();
      } else toast.error(data.message);
    } catch {
      toast.error("Error updating category");
    }
  };

  const handleUpdateSub = async () => {
    if (!editSub) return;
    try {
      const res = await fetch(`http://localhost:4000/api/subcategories/${editSub._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editSub),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Subcategory updated");
        setEditSub(null);
        fetchSubCategories();
      } else toast.error(data.message);
    } catch {
      toast.error("Error updating subcategory");
    }
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Categories & Subcategories</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="categories">
          <TabsList className="mb-4">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory((p) => ({ ...p, name: e.target.value }))}
                className="max-w-xs"
              />
              <Button onClick={handleAddCategory}>Add</Button>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
              {/* Categories Table for larger screens */}
                <div className="hidden md:block">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((c) => (
                        <TableRow key={c._id}>
                          <TableCell>{c.name}</TableCell>
                          <TableCell>{c.slug}</TableCell>
                          <TableCell>{c.description || "—"}</TableCell>
                          <TableCell>
                            <Switch checked={c.isActive} />
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setEditCategory(c)}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" className="ml-2">
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile layout */}
                <div className="block md:hidden space-y-4">
                  {categories.map((c) => (
                    <div
                      key={c._id}
                      className="border rounded-lg p-4 shadow-sm bg-white flex flex-col gap-2"
                    >
                      <div>
                        <p className="font-semibold text-sm">Name:</p>
                        <p>{c.name}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Slug:</p>
                        <p>{c.slug}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Description:</p>
                        <p>{c.description || "—"}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">Active:</span>
                          <Switch checked={c.isActive} />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditCategory(c)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </>
            )}
          </TabsContent>

          {/* Subcategories Tab */}
          <TabsContent value="subcategories">
            <div className="flex flex-wrap gap-2 mb-6">
              <Input
                placeholder="Subcategory name"
                value={newSubCategory.name}
                onChange={(e) => setNewSubCategory((p) => ({ ...p, name: e.target.value }))}
                className="max-w-xs"
              />
              <select
                value={newSubCategory.category}
                onChange={(e) => setNewSubCategory((p) => ({ ...p, category: e.target.value }))}
                className="border rounded px-2 py-2 text-sm"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <Button onClick={handleAddSub}>Add Subcategory</Button>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                {/* Subcategories Table (larger screens) */}
                <div className="hidden md:block">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Parent Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subCategories.map((s) => (
                        <TableRow key={s._id}>
                          <TableCell>{s.name}</TableCell>
                          <TableCell>{s.slug}</TableCell>
                          <TableCell>
                            {typeof s.category === "object"
                              ? s.category?.name
                              : categories.find((c) => c._id === s.category)?.name || "—"}
                          </TableCell>
                          <TableCell>{s.description || "—"}</TableCell>
                          <TableCell>
                            <Switch checked={s.isActive} />
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setEditSub(s)}>
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSub(s._id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="block md:hidden space-y-4">
                  {subCategories.map((s) => (
                    <div
                      key={s._id}
                      className="border rounded-lg p-4 shadow-sm bg-white flex flex-col gap-2"
                    >
                      <div>
                        <p className="font-semibold text-sm">Name:</p>
                        <p>{s.name}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Slug:</p>
                        <p>{s.slug}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Parent:</p>
                        <p>
                          {typeof s.category === "object"
                            ? s.category?.name
                            : categories.find((c) => c._id === s.category)?.name || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Description:</p>
                        <p>{s.description || "—"}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">Active:</span>
                          <Switch checked={s.isActive} />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditSub(s)}>
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSub(s._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Edit Category Modal */}
      <Dialog open={!!editCategory} onOpenChange={() => setEditCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editCategory && (
            <>
              <label className="text-sm font-medium">Name</label>
              <Input
                className="mt-1 mb-2"
                value={editCategory.name}
                onChange={(e) =>
                  setEditCategory({
                    ...editCategory,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  })
                }
              />
              <label className="text-sm font-medium">Slug</label>
              <Input
                className="mt-1 mb-2"
                value={editCategory.slug}
                onChange={(e) => setEditCategory({ ...editCategory, slug: e.target.value })}
              />
              <label className="text-sm font-medium">Description</label>
              <Input
                className="mt-1 mb-2"
                value={editCategory.description || ""}
                onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
              />
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setEditCategory(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateCategory}>Save</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Modal */}
      <Dialog open={!!editSub} onOpenChange={() => setEditSub(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
          </DialogHeader>
          {editSub && (
            <>
              <label className="text-sm font-medium">Name</label>
              <Input
                className="mt-1 mb-2"
                value={editSub.name}
                onChange={(e) =>
                  setEditSub({
                    ...editSub,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  })
                }
              />
              <label className="text-sm font-medium">Slug</label>
              <Input
                className="mt-1 mb-2"
                value={editSub.slug}
                onChange={(e) => setEditSub({ ...editSub, slug: e.target.value })}
              />
              <label className="text-sm font-medium">Parent Category</label>
              <select
                className="mt-1 mb-2 border rounded px-2 py-2 w-full"
                value={typeof editSub.category === "string" ? editSub.category : editSub.category._id}
                onChange={(e) => setEditSub({ ...editSub, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <label className="text-sm font-medium">Description</label>
              <Input
                className="mt-1 mb-2"
                value={editSub.description || ""}
                onChange={(e) => setEditSub({ ...editSub, description: e.target.value })}
              />
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setEditSub(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateSub}>Save</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
