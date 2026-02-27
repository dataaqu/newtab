"use client";

import { useEffect, useState } from "react";

interface Category {
  id: string;
  nameKa: string;
  nameEn: string;
  slug: string;
  _count: { posts: number };
}

interface Tag {
  id: string;
  nameKa: string;
  nameEn: string;
  slug: string;
  _count: { posts: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tab, setTab] = useState<"categories" | "tags">("categories");
  const [loading, setLoading] = useState(true);

  // Form state
  const [nameKa, setNameKa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [catRes, tagRes] = await Promise.all([
      fetch("/api/categories"),
      fetch("/api/tags"),
    ]);
    const catData = await catRes.json();
    const tagData = await tagRes.json();
    setCategories(catData.categories || []);
    setTags(tagData.tags || []);
    setLoading(false);
  }

  function resetForm() {
    setNameKa("");
    setNameEn("");
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameKa.trim() || !nameEn.trim()) return;

    const endpoint = tab === "categories" ? "/api/categories" : "/api/tags";

    if (editingId) {
      await fetch(`${endpoint}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameKa, nameEn }),
      });
    } else {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameKa, nameEn }),
      });
    }

    resetForm();
    fetchData();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    const endpoint = tab === "categories" ? "/api/categories" : "/api/tags";
    await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    fetchData();
  }

  function startEdit(item: Category | Tag) {
    setNameKa(item.nameKa);
    setNameEn(item.nameEn);
    setEditingId(item.id);
  }

  const items = tab === "categories" ? categories : tags;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Categories & Tags</h1>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => {
            setTab("categories");
            resetForm();
          }}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "categories"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Categories ({categories.length})
        </button>
        <button
          onClick={() => {
            setTab("tags");
            resetForm();
          }}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "tags"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Tags ({tags.length})
        </button>
      </div>

      {/* Add / Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl bg-white p-6 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-gray-700">
          {editingId ? "Edit" : "Add"}{" "}
          {tab === "categories" ? "Category" : "Tag"}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Name (KA)
            </label>
            <input
              type="text"
              value={nameKa}
              onChange={(e) => setNameKa(e.target.value)}
              placeholder="ქართული სახელი"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Name (EN)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="English name"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500">Name (KA)</th>
              <th className="px-6 py-3 font-medium text-gray-500">Name (EN)</th>
              <th className="px-6 py-3 font-medium text-gray-500">Slug</th>
              <th className="px-6 py-3 font-medium text-gray-500">Posts</th>
              <th className="px-6 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  No {tab} found. Add one above.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {item.nameKa}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{item.nameEn}</td>
                  <td className="px-6 py-4 text-gray-400">{item.slug}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {item._count.posts}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.nameEn)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
