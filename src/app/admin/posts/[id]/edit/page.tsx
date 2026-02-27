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
  nameKa: string;
  nameEn: string;
}

interface Tag {
  id: string;
  nameKa: string;
  nameEn: string;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [tab, setTab] = useState<"ka" | "en">("en");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [titleKa, setTitleKa] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [contentKa, setContentKa] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [excerptKa, setExcerptKa] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("DRAFT");

  const [metaTitleKa, setMetaTitleKa] = useState("");
  const [metaTitleEn, setMetaTitleEn] = useState("");
  const [metaDescKa, setMetaDescKa] = useState("");
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
        setTitleKa(post.titleKa || "");
        setTitleEn(post.titleEn || "");
        setContentKa(post.contentKa || "");
        setContentEn(post.contentEn || "");
        setExcerptKa(post.excerptKa || "");
        setExcerptEn(post.excerptEn || "");
        setSlug(post.slug || "");
        setStatus(post.status || "DRAFT");
        setMetaTitleKa(post.metaTitleKa || "");
        setMetaTitleEn(post.metaTitleEn || "");
        setMetaDescKa(post.metaDescKa || "");
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
    if (!titleEn.trim() || !titleKa.trim()) {
      alert("Both titles (KA and EN) are required.");
      return;
    }

    setSaving(true);

    const res = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        titleKa,
        titleEn,
        contentKa,
        contentEn,
        excerptKa,
        excerptEn,
        metaTitleKa: metaTitleKa || null,
        metaTitleEn: metaTitleEn || null,
        metaDescKa: metaDescKa || null,
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

      {/* Language Tabs */}
      <div className="mt-6 rounded-xl bg-white shadow-sm">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab("en")}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              tab === "en"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setTab("ka")}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              tab === "ka"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ქართული
          </button>
        </div>

        <div className="p-6">
          {tab === "en" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title (EN)
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
                  Excerpt (EN)
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
                  Content (EN)
                </label>
                <TiptapEditor content={contentEn} onChange={setContentEn} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  სათაური (KA)
                </label>
                <input
                  type="text"
                  value={titleKa}
                  onChange={(e) => setTitleKa(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  აღწერა (KA)
                </label>
                <textarea
                  value={excerptKa}
                  onChange={(e) => setExcerptKa(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  კონტენტი (KA)
                </label>
                <TiptapEditor content={contentKa} onChange={setContentKa} />
              </div>
            </div>
          )}
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
              {tab === "en" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Meta Title (EN)
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
                      Meta Description (EN)
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
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      მეტა სათაური (KA)
                    </label>
                    <input
                      type="text"
                      value={metaTitleKa}
                      onChange={(e) => setMetaTitleKa(e.target.value)}
                      placeholder="SEO სათაური საძიებო სისტემებისთვის (მაქს 60 სიმბოლო)"
                      maxLength={70}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      {metaTitleKa.length}/60 სიმბოლო
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      მეტა აღწერა (KA)
                    </label>
                    <textarea
                      value={metaDescKa}
                      onChange={(e) => setMetaDescKa(e.target.value)}
                      rows={2}
                      placeholder="SEO აღწერა საძიებო შედეგებისთვის (მაქს 160 სიმბოლო)"
                      maxLength={170}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      {metaDescKa.length}/160 სიმბოლო
                    </p>
                  </div>
                </>
              )}

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
            title={tab === "en" ? titleEn : titleKa}
            metaTitle={tab === "en" ? metaTitleEn : metaTitleKa}
            metaDesc={tab === "en" ? metaDescEn : metaDescKa}
            content={tab === "en" ? contentEn : contentKa}
            focusKeyword={focusKeyword}
            slug={slug}
            isEnglish={tab === "en"}
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
                  <span className="text-xs text-gray-400">({cat.nameKa})</span>
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
