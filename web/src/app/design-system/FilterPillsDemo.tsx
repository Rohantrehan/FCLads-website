"use client";

import { useState } from "react";
import { FilterPills } from "@/components/ui/FilterPills";

const topics = ["All", "Tactics", "Gameplay", "Skill moves", "FUT Champs", "Updates"].map((p) => ({
  value: p,
  label: p,
}));

export function FilterPillsDemo() {
  const [value, setValue] = useState("All");
  return <FilterPills label="Filter by topic" options={topics} value={value} onChange={setValue} />;
}
