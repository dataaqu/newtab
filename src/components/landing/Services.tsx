"use client";

import { useTranslations } from "next-intl";

const icons = [
  <svg key="code" className="h-7 w-7 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>,
  <svg key="design" className="h-7 w-7 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>,
  <svg key="rocket" className="h-7 w-7 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>,
];

export default function Services() {
  const t = useTranslations("services");

  const items = t.raw("items") as Array<{ title: string; description: string }> | undefined;

  return (
    <section id="services" className="bg-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-gray-600 sm:mt-4 sm:text-lg">
          {t("description")}
        </p>

        {items && items.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 sm:gap-8 lg:mt-16 lg:grid-cols-3">
            {items.map((item, i) => (
              <div
                key={i}
                className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-600 sm:h-12 sm:w-12">
                  {icons[i % icons.length]}
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900 sm:mt-5 sm:text-lg">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 sm:gap-8 lg:mt-16 lg:grid-cols-3">
            {icons.map((icon, i) => (
              <div
                key={i}
                className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-600 sm:h-12 sm:w-12">
                  {icon}
                </div>
                <div className="mt-4 h-4 w-32 rounded bg-gray-200 sm:mt-5" />
                <div className="mt-3 h-3 w-full rounded bg-gray-100" />
                <div className="mt-2 h-3 w-3/4 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
