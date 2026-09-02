import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-12">
      <Image
        src="/images/Error 404.png"
        alt="Page not found"
        width={320}
        height={320}
        className="object-contain mb-6"
        priority
      />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-[var(--color-primary)] text-white font-semibold text-sm rounded-full transition-colors hover:opacity-90"
      >
        Back to Home
      </Link>
    </div>
  );
}
