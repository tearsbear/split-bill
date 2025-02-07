import BillSplitter from "@/components/BillSplitter";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 mb-[150px] md:mb-0">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Split Bill Calculator
      </h1>
      <BillSplitter />
    </main>
  );
}
