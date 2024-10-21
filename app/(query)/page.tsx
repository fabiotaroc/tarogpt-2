import { QueryForm } from "@/components/query-form";

export default function Home() {
  return (
    <div className="flex h-screen w-full transition-all ease-in-out pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
      <main className="w-full flex items-center justify-center p-4 sm:p-8">
        <QueryForm />
      </main>
    </div>
  );
}
