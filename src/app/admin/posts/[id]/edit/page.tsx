"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import SeoAnalyzer from "@/components/admin/SeoAnalyzer";

const TiptapEditor = dynamic(
  () => import("@/components/admin/TiptapEditor"),
  { ssr: false }
);

interface Category {
  id: string;
  nameEn: string;
}

interface Tag {
  id: string;
  nameEn: string;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [titleEn, setTitleEn] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("DRAFT");

  const [metaTitleEn, setMetaTitleEn] = useState("");
  const [metaDescEn, setMetaDescEn] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [seoOpen, setSeoOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/posts/${postId}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/tags").then((r) => r.json()),
    ]).then(([postData, catData, tagData]) => {
      const post = postData.post;
      if (post) {
        setTitleEn(post.titleEn || "");
        setContentEn(post.contentEn || "");
        setExcerptEn(post.excerptEn || "");
        setSlug(post.slug || "");
        setStatus(post.status || "DRAFT");
        setMetaTitleEn(post.metaTitleEn || "");
        setMetaDescEn(post.metaDescEn || "");
        setOgImage(post.ogImage || "");
        setFocusKeyword(post.focusKeyword || "");
        setSelectedCategories(
          (post.categories || []).map((c: { id: string }) => c.id)
        );
        setSelectedTags(
          (post.tags || []).map((t: { id: string }) => t.id)
        );
      }
      setCategories(catData.categories || []);
      setTags(tagData.tags || []);
      setLoading(false);
    });
  }, [postId]);

  async function handleSave(newStatus: "DRAFT" | "PUBLISHED") {
    if (!titleEn.trim()) {
      alert("Title is required.");
      return;
    }

    setSaving(true);

    const res = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        titleKa: titleEn,
        titleEn,
        contentKa: contentEn,
        contentEn,
        excerptKa: excerptEn,
        excerptEn,
        metaTitleKa: metaTitleEn || null,
        metaTitleEn: metaTitleEn || null,
        metaDescKa: metaDescEn || null,
        metaDescEn: metaDescEn || null,
        ogImage: ogImage || null,
        focusKeyword: focusKeyword || null,
        status: newStatus,
        categoryIds: selectedCategories,
        tagIds: selectedTags,
      }),
    });

    if (res.ok) {
      router.push("/admin/posts");
    } else {
      const err = await res.json();
      alert(err.error || "Failed to update post");
    }

    setSaving(false);
  }

  function toggleItem(arr: string[], id: string, setter: (v: string[]) => void) {
    setter(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Loading post...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleSave("DRAFT")}
            disabled={saving}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave("PUBLISHED")}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {status === "PUBLISHED" ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-2">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
            status === "PUBLISHED"
              ? "bg-green-50 text-green-700"
              : "bg-yellow-50 text-yellow-700"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Slug */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Content */}
      <div className="mt-6 rounded-xl bg-white shadow-sm">
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Excerpt
              </label>
              <textarea
                value={excerptEn}
                onChange={(e) => setExcerptEn(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Content
              </label>
              <TiptapEditor content={contentEn} onChange={setContentEn} />
            </div>
          </div>
        </div>
      </div>

      {/* SEO & Meta Tags */}
      <div className="mt-6 rounded-xl bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setSeoOpen(!seoOpen)}
          className="flex w-full items-center justify-between p-6 text-left"
        >
          <h3 className="text-sm font-semibold text-gray-700">
            SEO & Meta Tags
          </h3>
          <span className="text-xs text-gray-400">{seoOpen ? "▲" : "▼"}</span>
        </button>

        {seoOpen && (
          <div className="border-t border-gray-100 p-6 pt-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={metaTitleEn}
                  onChange={(e) => setMetaTitleEn(e.target.value)}
                  placeholder="SEO title for search engines (max 60 chars)"
                  maxLength={70}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  {metaTitleEn.length}/60 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta Description
                </label>
                <textarea
                  value={metaDescEn}
                  onChange={(e) => setMetaDescEn(e.target.value)}
                  rows={2}
                  placeholder="SEO description for search results (max 160 chars)"
                  maxLength={170}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  {metaDescEn.length}/160 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  OG Image URL
                </label>
                <input
                  type="url"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Image for social media sharing (1200x630 recommended)
                </p>
                {ogImage && (
                  <img
                    src={ogImage}
                    alt="OG Preview"
                    className="mt-2 h-32 w-auto rounded-lg border border-gray-200 object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEO Analyzer */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Focus Keyword
            </label>
            <input
              type="text"
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              placeholder="Enter focus keyword for SEO analysis"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <SeoAnalyzer
            title={titleEn}
            metaTitle={metaTitleEn}
            metaDesc={metaDescEn}
            content={contentEn}
            focusKeyword={focusKeyword}
            slug={slug}
            isEnglish={true}
          />
        </div>
      </div>

      {/* Categories & Tags */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700">Categories</h3>
          {categories.length === 0 ? (
            <p className="mt-2 text-xs text-gray-400">No categories yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() =>
                      toggleItem(selectedCategories, cat.id, setSelectedCategories)
                    }
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{cat.nameEn}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700">Tags</h3>
          {tags.length === 0 ? (
            <p className="mt-2 text-xs text-gray-400">No tags yet.</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() =>
                    toggleItem(selectedTags, tag.id, setSelectedTags)
                  }
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedTags.includes(tag.id)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tag.nameEn}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
