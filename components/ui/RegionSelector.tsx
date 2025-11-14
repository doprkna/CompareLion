"use client";

import { useRegionStore } from "@/store/useRegionStore";
import { REGIONS, Region } from "@/lib/config/regions";

export default function RegionSelector() {
  const { region, setRegion, language, setLanguage } = useRegionStore();

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 text-sm">
      <select
        value={region}
        onChange={(e) => setRegion(e.target.value as Region)}
        className="border rounded p-1"
      >
        {REGIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="border rounded p-1"
      >
        <option value="en">EN</option>
        <option value="cz">CZ</option>
        <option value="ja">JP</option>
        <option value="ko">KR</option>
        <option value="zh">CN</option>
      </select>
    </div>
  );
}

