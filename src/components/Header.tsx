import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="rounded-md text-lg font-semibold text-slate-900 hover:text-indigo-700"
        >
          ScopeSignal
        </Link>
        <nav aria-label="Main" className="flex items-center gap-5 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-indigo-700">
            New analysis
          </Link>
          <Link href="/analyses" className="hover:text-indigo-700">
            History
          </Link>
        </nav>
      </div>
    </header>
  );
}
