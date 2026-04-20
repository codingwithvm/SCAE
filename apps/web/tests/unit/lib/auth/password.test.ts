import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "@/lib/auth/password";

describe("hashPassword", () => {
  it("returns a hashed string different from the original password", async () => {
    const plainPassword = "MySecurePassword123!";

    const hashedPassword = await hashPassword(plainPassword);

    expect(hashedPassword).not.toBe(plainPassword);
    expect(typeof hashedPassword).toBe("string");
  });

  it("generates a different hash each time for the same password", async () => {
    const plainPassword = "MySecurePassword123!";

    const firstHash = await hashPassword(plainPassword);
    const secondHash = await hashPassword(plainPassword);

    expect(firstHash).not.toBe(secondHash);
  });

  it("generates a hash with bcrypt format", async () => {
    const plainPassword = "MySecurePassword123!";

    const hashedPassword = await hashPassword(plainPassword);

    expect(hashedPassword).toMatch(/^\$2b\$/);
  });
});

describe("comparePassword", () => {
  it("returns true when plain password matches the hash", async () => {
    const plainPassword = "MySecurePassword123!";
    const hashedPassword = await hashPassword(plainPassword);

    const isMatch = await comparePassword(plainPassword, hashedPassword);

    expect(isMatch).toBe(true);
  });

  it("returns false when plain password does not match the hash", async () => {
    const plainPassword = "MySecurePassword123!";
    const wrongPassword = "WrongPassword456!";
    const hashedPassword = await hashPassword(plainPassword);

    const isMatch = await comparePassword(wrongPassword, hashedPassword);

    expect(isMatch).toBe(false);
  });

  it("returns false when comparing against an empty string", async () => {
    const plainPassword = "MySecurePassword123!";
    const hashedPassword = await hashPassword(plainPassword);

    const isMatch = await comparePassword("", hashedPassword);

    expect(isMatch).toBe(false);
  });

  it("returns false when hash is empty", async () => {
    const isMatch = await comparePassword("MySecurePassword123!", "");

    expect(isMatch).toBe(false);
  });
});
