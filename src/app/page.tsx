import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login"); // Теперь редирект на страницу входа
}
