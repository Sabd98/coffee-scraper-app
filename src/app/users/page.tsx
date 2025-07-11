"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash } from "lucide-react";
import Link from "next/link";
import { useUsers } from "@/context/UsersContext";
import { useState, useCallback } from "react";
import Loader from "@/components/ui/loader";

export default function UsersPage() {
  const { users, status, error, deleteUser, setError } = useUsers();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleDeleteClick = useCallback(
    (id: number) => {
      setSelectedUserId(id);
      setConfirmOpen(true);
      setError(null); // Reset error saat dialog dibuka
    },
    [setError]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedUserId) return;

    try {
      setDeletingId(selectedUserId);
      await deleteUser(selectedUserId);
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setDeletingId(null);
      setConfirmOpen(false);
      setSelectedUserId(null);
    }
  }, [selectedUserId, deleteUser]);

  const handleCancelDelete = useCallback(() => {
    setConfirmOpen(false);
    setSelectedUserId(null);
    setError(null); // Pastikan error direset saat cancel
  }, [setError]);

  if (status === "failed") {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Link href="/users/create">
            <Button>
              <Plus className="mr-2" /> Add User
            </Button>
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500">Error: {error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="container mx-auto p-4">
      <nav className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Link href="/users/create">
          <Button
            asChild
            className="hover:shadow-md border border-amber-950 "
            variant="outline"
          >
            <Plus className="mr-2" /> Add User
          </Button>
        </Link>
      </nav>

      {/* Dialog Konfirmasi */}
      {confirmOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
        >
          <div className="rounded-lg shadow-md  w-full max-w-md bg-orange-300">
            <h2
              id="dialog-title"
              className="text-xl p-4 font-bold mb-4 border-b-2 border-amber-950"
            >
              Confirm Delete
            </h2>
            <p className="mb-6 px-4">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 p-2">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                disabled={deletingId !== null}
                className="  hover:bg-orange-400"
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                variant="outline"
                onClick={handleConfirmDelete}
                disabled={deletingId !== null}
              >
                {deletingId ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Table className="border border-amber-950 shadow-md ">
        <TableHeader>
          <TableRow className=" border border-amber-950">
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {status === "loading" && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <Loader />
              </TableCell>
            </TableRow>
          )}
          {status === "succeeded" && users.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                No users found. Create your first user!
              </TableCell>
            </TableRow>
          )}
          {users.map((user) => (
            <TableRow key={user.id} className=" border border-amber-950">
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link href={`/users/${user.id}/edit`}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border border-amber-950 hover:shadow-md"
                    >
                      <Edit className="h-4 w-4 hover:text-amber-600" />
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="icon"
                    disabled={deletingId === user.id}
                    className="border border-amber-950 hover:shadow-md"
                    onClick={() => handleDeleteClick(user.id)}
                  >
                    <Trash className="h-4 w-4 text-red-400 hover:text-red-700" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
