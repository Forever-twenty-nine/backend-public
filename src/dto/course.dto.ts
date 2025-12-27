export interface PaginationQueryDTO {
  page: number;
  size: number;
}

export interface CourseFilterDTO {
  // Aquí se pueden agregar filtros específicos en el futuro
  [key: string]: any;
}

export function validatePaginationQuery(query: any): {
  isValid: boolean;
  errors: string[];
  data?: PaginationQueryDTO;
} {
  const errors: string[] = [];

  const page = Number(query.page);
  const size = Number(query.size);

  let validPage = 1;
  let validSize = 20;

  if (query.page !== undefined) {
    if (isNaN(page) || page < 1) {
      errors.push('Page must be a positive number');
    } else {
      validPage = page;
    }
  }

  if (query.size !== undefined) {
    if (isNaN(size) || size < 1 || size > 100) {
      errors.push('Size must be a number between 1 and 100');
    } else {
      validSize = size;
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      page: validPage,
      size: validSize,
    },
  };
}
