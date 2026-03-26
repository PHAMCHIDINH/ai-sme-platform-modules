import { describe, expect, it } from "vitest";
import { buildCloudinarySignature, getCloudinaryUploadConfig } from "./cloudinary";

describe("buildCloudinarySignature", () => {
  it("creates deterministic SHA1 signature with sorted params", async () => {
    const signature = await buildCloudinarySignature(
      {
        timestamp: 1710000000,
        folder: "student-avatars",
      },
      "test_secret",
    );

    expect(signature).toBe("17767d3adbeea8f33a2a4e22b205e3b443d6db10");
  });

  it("ignores empty params", async () => {
    const signature = await buildCloudinarySignature(
      {
        timestamp: 1710000000,
        folder: "",
      },
      "test_secret",
    );

    expect(signature).toBe("377632db8f3ed0fd07877473d4553077f133436e");
  });
});

describe("getCloudinaryUploadConfig", () => {
  it("returns null when any required env is missing", () => {
    const config = getCloudinaryUploadConfig({
      CLOUDINARY_CLOUD_NAME: "demo",
      CLOUDINARY_API_KEY: "123",
      CLOUDINARY_API_SECRET: "",
    });

    expect(config).toBeNull();
  });

  it("returns trimmed values when env vars are present", () => {
    const config = getCloudinaryUploadConfig({
      CLOUDINARY_CLOUD_NAME: " demo ",
      CLOUDINARY_API_KEY: " 123 ",
      CLOUDINARY_API_SECRET: " secret ",
    });

    expect(config).toEqual({
      cloudName: "demo",
      apiKey: "123",
      apiSecret: "secret",
    });
  });
});
