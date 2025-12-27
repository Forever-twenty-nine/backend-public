import maskSensitiveMiddleware from "@/middlewares/maskSensitive.middleware";
import maskResponseMiddleware from "@/middlewares/maskResponse.middleware";

describe("mask middlewares", () => {
  test("maskSensitiveMiddleware masks req.body and headers", (done) => {
    const req: any = {
      body: { password: "secret", nested: { email: "a@b.com" } },
      headers: { authorization: "tok" },
    };
    const res: any = {};
    maskSensitiveMiddleware(req, res, () => {
      try {
        expect(req.body.password).toBe("***");
        expect(req.body.nested.email).toMatch(/\*\*@b.com$/);
        expect(req.headers.authorization).toBe("***");
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  test("maskResponseMiddleware masks res.json output", () => {
    const req: any = {};
    let sent: any = null;
    const res: any = {
      json: (b: any) => {
        sent = b;
        return b;
      },
      send: (b: any) => {
        sent = b;
        return b;
      },
    };

    // simulate middleware wrapping
    maskResponseMiddleware(req, res, () => {});

    // call json with sensitive data
    // @ts-expect-error Testing middleware override
    res.json({ password: "x", email: "aa@bb.com", ok: true });
    expect(sent.password).toBe("***");
    expect(sent.email).toMatch(/\*\*@bb.com$/);
  });
});
