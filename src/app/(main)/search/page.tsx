import { Suspense } from "react";
import { SearchClient } from "./SearchClient";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <Suspense fallback={<div>Loading search...</div>}>
          <SearchClient />
        </Suspense>
      </div>
    </div>
  );
}
