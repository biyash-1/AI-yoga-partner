
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AboutPage() {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/"); 
  }
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">About Page</h1>
      <p>Only logged-in users can see this 👌</p>
    </div>
  );
}

