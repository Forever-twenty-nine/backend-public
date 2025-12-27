export interface CreateIWantToTrainDTO {
  name: string;
  company: string;
  email: string;
  phonePrefix: string;
  phoneNumber: string;
  message: string;
}

export function validateCreateIWantToTrainDTO(data: any): {
  isValid: boolean;
  errors: string[];
  data?: CreateIWantToTrainDTO;
} {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    errors.push("Name is required and must be a non-empty string");
  } else if (data.name.length > 100) {
    errors.push("Name must be less than 100 characters");
  }

  if (
    !data.company ||
    typeof data.company !== "string" ||
    data.company.trim() === ""
  ) {
    errors.push("Company is required and must be a non-empty string");
  }

  if (
    !data.email ||
    typeof data.email !== "string" ||
    data.email.trim() === ""
  ) {
    errors.push("Email is required and must be a non-empty string");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Invalid email format");
    }
  }

  if (
    !data.phonePrefix ||
    typeof data.phonePrefix !== "string" ||
    data.phonePrefix.trim() === ""
  ) {
    errors.push("Phone prefix is required and must be a non-empty string");
  }

  if (
    !data.phoneNumber ||
    typeof data.phoneNumber !== "string" ||
    data.phoneNumber.trim() === ""
  ) {
    errors.push("Phone number is required and must be a non-empty string");
  }

  if (
    !data.message ||
    typeof data.message !== "string" ||
    data.message.trim() === ""
  ) {
    errors.push("Message is required and must be a non-empty string");
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      name: data.name.trim(),
      company: data.company.trim(),
      email: data.email.trim().toLowerCase(),
      phonePrefix: data.phonePrefix.trim(),
      phoneNumber: data.phoneNumber.trim(),
      message: data.message.trim(),
    },
  };
}
