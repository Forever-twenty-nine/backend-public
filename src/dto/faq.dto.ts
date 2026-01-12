export interface GetFAQsQueryDTO {
  activeOnly: boolean;
}

export function validateGetFAQsQuery(query: any): GetFAQsQueryDTO {
  const val = query?.activeOnly;
  const activeOnly =
    val === true ||
    val === "true" ||
    val === "1" ||
    val === "yes" ||
    // presence without value (e.g. /faqs?activeOnly) => empty string in query
    val === "";

  return { activeOnly };
}

