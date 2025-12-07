import { PortfolioDashboard } from "@/components/PortfolioDashboard";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-10">
      <PortfolioDashboard />
    </main>
  );
}
