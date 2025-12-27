export interface CreateBusinessTrainingDTO {
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
}

export function validateCreateBusinessTrainingDTO(data: any): {
  isValid: boolean;
  errors: string[];
  data?: CreateBusinessTrainingDTO;
} {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    errors.push("Name is required and must be a non-empty string");
  } else if (data.name.length > 100) {
    errors.push("Name must be less than 100 characters");
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
  } else if (data.message.length > 1000) {
    errors.push("Message must be less than 1000 characters");
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phoneNumber: data.phoneNumber.trim(),
      message: data.message.trim(),
    },
  };
}
