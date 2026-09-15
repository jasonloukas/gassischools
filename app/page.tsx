export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-2xl font-semibold">Gassi Trip Portal</h1>
      <p className="text-slate-600">
        Χρησιμοποιήστε το link της εκδρομής σας (/portal/[token]) ή{" "}
        <a href="/staff-login" className="underline">
          συνδεθείτε ως προσωπικό
        </a>
        .
      </p>
    </main>
  );
}
