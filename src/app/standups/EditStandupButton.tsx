"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function EditStandupButton({ date }: { date: string }) {
  const router = useRouter();
  const search = useSearchParams();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        const params = new URLSearchParams(Array.from(search.entries()));
        params.set("date", date);
        router.push(`/standups?${params.toString()}`); // push instead of replace (optional)
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      Edit
    </Button>
  );
}
