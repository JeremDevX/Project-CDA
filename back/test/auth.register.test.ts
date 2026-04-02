import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../src/app";
import { prisma } from "../src/database";

describe("POST /api/auth/register", () => {
  const app = createApp();

  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.tokenBlacklist.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates a user with valid data", async () => {
    const response = await request(app).post("/api/auth/register").send({
      username: "jeremie",
      email: "jeremie@example.com",
      password: "secret123",
      confirmPassword: "secret123",
    });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeTypeOf("string");
    expect(response.body.user.email).toBe("jeremie@example.com");
    expect(response.body.user.password).toBeUndefined();
  });

  it("returns 409 when email already exists", async () => {
    await request(app).post("/api/auth/register").send({
      username: "jeremie",
      email: "jeremie@example.com",
      password: "secret123",
      confirmPassword: "secret123",
    });

    const response = await request(app).post("/api/auth/register").send({
      username: "other",
      email: "jeremie@example.com",
      password: "secret123",
      confirmPassword: "secret123",
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("email already exists");
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await request(app).post("/api/auth/register").send({
      username: "",
      email: "",
      password: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("username, email and password are required");
  });

  it("returns 400 when password is too short", async () => {
    const response = await request(app).post("/api/auth/register").send({
      username: "jeremie",
      email: "jeremie@example.com",
      password: "12345",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("password must be at least 6 characters");
  });

  it.todo("returns 400 when email format is invalid");
  it.todo("returns 400 when password confirmation does not match");
});
