type ODataQuery = {
  filter?: string;
  orderBy?: string;
  select?: string[];
  top?: number;
};

function escapeODataString(value: string) {
  return value.replace(/'/g, "''");
}

export function eqFilter(field: string, value: string) {
  return `${field} eq '${escapeODataString(value)}'`;
}

export function guidEqFilter(field: string, value: string) {
  return `${field} eq ${value}`;
}

export function andFilters(...filters: Array<string | undefined | null | false>) {
  return filters.filter(Boolean).join(" and ");
}

export function orFilters(...filters: Array<string | undefined | null | false>) {
  return filters.filter(Boolean).join(" or ");
}

export function inFilter(field: string, values: string[]) {
  return orFilters(...values.map((value) => eqFilter(field, value)));
}

export function odataQuery({ filter, orderBy, select, top }: ODataQuery) {
  const params = new URLSearchParams();

  if (filter) params.set("$filter", filter);
  if (orderBy) params.set("$orderby", orderBy);
  if (select?.length) params.set("$select", select.join(","));
  if (typeof top === "number") params.set("$top", String(top));

  return params.toString();
}

export function eq(field: string, value: string) {
  return odataQuery({ filter: eqFilter(field, value) });
}

export function unwrap<T>(payload: { value?: T[] } | T[]): T[] {
  if (Array.isArray(payload)) return payload;
  return payload.value || [];
}
