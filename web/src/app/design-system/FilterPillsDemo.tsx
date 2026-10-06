"use client";

import { useState } from "react";
import { FilterPills } from "@/components/ui/FilterPills";

const positions = ["ST", "CAM", "CM", "CDM", "CB", "FB", "GK"].map((p) => ({ value: p, label: p }));

export function FilterPillsDemo() {
  const [value, setValue] = useState("ST");
  return <FilterPills label="Filter by position" options={positions} value={value} onChange={setValue} />;
}
