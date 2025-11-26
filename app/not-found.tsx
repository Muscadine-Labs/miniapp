import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4 py-8">
      <div className="text-center p-6 sm:p-8 md:p-12 bg-white rounded-xl shadow-md max-w-md w-full">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-slate-900 mb-4">404</h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-500 mb-4 sm:mb-6">Page Not Found</h2>
        <p className="text-base sm:text-lg text-slate-400 mb-6 sm:mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link 
          href="/" 
          className="inline-block px-6 sm:px-8 py-3 bg-indigo-500 text-white rounded-lg no-underline text-base sm:text-lg font-semibold hover:bg-indigo-600 active:bg-indigo-700 transition-colors duration-200 min-h-[44px] flex items-center justify-center"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}