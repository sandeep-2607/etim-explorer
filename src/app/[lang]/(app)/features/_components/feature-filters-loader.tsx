import { cacheLife } from "next/cache";
import { getFeatureGroups } from "@/lib/queries/features";
import { FeatureFilters } from "./feature-filters";

/**
 * Cached server loader for the feature filters: fetches the feature-group
 * options inside a `use cache` boundary so the (client) filter bar can render in
 * the static shell of this dynamic route.
 */
export async function FeatureFiltersLoader({ lang }: { lang: string }) {
  "use cache";
  cacheLife("days");
  const groups = await getFeatureGroups({ lang });
  return <FeatureFilters groupOptions={groups} />;
}
