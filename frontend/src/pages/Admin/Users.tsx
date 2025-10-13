import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
}


export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:4000/api/users/admin/all`, {
        credentials: "include",
      });
      const data = await res.json();
      setUsers(data.data || []);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/users/admin/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("User deleted successfully");
        setUsers(users.filter((u) => u._id !== id));
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4  ">
      <Card>
        <CardHeader className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle>Users</CardTitle>
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : (
            <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phone || "—"}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(u._id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
              {filtered.map((u) => (
                <div
                  key={u._id}
                  className="border rounded-lg p-4 shadow-sm flex flex-col gap-2 bg-white"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-base">{u.name}</h3>
                    <span className="text-sm text-gray-500">{u.role}</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Email:</span> {u.email}
                  </p>
                  {u.phone && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Phone:</span> {u.phone}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(u._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-gray-500">No users found</p>
              )}
            </div>
            </>

          )}
        </CardContent>
      </Card>
    </div>
  );
}
