import CardMapGenerator from "./components/CardMapGenerator";

export default function Home() {
  return (
    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start p-4">
      <CardMapGenerator />
    </main>
  );
}
