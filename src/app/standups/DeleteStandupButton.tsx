"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteStandupById } from "./actions";
import { Button } from "@/components/ui/button";

export default function DeleteStandupButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await deleteStandupById(id);
          if (res?.ok) {
            router.refresh();
            toast.success("Deleted.");
          } else {
            toast.error(res?.error ?? "Failed to delete.");
          }
        })
      }
    >
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
