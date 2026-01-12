function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface PaginationQueryDTO {
  page: number;
  size: number;
}

export interface CourseFilterDTO {
  [key: string]: any;
}

export function parseCourseQuery(query: any): {
  isValid: boolean;
  errors: string[];
  data?: { page: number; size: number; filters: CourseFilterDTO };
} {
  const errors: string[] = [];

  const rawPage = query?.page;
  const rawSize = query?.size;

  let page = 1;
  let size = 20;

  if (rawPage !== undefined && rawPage !== null && String(rawPage).trim() !== "") {
    const n = Number(rawPage);
    if (Number.isNaN(n) || n < 1) {
      errors.push("Pagina debe ser un número entero mayor o igual a 1");
    } else {
      page = Math.floor(n);
    }
  }

  if (rawSize !== undefined && rawSize !== null && String(rawSize).trim() !== "") {
    const n = Number(rawSize);
    if (Number.isNaN(n) || n < 1 || n > 100) {
      errors.push("Tamaño debe ser un número entero entre 1 y 100");
    } else {
      size = Math.floor(n);
    }
  }

  const filters: CourseFilterDTO = {};

  // name -> partial, case-insensitive
  if (query?.name !== undefined && String(query.name).trim() !== "") {
    const v = String(query.name).trim();
    filters.name = { $regex: escapeRegExp(v), $options: "i" };
  }

  // modality -> exact match
  if (query?.modality !== undefined && String(query.modality).trim() !== "") {
    filters.modality = String(query.modality).trim();
  }

  // price range
  if (query?.minPrice !== undefined && String(query.minPrice).trim() !== "") {
    const n = Number(query.minPrice);
    if (Number.isNaN(n) || n < 0) errors.push("minPrice debe ser un número >= 0");
    else filters.price = { ...(filters.price || {}), $gte: n };
  }
  if (query?.maxPrice !== undefined && String(query.maxPrice).trim() !== "") {
    const n = Number(query.maxPrice);
    if (Number.isNaN(n) || n < 0) errors.push("maxPrice debe ser un número >= 0");
    else filters.price = { ...(filters.price || {}), $lte: n };
  }

  // start date range
  if (query?.startDateFrom !== undefined && String(query.startDateFrom).trim() !== "") {
    const d = new Date(String(query.startDateFrom));
    if (Number.isNaN(d.getTime())) errors.push("startDateFrom no es una fecha válida");
    else filters.startDate = { ...(filters.startDate || {}), $gte: d };
  }
  if (query?.startDateTo !== undefined && String(query.startDateTo).trim() !== "") {
    const d = new Date(String(query.startDateTo));
    if (Number.isNaN(d.getTime())) errors.push("startDateTo no es una fecha válida");
    else filters.startDate = { ...(filters.startDate || {}), $lte: d };
  }

  if (errors.length > 0) return { isValid: false, errors };

  return { isValid: true, errors: [], data: { page, size, filters } };
}
