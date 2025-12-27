export interface GetFAQsQueryDTO {
  activeOnly: boolean;
}

export function validateGetFAQsQuery(query: any): GetFAQsQueryDTO {
  return {
    activeOnly: query.activeOnly === 'true' || query.activeOnly === true,
  };
}

export function validateCategory(category: any): {
  isValid: boolean;
  errors: string[];
  data?: string;
} {
  const errors: string[] = [];

  if (!category || typeof category !== 'string' || category.trim() === '') {
    errors.push('Category is required and must be a non-empty string');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: category.trim(),
  };
}
