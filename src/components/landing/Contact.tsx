"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";

export default function Contact() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
      });

      if (res.ok) {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-xl px-4 sm:max-w-2xl sm:px-6 lg:max-w-3xl lg:px-8">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
          {t("title")}
        </h2>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 sm:mt-10 sm:space-y-6 lg:mt-12">
          <div>
            <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700">
              {t("name")}
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:px-4 sm:py-3 sm:text-base"
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700">
              {t("email")}
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:px-4 sm:py-3 sm:text-base"
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700">
              {t("message")}
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={4}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:rows-5 sm:px-4 sm:py-3 sm:text-base"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 sm:py-3 sm:text-base"
          >
            {status === "loading" ? "..." : t("send")}
          </button>

          {status === "success" && (
            <p className="rounded-lg bg-green-50 p-3 text-center text-sm text-green-600">
              {t("success")}
            </p>
          )}
          {status === "error" && (
            <p className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
              {t("error")}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
