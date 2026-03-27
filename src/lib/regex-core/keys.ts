import type { MapModKey } from "../../types/maps";

export function normalizeGeneralizedText(value: string): string {
  return value
    .toLowerCase()
    .replaceAll(/^\^|\$$/g, "")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

export function createMapModKey(id: number, generalizedText: string): MapModKey {
  return `${id}:${normalizeGeneralizedText(generalizedText)}`;
}
