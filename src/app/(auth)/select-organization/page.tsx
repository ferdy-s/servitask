import { redirect } from "next/navigation";
import OrgSelector from "@/components/org-selector"; // Import component yg dibuat diatas
// import { getCurrentUser } from "@/lib/session"; // Contoh fungsi auth Anda
// import { db } from "@/lib/db"; // Contoh db Anda

export default async function SelectOrganizationPage() {
  // 1. Cek user login (Contoh)
  // const user = await getCurrentUser();
  // if (!user) redirect("/login");

  // 2. Fetch Data Organisasi (Ganti dengan logic fetch database Anda)
  // const organizations = await db.organization.findMany({ where: { userId: user.id } });

  // MOCK DATA (Contoh sementara agar tidak error)
  const organizations = [
    { id: "1", name: "Org A", role: "Owner" },
    { id: "2", name: "Org B", role: "Member" },
  ];

  return <OrgSelector organizations={organizations} />;
}
