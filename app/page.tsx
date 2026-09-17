import { BrandLogo } from "@/components/brand-logo";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <BrandLogo height={72} />
      <p className="text-slate-600">
        Χρησιμοποιήστε το link της εκδρομής σας (/portal/[token]) ή{" "}
        <a href="/staff-login" className="text-brand-teal underline">
          συνδεθείτε ως προσωπικό
        </a>
        .
      </p>
    </main>
  );
}
