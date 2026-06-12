"use client";

import { MapPinForm } from "@/components/map/MapPinForm";

export default function NewMapPinPage() {
  return (
    <div className="p-6">
      <MapPinForm mode="create" />
    </div>
  );
}

