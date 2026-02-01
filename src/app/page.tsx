import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/home");
  }

  const role = session.user.role;

  if (role === "SUPER_ADMIN") {
    redirect("/superadmin");
  } else if (role === "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/display");
  }
}
