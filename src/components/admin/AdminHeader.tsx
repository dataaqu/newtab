"use client";

import { useSession, signOut } from "next-auth/react";

export default function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="md:hidden">
        <span className="text-lg font-bold text-gray-900">Newtab</span>
      </div>

      <div className="hidden md:block" />

      <div className="flex items-center gap-4">
        {session?.user && (
          <>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {session.user.name || session.user.email}
              </p>
              <p className="text-xs text-gray-500">{session.user.role}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
