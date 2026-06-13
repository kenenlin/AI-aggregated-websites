import { describe, expect, it } from "vitest";
import { decryptApiKey, encryptApiKey } from "@/lib/crypto/api-key";

describe("api key encryption", () => {
  it("encrypts and decrypts without storing the plain key", () => {
    process.env.API_KEY_ENCRYPTION_SECRET =
      "test-secret-with-more-than-thirty-two-characters";

    const encrypted = encryptApiKey("sk-test-1234567890");

    expect(encrypted.ciphertext).not.toContain("sk-test");
    expect(encrypted.keyHint).toBe("sk-t...7890");
    expect(decryptApiKey(encrypted)).toBe("sk-test-1234567890");
  });
});
