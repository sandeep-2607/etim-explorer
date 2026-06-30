/** Shared types for the ETIM data layer. Mirrors the `etim_core` schema. */

export type ChangeCode = "New" | "Changed" | "Deleted" | "Unchanged";
export type FeatureType = "Numeric" | "Alphanumeric" | "Logical" | "Range";
export type EtimStatus = "Published" | "Deprecated";

/** A language code as stored in the `etim_language_code` enum (e.g. "EN", "de-DE"). */
export type LanguageCode = string;

export interface Stats {
  classes: number;
  features: number;
  values: number;
  units: number;
  groups: number;
  featureGroups: number;
  synonyms: number;
  languages: number;
}

export interface ClassListItem {
  code: string;
  name: string;
  /** True when `name` fell back to English because the active language was missing. */
  nameIsFallback: boolean;
  changeCode: ChangeCode | null;
  version: number;
  groupCode: string;
  status: EtimStatus;
  featureCount: number;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ClassFeatureRow {
  orderNumber: number;
  featureCode: string;
  featureName: string;
  featureType: FeatureType;
  unitAbbr: string | null;
  changeCode: ChangeCode | null;
  /** Permitted values (ordered) for alphanumeric features; empty otherwise. */
  values: string[];
}

export interface ClassDetail {
  code: string;
  name: string;
  nameIsFallback: boolean;
  version: number;
  status: EtimStatus;
  changeCode: ChangeCode | null;
  groupCode: string;
  groupName: string | null;
  mutationDate: string | null;
  translations: { language: string; description: string }[];
  synonyms: string[];
  features: ClassFeatureRow[];
}

/** A localized reference to another entity, for reverse-link lists. */
export interface EntityRef {
  code: string;
  name: string;
  nameIsFallback: boolean;
}

/** A capped reverse-link list (first N rows + the true total). */
export interface CappedList {
  items: EntityRef[];
  total: number;
  cap: number;
  /** True when `total` is a lower bound (derived from a saturated scan window),
   * so the UI must say "more exist" rather than a precise count. */
  approximate?: boolean;
}

export interface FeatureListItem {
  code: string;
  name: string;
  nameIsFallback: boolean;
  type: FeatureType;
  featureGroupCode: string;
  featureGroupName: string | null;
}

export interface FeatureDetail {
  code: string;
  name: string;
  nameIsFallback: boolean;
  type: FeatureType;
  featureGroupCode: string;
  featureGroupName: string | null;
  translations: { language: string; description: string }[];
  classes: CappedList;
}

export interface ValueListItem {
  code: string;
  name: string;
  nameIsFallback: boolean;
}

export interface ValueDetail {
  code: string;
  name: string;
  nameIsFallback: boolean;
  translations: { language: string; description: string }[];
  features: CappedList;
}

export interface UnitListItem {
  code: string;
  name: string;
  nameIsFallback: boolean;
  abbreviation: string | null;
}

export interface UnitDetail {
  code: string;
  name: string;
  nameIsFallback: boolean;
  abbreviation: string | null;
  translations: { language: string; description: string; abbreviation: string | null }[];
  classes: CappedList;
}

export interface GroupListItem {
  code: string;
  name: string;
  nameIsFallback: boolean;
  classCount: number;
}

export interface GroupDetail {
  code: string;
  name: string;
  nameIsFallback: boolean;
  translations: { language: string; description: string }[];
}

/** Option for a filter dropdown (e.g. feature groups). */
export interface FilterOption {
  code: string;
  label: string;
}
