import maskSensitiveFields from "@/utils/log.util";

describe("maskSensitiveFields", () => {
  test("masks password and tokens", () => {
    const input = { user: "juan", password: "secret", token: "abc" };
    const out = maskSensitiveFields(input);
    expect(out.user).toBe("juan");
    expect(out.password).toBe("***");
    expect(out.token).toBe("***");
  });

  test("masks emails partially", () => {
    const input = { contact: { email: "juan.perez@example.com" } };
    const out = maskSensitiveFields(input);
    expect(out.contact.email).toMatch(/\*\*\*@example.com$/);
  });

  test("handles arrays and nested objects", () => {
    const input = { list: [{ password: "p" }, { email: "a@b.com" }] };
    const out = maskSensitiveFields(input);
    expect(out.list[0].password).toBe("***");
    expect(out.list[1].email).toMatch(/\*\*@b.com$/);
  });
});
