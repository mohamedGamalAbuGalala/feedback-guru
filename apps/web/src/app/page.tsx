export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to <span className="text-primary">Feedback Guru</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Modern, lightning-fast feedback collection tool
        </p>
        <div className="pt-4 space-x-4">
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Get Started
          </a>
          <a
            href="/docs"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
          >
            Documentation
          </a>
        </div>
      </div>
    </div>
  );
}
