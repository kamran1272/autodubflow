export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex max-w-md items-center justify-center px-6 py-20">
      <div className="card w-full p-8">
        <h1 className="text-3xl font-semibold">Reset your password</h1>
        <p className="mt-2 text-muted-foreground">Enter your email and we’ll send a reset link.</p>
        <form className="mt-6 space-y-4">
          <input className="w-full rounded-md border border-border bg-transparent px-3 py-2" placeholder="Email" />
          <button className="btn-primary w-full">Send reset link</button>
        </form>
      </div>
    </div>
  );
}
