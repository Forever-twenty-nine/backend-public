import prepareResponse from "../api-response";

describe("prepareResponse", () => {
  it("should return ApiResponse with status, message, and data", () => {
    const result = prepareResponse(200, "Success", { id: 1 });

    expect(result).toEqual({
      status: 200,
      message: "Success",
      data: { id: 1 },
      pagination: undefined,
      errors: undefined,
    });
  });

  it("should return ApiResponse with pagination", () => {
    const pagination = { page: 1, page_size: 10, count: 100 };
    const result = prepareResponse(200, "Success", [], pagination);

    expect(result).toEqual({
      status: 200,
      message: "Success",
      data: [],
      pagination,
      errors: undefined,
    });
  });

  it("should return ApiResponse with errors", () => {
    const errors = [{ key: "error", message: "Error occurred" }];
    const result = prepareResponse(400, "Bad Request", null, undefined, errors);

    expect(result).toEqual({
      status: 400,
      message: "Bad Request",
      data: null,
      pagination: undefined,
      errors,
    });
  });

  it("should handle null message", () => {
    const result = prepareResponse(404, null, null);

    expect(result).toEqual({
      status: 404,
      message: null,
      data: null,
      pagination: undefined,
      errors: undefined,
    });
  });
});
