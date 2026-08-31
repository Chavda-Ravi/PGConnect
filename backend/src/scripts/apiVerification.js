const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../models/User");
const Student = require("../models/Student");
const PGListing = require("../models/PGListing");
const Availability = require("../models/Availability");
const Inquiry = require("../models/Inquiry");
const Booking = require("../models/Booking");
const Favorite = require("../models/Favorite");
const Review = require("../models/Review");

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
const runId = Date.now();
const invalidObjectId = "not-a-valid-object-id";
const missingObjectId = "64b000000000000000000000";

const state = {
  admin: null,
  studentA: null,
  studentB: null,
  ownerA: null,
  ownerB: null,
  pgA: null,
  pgB: null,
  pgForDelete: null,
  availability: null,
  availabilityForDelete: null,
  inquiry: null,
  bookingPending: null,
  bookingAccepted: null,
  bookingRejected: null,
  bookingForCancel: null,
  review: null,
  userForDelete: null,
};

const results = [];

const users = {
  studentA: {
    name: "API Test Student A",
    email: `api.student.a.${runId}@pgconnect.test`,
    phone_no: "7000000001",
    password: "TestPass123!",
    role: "student",
  },
  studentB: {
    name: "API Test Student B",
    email: `api.student.b.${runId}@pgconnect.test`,
    phone_no: "7000000002",
    password: "TestPass123!",
    role: "student",
  },
  ownerA: {
    name: "API Test Owner A",
    email: `api.owner.a.${runId}@pgconnect.test`,
    phone_no: "7000000003",
    password: "TestPass123!",
    role: "pg_owner",
  },
  ownerB: {
    name: "API Test Owner B",
    email: `api.owner.b.${runId}@pgconnect.test`,
    phone_no: "7000000004",
    password: "TestPass123!",
    role: "pg_owner",
  },
};

const bodyHasPassword = (body) => JSON.stringify(body).includes('"password"');

const request = async (method, path, { token, body, query } = {}) => {
  const url = new URL(path, BASE_URL);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    });
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined || body === null ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let data = text;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (_error) {
    data = text;
  }

  return {
    status: response.status,
    body: data,
  };
};

const expectStatus = (actual, expected) => {
  if (Array.isArray(expected)) {
    return expected.includes(actual);
  }

  return actual === expected;
};

const record = async ({
  module,
  name,
  method,
  endpoint,
  expected,
  auth = "none",
  body,
  run,
  validate,
  reason,
}) => {
  let actual = "ERROR";
  let responseBody = null;
  let passed = false;
  let failureReason = reason || "";

  try {
    const response = await run();
    actual = response.status;
    responseBody = response.body;
    passed = expectStatus(actual, expected) && (!validate || validate(response));

    if (!passed && !failureReason) {
      failureReason = `Expected ${JSON.stringify(expected)}, got ${actual}`;
    }
  } catch (error) {
    responseBody = {
      error: error.message,
    };
    failureReason = error.message;
  }

  results.push({
    module,
    name,
    method,
    endpoint,
    requestBody: body,
    auth,
    expected,
    actual,
    response: responseBody,
    passed,
    reason: failureReason,
  });

  return responseBody;
};

const ensureAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  let admin = await User.findOne({ role: "admin" });

  if (!admin) {
    const password = await bcrypt.hash(`AdminPass.${runId}`, 10);
    admin = await User.create({
      name: "API Verification Admin",
      email: `api.admin.${runId}@pgconnect.test`,
      phone_no: "7999999999",
      password,
      role: "admin",
    });
  }

  state.admin = {
    id: admin._id.toString(),
    email: admin.email,
    password: admin.email.startsWith("api.admin.") ? `AdminPass.${runId}` : "user1234",
  };

  await mongoose.connection.close();
};

const loginAs = async (key) => {
  const user = users[key] || state.admin;
  const response = await request("POST", "/api/auth/login", {
    body: {
      email: user.email,
      password: user.password,
    },
  });

  if (!response.body || !response.body.token) {
    throw new Error(`Could not login ${key}: ${JSON.stringify(response.body)}`);
  }

  return {
    id: response.body.user.id,
    token: response.body.token,
  };
};

const register = async (key) => {
  const response = await request("POST", "/api/auth/register", {
    body: users[key],
  });

  if (response.status !== 201 && response.status !== 409) {
    throw new Error(`Could not register ${key}: ${response.status} ${JSON.stringify(response.body)}`);
  }

  const login = await loginAs(key);

  state[key] = {
    ...users[key],
    id: login.id,
    token: login.token,
  };
};

const makeExpiredToken = () =>
  jwt.sign(
    {
      userId: state.studentA.id,
      role: "student",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "-1s",
    },
  );

const bootstrap = async () => {
  await ensureAdmin();

  await record({
    module: "Authentication",
    name: "Register student",
    method: "POST",
    endpoint: "/api/auth/register",
    expected: 201,
    body: users.studentA,
    run: () => request("POST", "/api/auth/register", { body: users.studentA }),
    validate: (res) => !bodyHasPassword(res.body),
  });

  state.studentA = {
    ...users.studentA,
    ...(await loginAs("studentA")),
  };

  for (const key of ["studentB", "ownerA", "ownerB"]) {
    await register(key);
  }

  state.admin.token = (await loginAs("admin")).token;
};

const createFixtureData = async () => {
  let res = await request("POST", "/api/pgs", {
    token: state.ownerA.token,
    body: {
      pgName: `API Test PG A ${runId}`,
      address: "11 Test Street",
      city: "Ahmedabad",
      description: "Verification listing",
      contactNo: "7999999901",
      amenities: ["wifi", "laundry"],
    },
  });
  state.pgA = res.body.pgListing;

  res = await request("POST", "/api/pgs", {
    token: state.ownerB.token,
    body: {
      pgName: `API Test PG B ${runId}`,
      address: "22 Test Street",
      city: "Surat",
      description: "Other owner listing",
      contactNo: "7999999902",
      amenities: ["food"],
    },
  });
  state.pgB = res.body.pgListing;

  res = await request("POST", "/api/pgs", {
    token: state.ownerA.token,
    body: {
      pgName: `API Test PG Delete ${runId}`,
      address: "33 Test Street",
      city: "Vadodara",
      contactNo: "7999999903",
    },
  });
  state.pgForDelete = res.body.pgListing;

  res = await request("POST", "/api/availability", {
    token: state.ownerA.token,
    body: {
      pgId: state.pgA._id,
      totalBeds: 3,
      availableBeds: 2,
    },
  });
  state.availability = res.body.availability;

  res = await request("POST", "/api/pgs", {
    token: state.ownerA.token,
    body: {
      pgName: `API Test PG Availability Delete ${runId}`,
      address: "44 Test Street",
      city: "Rajkot",
      contactNo: "7999999904",
    },
  });
  const pgForAvailabilityDelete = res.body.pgListing;

  res = await request("POST", "/api/availability", {
    token: state.ownerA.token,
    body: {
      pgId: pgForAvailabilityDelete._id,
      totalBeds: 1,
      availableBeds: 1,
    },
  });
  state.availabilityForDelete = res.body.availability;

  res = await request("POST", "/api/inquiries", {
    token: state.studentA.token,
    body: {
      pgId: state.pgA._id,
      message: "Is a room available?",
    },
  });
  state.inquiry = res.body.inquiry;

  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  res = await request("POST", "/api/bookings", {
    token: state.studentA.token,
    body: {
      pgId: state.pgA._id,
      startDate: futureDate,
      duration: 6,
      message: "Please consider my booking.",
    },
  });
  state.bookingPending = res.body.booking;

  res = await request("PUT", `/api/bookings/${state.bookingPending._id}/accept`, {
    token: state.ownerA.token,
  });
  state.bookingAccepted = res.body.booking;

  res = await request("POST", "/api/bookings", {
    token: state.studentB.token,
    body: {
      pgId: state.pgA._id,
      startDate: futureDate,
      duration: 3,
      message: "Second student request.",
    },
  });
  state.bookingRejected = res.body.booking;

  await request("PUT", `/api/bookings/${state.bookingRejected._id}/reject`, {
    token: state.ownerA.token,
  });

  res = await request("POST", "/api/bookings", {
    token: state.studentB.token,
    body: {
      pgId: state.pgB._id,
      startDate: futureDate,
      duration: 2,
    },
  });
  state.bookingForCancel = res.body.booking;
};

const runTests = async () => {
  const invalidToken = "Bearer invalid.token.value";
  const expiredToken = makeExpiredToken();
  const futureDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString();

  await record({
    module: "Authentication",
    name: "Duplicate email registration",
    method: "POST",
    endpoint: "/api/auth/register",
    expected: 409,
    body: users.studentA,
    run: () => request("POST", "/api/auth/register", { body: users.studentA }),
  });
  await record({
    module: "Authentication",
    name: "Missing registration fields",
    method: "POST",
    endpoint: "/api/auth/register",
    expected: 400,
    body: { email: `missing.${runId}@pgconnect.test` },
    run: () => request("POST", "/api/auth/register", { body: { email: `missing.${runId}@pgconnect.test` } }),
  });
  await record({
    module: "Authentication",
    name: "Invalid registration role",
    method: "POST",
    endpoint: "/api/auth/register",
    expected: 400,
    body: { ...users.studentA, email: `badrole.${runId}@pgconnect.test`, role: "admin" },
    run: () =>
      request("POST", "/api/auth/register", {
        body: { ...users.studentA, email: `badrole.${runId}@pgconnect.test`, role: "admin" },
      }),
  });
  await record({
    module: "Authentication",
    name: "Valid student login",
    method: "POST",
    endpoint: "/api/auth/login",
    expected: 200,
    body: { email: users.studentA.email, password: "[redacted]" },
    run: () => request("POST", "/api/auth/login", { body: { email: users.studentA.email, password: users.studentA.password } }),
    validate: (res) => !!res.body.token && !bodyHasPassword(res.body),
  });
  await record({
    module: "Authentication",
    name: "Valid PG owner login",
    method: "POST",
    endpoint: "/api/auth/login",
    expected: 200,
    body: { email: users.ownerA.email, password: "[redacted]" },
    run: () => request("POST", "/api/auth/login", { body: { email: users.ownerA.email, password: users.ownerA.password } }),
    validate: (res) => !!res.body.token && !bodyHasPassword(res.body),
  });
  await record({
    module: "Authentication",
    name: "Incorrect password",
    method: "POST",
    endpoint: "/api/auth/login",
    expected: 401,
    body: { email: users.studentA.email, password: "[redacted]" },
    run: () => request("POST", "/api/auth/login", { body: { email: users.studentA.email, password: "wrong-password" } }),
  });
  await record({
    module: "Authentication",
    name: "Non-existent email login",
    method: "POST",
    endpoint: "/api/auth/login",
    expected: 401,
    body: { email: `none.${runId}@pgconnect.test`, password: "[redacted]" },
    run: () => request("POST", "/api/auth/login", { body: { email: `none.${runId}@pgconnect.test`, password: "wrong-password" } }),
  });
  await record({
    module: "Authentication",
    name: "Missing login fields",
    method: "POST",
    endpoint: "/api/auth/login",
    expected: 400,
    body: { email: users.studentA.email },
    run: () => request("POST", "/api/auth/login", { body: { email: users.studentA.email } }),
  });

  const protectedChecks = [
    ["User Management", "GET", "/api/users", null, state.studentA.token],
    ["Student", "GET", "/api/students/profile", null, state.ownerA.token],
    ["PG Listing", "POST", "/api/pgs", { pgName: "x" }, state.studentA.token],
    ["Inquiry", "POST", "/api/inquiries", { pgId: state.pgA._id, message: "x" }, state.ownerA.token],
    ["Booking", "POST", "/api/bookings", { pgId: state.pgA._id, startDate: futureDate, duration: 1 }, state.ownerA.token],
    ["Availability", "POST", "/api/availability", { pgId: state.pgA._id, totalBeds: 1, availableBeds: 1 }, state.studentA.token],
    ["Favorites", "GET", "/api/favorites", null, state.ownerA.token],
    ["Review & Rating", "POST", "/api/reviews", { pgId: state.pgA._id, bookingId: state.bookingAccepted._id, rating: 4 }, state.ownerA.token],
  ];

  for (const [module, method, endpoint, body, wrongRoleToken] of protectedChecks) {
    await record({
      module,
      name: "Missing authentication",
      method,
      endpoint,
      expected: 401,
      body,
      run: () => request(method, endpoint, { body }),
    });
    await record({
      module,
      name: "Invalid authentication",
      method,
      endpoint,
      expected: 401,
      auth: "invalid",
      body,
      run: () => request(method, endpoint, { token: invalidToken, body }),
    });
    await record({
      module,
      name: "Expired authentication",
      method,
      endpoint,
      expected: 401,
      auth: "expired",
      body,
      run: () => request(method, endpoint, { token: expiredToken, body }),
    });
    await record({
      module,
      name: "Wrong role",
      method,
      endpoint,
      expected: 403,
      auth: "wrong role",
      body,
      run: () => request(method, endpoint, { token: wrongRoleToken, body }),
    });
  }

  await record({
    module: "User Management",
    name: "Admin creates user",
    method: "POST",
    endpoint: "/api/users",
    expected: 201,
    auth: "admin",
    body: { name: "API Delete User", email: `delete.${runId}@pgconnect.test`, phone_no: "7111111111", password: "[redacted]", role: "student" },
    run: async () => {
      const res = await request("POST", "/api/users", {
        token: state.admin.token,
        body: { name: "API Delete User", email: `delete.${runId}@pgconnect.test`, phone_no: "7111111111", password: "DeletePass123!", role: "student" },
      });
      state.userForDelete = res.body;
      return res;
    },
    validate: (res) => !bodyHasPassword(res.body),
  });
  await record({
    module: "User Management",
    name: "Admin gets users without passwords",
    method: "GET",
    endpoint: "/api/users",
    expected: 200,
    auth: "admin",
    run: () => request("GET", "/api/users", { token: state.admin.token }),
    validate: (res) => !bodyHasPassword(res.body),
  });
  await record({
    module: "User Management",
    name: "Admin gets user by id",
    method: "GET",
    endpoint: "/api/users/:id",
    expected: 200,
    auth: "admin",
    run: () => request("GET", `/api/users/${state.studentA.id}`, { token: state.admin.token }),
    validate: (res) => !bodyHasPassword(res.body),
  });
  await record({
    module: "User Management",
    name: "Admin updates user",
    method: "PUT",
    endpoint: "/api/users/:id",
    expected: 200,
    auth: "admin",
    body: { name: "API Test Student A Updated" },
    run: () => request("PUT", `/api/users/${state.studentA.id}`, { token: state.admin.token, body: { name: "API Test Student A Updated" } }),
    validate: (res) => !bodyHasPassword(res.body),
  });
  await record({
    module: "User Management",
    name: "Invalid user id",
    method: "GET",
    endpoint: "/api/users/:id",
    expected: 400,
    auth: "admin",
    run: () => request("GET", `/api/users/${invalidObjectId}`, { token: state.admin.token }),
  });
  await record({
    module: "User Management",
    name: "Non-existent user",
    method: "GET",
    endpoint: "/api/users/:id",
    expected: 404,
    auth: "admin",
    run: () => request("GET", `/api/users/${missingObjectId}`, { token: state.admin.token }),
  });

  await record({
    module: "Student",
    name: "Get empty profile",
    method: "GET",
    endpoint: "/api/students/profile",
    expected: 200,
    auth: "student",
    run: () => request("GET", "/api/students/profile", { token: state.studentA.token }),
    validate: (res) => !bodyHasPassword(res.body),
  });
  await record({
    module: "Student",
    name: "Create profile",
    method: "POST",
    endpoint: "/api/students/profile",
    expected: 201,
    auth: "student",
    body: { college: "LD College", city: "Ahmedabad", maxRent: 9000 },
    run: () =>
      request("POST", "/api/students/profile", {
        token: state.studentA.token,
        body: { college: "LD College", course: "BTech", year: "3", gender: "male", city: "Ahmedabad", preferredLocation: "Navrangpura", maxRent: 9000, roomType: "single", foodRequired: true, acRequired: false },
      }),
  });
  await record({
    module: "Student",
    name: "Duplicate profile",
    method: "POST",
    endpoint: "/api/students/profile",
    expected: 409,
    auth: "student",
    body: { college: "LD College" },
    run: () => request("POST", "/api/students/profile", { token: state.studentA.token, body: { college: "LD College" } }),
  });
  await record({
    module: "Student",
    name: "Update profile",
    method: "PUT",
    endpoint: "/api/students/profile",
    expected: 200,
    auth: "student",
    body: { maxRent: 10000 },
    run: () => request("PUT", "/api/students/profile", { token: state.studentA.token, body: { maxRent: 10000 } }),
  });

  await record({ module: "PG Listing", name: "Owner creates PG", method: "POST", endpoint: "/api/pgs", expected: 201, auth: "pg_owner", body: { pgName: "success" }, run: () => request("POST", "/api/pgs", { token: state.ownerA.token, body: { pgName: `API Extra PG ${runId}`, address: "55 Test Street", city: "Ahmedabad", contactNo: "7999999905" } }) });
  await record({ module: "PG Listing", name: "Public list PGs", method: "GET", endpoint: "/api/pgs", expected: 200, run: () => request("GET", "/api/pgs") });
  await record({ module: "PG Listing", name: "Public get PG by id", method: "GET", endpoint: "/api/pgs/:id", expected: 200, run: () => request("GET", `/api/pgs/${state.pgA._id}`) });
  await record({ module: "PG Listing", name: "Missing required PG fields", method: "POST", endpoint: "/api/pgs", expected: 400, auth: "pg_owner", body: { pgName: "missing" }, run: () => request("POST", "/api/pgs", { token: state.ownerA.token, body: { pgName: "missing" } }) });
  await record({ module: "PG Listing", name: "Invalid PG id", method: "GET", endpoint: "/api/pgs/:id", expected: 400, run: () => request("GET", `/api/pgs/${invalidObjectId}`) });
  await record({ module: "PG Listing", name: "Non-existent PG id", method: "GET", endpoint: "/api/pgs/:id", expected: 404, run: () => request("GET", `/api/pgs/${missingObjectId}`) });
  await record({ module: "PG Listing", name: "Owner updates own PG", method: "PUT", endpoint: "/api/pgs/:id", expected: 200, auth: "pg_owner", body: { city: "Ahmedabad Updated" }, run: () => request("PUT", `/api/pgs/${state.pgA._id}`, { token: state.ownerA.token, body: { city: "Ahmedabad Updated" } }) });
  await record({ module: "PG Listing", name: "Owner cannot update another owner's PG", method: "PUT", endpoint: "/api/pgs/:id", expected: 403, auth: "pg_owner other", body: { city: "Bad" }, run: () => request("PUT", `/api/pgs/${state.pgA._id}`, { token: state.ownerB.token, body: { city: "Bad" } }) });
  await record({ module: "PG Listing", name: "Owner cannot delete another owner's PG", method: "DELETE", endpoint: "/api/pgs/:id", expected: 403, auth: "pg_owner other", run: () => request("DELETE", `/api/pgs/${state.pgA._id}`, { token: state.ownerB.token }) });
  await record({ module: "PG Listing", name: "Owner deletes own PG", method: "DELETE", endpoint: "/api/pgs/:id", expected: 200, auth: "pg_owner", run: () => request("DELETE", `/api/pgs/${state.pgForDelete._id}`, { token: state.ownerA.token }) });

  await record({ module: "PG Discovery", name: "List all PGs", method: "GET", endpoint: "/api/discovery/pgs", expected: 200, run: () => request("GET", "/api/discovery/pgs") });
  await record({ module: "PG Discovery", name: "Search city", method: "GET", endpoint: "/api/discovery/pgs/search", expected: 200, run: () => request("GET", "/api/discovery/pgs/search", { query: { city: "Ahmedabad" } }) });
  await record({ module: "PG Discovery", name: "Search unsupported rent filter safely", method: "GET", endpoint: "/api/discovery/pgs/search", expected: 200, run: () => request("GET", "/api/discovery/pgs/search", { query: { minRent: "5000", maxRent: "10000" } }) });
  await record({ module: "PG Discovery", name: "Empty search results", method: "GET", endpoint: "/api/discovery/pgs/search", expected: 200, run: () => request("GET", "/api/discovery/pgs/search", { query: { city: `Nowhere${runId}` } }) });
  await record({ module: "PG Discovery", name: "Get PG detail", method: "GET", endpoint: "/api/discovery/pgs/:id", expected: 200, run: () => request("GET", `/api/discovery/pgs/${state.pgA._id}`) });
  await record({ module: "PG Discovery", name: "Invalid PG detail id", method: "GET", endpoint: "/api/discovery/pgs/:id", expected: 400, run: () => request("GET", `/api/discovery/pgs/${invalidObjectId}`) });

  await record({ module: "Inquiry", name: "Student creates inquiry", method: "POST", endpoint: "/api/inquiries", expected: 201, auth: "student", body: { pgId: state.pgA._id, message: "Hello" }, run: () => request("POST", "/api/inquiries", { token: state.studentA.token, body: { pgId: state.pgA._id, message: "Hello" } }) });
  await record({ module: "Inquiry", name: "Student views own inquiries", method: "GET", endpoint: "/api/inquiries/student", expected: 200, auth: "student", run: () => request("GET", "/api/inquiries/student", { token: state.studentA.token }) });
  await record({ module: "Inquiry", name: "Owner views own PG inquiries", method: "GET", endpoint: "/api/inquiries/owner", expected: 200, auth: "pg_owner", run: () => request("GET", "/api/inquiries/owner", { token: state.ownerA.token }) });
  await record({ module: "Inquiry", name: "Owner responds to own inquiry", method: "PUT", endpoint: "/api/inquiries/:id/respond", expected: 200, auth: "pg_owner", body: { response: "Yes", status: "answered" }, run: () => request("PUT", `/api/inquiries/${state.inquiry._id}/respond`, { token: state.ownerA.token, body: { response: "Yes", status: "answered" } }) });
  await record({ module: "Inquiry", name: "Owner cannot respond to other owner's inquiry", method: "PUT", endpoint: "/api/inquiries/:id/respond", expected: 403, auth: "pg_owner other", body: { response: "No" }, run: () => request("PUT", `/api/inquiries/${state.inquiry._id}/respond`, { token: state.ownerB.token, body: { response: "No" } }) });
  await record({ module: "Inquiry", name: "Missing inquiry fields", method: "POST", endpoint: "/api/inquiries", expected: 400, auth: "student", body: { pgId: state.pgA._id }, run: () => request("POST", "/api/inquiries", { token: state.studentA.token, body: { pgId: state.pgA._id } }) });
  await record({ module: "Inquiry", name: "Invalid inquiry PG id", method: "POST", endpoint: "/api/inquiries", expected: 400, auth: "student", body: { pgId: invalidObjectId, message: "x" }, run: () => request("POST", "/api/inquiries", { token: state.studentA.token, body: { pgId: invalidObjectId, message: "x" } }) });
  await record({ module: "Inquiry", name: "Non-existent inquiry id", method: "PUT", endpoint: "/api/inquiries/:id/respond", expected: 404, auth: "pg_owner", body: { response: "x" }, run: () => request("PUT", `/api/inquiries/${missingObjectId}/respond`, { token: state.ownerA.token, body: { response: "x" } }) });

  await record({ module: "Booking", name: "Student creates booking", method: "POST", endpoint: "/api/bookings", expected: 201, auth: "student", body: { pgId: state.pgB._id, startDate: futureDate, duration: 1 }, run: () => request("POST", "/api/bookings", { token: state.studentA.token, body: { pgId: state.pgB._id, startDate: futureDate, duration: 1 } }) });
  await record({ module: "Booking", name: "Duplicate active booking", method: "POST", endpoint: "/api/bookings", expected: 409, auth: "student", body: { pgId: state.pgA._id, startDate: futureDate, duration: 1 }, run: () => request("POST", "/api/bookings", { token: state.studentA.token, body: { pgId: state.pgA._id, startDate: futureDate, duration: 1 } }) });
  await record({ module: "Booking", name: "Student views own bookings", method: "GET", endpoint: "/api/bookings/student", expected: 200, auth: "student", run: () => request("GET", "/api/bookings/student", { token: state.studentA.token }) });
  await record({ module: "Booking", name: "Owner views received bookings", method: "GET", endpoint: "/api/bookings/owner", expected: 200, auth: "pg_owner", run: () => request("GET", "/api/bookings/owner", { token: state.ownerA.token }) });
  await record({ module: "Booking", name: "Student gets own booking by id", method: "GET", endpoint: "/api/bookings/:id", expected: 200, auth: "student", run: () => request("GET", `/api/bookings/${state.bookingAccepted._id}`, { token: state.studentA.token }) });
  await record({ module: "Booking", name: "Owner gets own PG booking by id", method: "GET", endpoint: "/api/bookings/:id", expected: 200, auth: "pg_owner", run: () => request("GET", `/api/bookings/${state.bookingAccepted._id}`, { token: state.ownerA.token }) });
  await record({ module: "Booking", name: "Student cannot view another student's booking", method: "GET", endpoint: "/api/bookings/:id", expected: 403, auth: "student other", run: () => request("GET", `/api/bookings/${state.bookingForCancel._id}`, { token: state.studentA.token }) });
  await record({ module: "Booking", name: "Owner cannot manage another owner's booking", method: "PUT", endpoint: "/api/bookings/:id/accept", expected: 403, auth: "pg_owner other", run: () => request("PUT", `/api/bookings/${state.bookingForCancel._id}/accept`, { token: state.ownerA.token }) });
  await record({ module: "Booking", name: "Owner rejects pending booking", method: "PUT", endpoint: "/api/bookings/:id/reject", expected: 400, auth: "pg_owner", run: () => request("PUT", `/api/bookings/${state.bookingAccepted._id}/reject`, { token: state.ownerA.token }) });
  await record({ module: "Booking", name: "Student cancels own pending booking", method: "PUT", endpoint: "/api/bookings/:id/cancel", expected: 200, auth: "student", run: () => request("PUT", `/api/bookings/${state.bookingForCancel._id}/cancel`, { token: state.studentB.token }) });
  await record({ module: "Booking", name: "Invalid booking id", method: "GET", endpoint: "/api/bookings/:id", expected: 400, auth: "student", run: () => request("GET", `/api/bookings/${invalidObjectId}`, { token: state.studentA.token }) });

  await record({ module: "Availability", name: "Get PG availability", method: "GET", endpoint: "/api/availability/pg/:pgId", expected: 200, auth: "student", run: () => request("GET", `/api/availability/pg/${state.pgA._id}`, { token: state.studentA.token }) });
  await record({ module: "Availability", name: "Duplicate availability", method: "POST", endpoint: "/api/availability", expected: 409, auth: "pg_owner", body: { pgId: state.pgA._id, totalBeds: 3, availableBeds: 1 }, run: () => request("POST", "/api/availability", { token: state.ownerA.token, body: { pgId: state.pgA._id, totalBeds: 3, availableBeds: 1 } }) });
  await record({ module: "Availability", name: "Negative beds rejected", method: "POST", endpoint: "/api/availability", expected: 400, auth: "pg_owner", body: { pgId: state.pgB._id, totalBeds: -1, availableBeds: 0 }, run: () => request("POST", "/api/availability", { token: state.ownerB.token, body: { pgId: state.pgB._id, totalBeds: -1, availableBeds: 0 } }) });
  await record({ module: "Availability", name: "Available beds cannot exceed total", method: "PUT", endpoint: "/api/availability/:id", expected: 400, auth: "pg_owner", body: { totalBeds: 1, availableBeds: 2 }, run: () => request("PUT", `/api/availability/${state.availability._id}`, { token: state.ownerA.token, body: { totalBeds: 1, availableBeds: 2 } }) });
  await record({ module: "Availability", name: "Owner updates own availability", method: "PUT", endpoint: "/api/availability/:id", expected: 200, auth: "pg_owner", body: { availableBeds: 1 }, run: () => request("PUT", `/api/availability/${state.availability._id}`, { token: state.ownerA.token, body: { availableBeds: 1 } }) });
  await record({ module: "Availability", name: "Owner cannot update another owner's availability", method: "PUT", endpoint: "/api/availability/:id", expected: 403, auth: "pg_owner other", body: { availableBeds: 1 }, run: () => request("PUT", `/api/availability/${state.availability._id}`, { token: state.ownerB.token, body: { availableBeds: 1 } }) });
  await record({ module: "Availability", name: "Invalid availability id", method: "PUT", endpoint: "/api/availability/:id", expected: 400, auth: "pg_owner", body: { availableBeds: 1 }, run: () => request("PUT", `/api/availability/${invalidObjectId}`, { token: state.ownerA.token, body: { availableBeds: 1 } }) });
  await record({ module: "Availability", name: "Owner deletes own availability", method: "DELETE", endpoint: "/api/availability/:id", expected: 200, auth: "pg_owner", run: () => request("DELETE", `/api/availability/${state.availabilityForDelete._id}`, { token: state.ownerA.token }) });

  await record({ module: "Favorites", name: "Student adds favorite", method: "POST", endpoint: "/api/favorites/:pgId", expected: 201, auth: "student", run: () => request("POST", `/api/favorites/${state.pgA._id}`, { token: state.studentA.token }) });
  await record({ module: "Favorites", name: "Duplicate favorite", method: "POST", endpoint: "/api/favorites/:pgId", expected: 409, auth: "student", run: () => request("POST", `/api/favorites/${state.pgA._id}`, { token: state.studentA.token }) });
  await record({ module: "Favorites", name: "Get own favorites", method: "GET", endpoint: "/api/favorites", expected: 200, auth: "student", run: () => request("GET", "/api/favorites", { token: state.studentA.token }) });
  await record({ module: "Favorites", name: "Check favorite", method: "GET", endpoint: "/api/favorites/:pgId", expected: 200, auth: "student", run: () => request("GET", `/api/favorites/${state.pgA._id}`, { token: state.studentA.token }) });
  await record({ module: "Favorites", name: "Invalid favorite PG id", method: "GET", endpoint: "/api/favorites/:pgId", expected: 400, auth: "student", run: () => request("GET", `/api/favorites/${invalidObjectId}`, { token: state.studentA.token }) });
  await record({ module: "Favorites", name: "Remove favorite", method: "DELETE", endpoint: "/api/favorites/:pgId", expected: 200, auth: "student", run: () => request("DELETE", `/api/favorites/${state.pgA._id}`, { token: state.studentA.token }) });
  await record({ module: "Favorites", name: "Remove missing favorite", method: "DELETE", endpoint: "/api/favorites/:pgId", expected: 404, auth: "student", run: () => request("DELETE", `/api/favorites/${state.pgA._id}`, { token: state.studentA.token }) });

  await record({ module: "Review & Rating", name: "Student creates review for accepted booking", method: "POST", endpoint: "/api/reviews", expected: 201, auth: "student", body: { pgId: state.pgA._id, bookingId: state.bookingAccepted._id, rating: 4 }, run: async () => {
    const res = await request("POST", "/api/reviews", { token: state.studentA.token, body: { pgId: state.pgA._id, bookingId: state.bookingAccepted._id, rating: 4, comment: "Good stay." } });
    state.review = res.body.review;
    return res;
  } });
  await record({ module: "Review & Rating", name: "Duplicate review", method: "POST", endpoint: "/api/reviews", expected: 409, auth: "student", body: { pgId: state.pgA._id, bookingId: state.bookingAccepted._id, rating: 5 }, run: () => request("POST", "/api/reviews", { token: state.studentA.token, body: { pgId: state.pgA._id, bookingId: state.bookingAccepted._id, rating: 5 } }) });
  await record({ module: "Review & Rating", name: "Student views own reviews", method: "GET", endpoint: "/api/reviews/my", expected: 200, auth: "student", run: () => request("GET", "/api/reviews/my", { token: state.studentA.token }) });
  await record({ module: "Review & Rating", name: "View PG reviews", method: "GET", endpoint: "/api/reviews/pg/:pgId", expected: 200, auth: "student", run: () => request("GET", `/api/reviews/pg/${state.pgA._id}`, { token: state.studentA.token }) });
  await record({ module: "Review & Rating", name: "Reject unaccepted booking review", method: "POST", endpoint: "/api/reviews", expected: 400, auth: "student", body: { pgId: state.pgA._id, bookingId: state.bookingRejected._id, rating: 4 }, run: () => request("POST", "/api/reviews", { token: state.studentB.token, body: { pgId: state.pgA._id, bookingId: state.bookingRejected._id, rating: 4 } }) });
  await record({ module: "Review & Rating", name: "Reject another student's booking review", method: "POST", endpoint: "/api/reviews", expected: 403, auth: "student other", body: { pgId: state.pgA._id, bookingId: state.bookingAccepted._id, rating: 4 }, run: () => request("POST", "/api/reviews", { token: state.studentB.token, body: { pgId: state.pgA._id, bookingId: state.bookingAccepted._id, rating: 4 } }) });
  await record({ module: "Review & Rating", name: "Reject invalid rating low", method: "POST", endpoint: "/api/reviews", expected: 400, auth: "student", body: { pgId: state.pgA._id, bookingId: state.bookingAccepted._id, rating: 0 }, run: () => request("POST", "/api/reviews", { token: state.studentA.token, body: { pgId: state.pgA._id, bookingId: state.bookingAccepted._id, rating: 0 } }) });
  await record({ module: "Review & Rating", name: "Reject invalid rating high", method: "PUT", endpoint: "/api/reviews/:id", expected: 400, auth: "student", body: { rating: 6 }, run: () => request("PUT", `/api/reviews/${state.review._id}`, { token: state.studentA.token, body: { rating: 6 } }) });
  await record({ module: "Review & Rating", name: "Update own review", method: "PUT", endpoint: "/api/reviews/:id", expected: 200, auth: "student", body: { rating: 5 }, run: () => request("PUT", `/api/reviews/${state.review._id}`, { token: state.studentA.token, body: { rating: 5, comment: "Updated." } }) });
  await record({ module: "Review & Rating", name: "Another student cannot update review", method: "PUT", endpoint: "/api/reviews/:id", expected: 403, auth: "student other", body: { rating: 3 }, run: () => request("PUT", `/api/reviews/${state.review._id}`, { token: state.studentB.token, body: { rating: 3 } }) });
  await record({ module: "Review & Rating", name: "Invalid review id", method: "PUT", endpoint: "/api/reviews/:id", expected: 400, auth: "student", body: { rating: 3 }, run: () => request("PUT", `/api/reviews/${invalidObjectId}`, { token: state.studentA.token, body: { rating: 3 } }) });
  await record({ module: "Review & Rating", name: "Delete own review", method: "DELETE", endpoint: "/api/reviews/:id", expected: 200, auth: "student", run: () => request("DELETE", `/api/reviews/${state.review._id}`, { token: state.studentA.token }) });

  await record({ module: "User Management", name: "Admin deletes user", method: "DELETE", endpoint: "/api/users/:id", expected: 200, auth: "admin", run: () => request("DELETE", `/api/users/${state.userForDelete._id}`, { token: state.admin.token }) });
};

const summarize = () => {
  const modules = [...new Set(results.map((result) => result.module))];
  const moduleResults = Object.fromEntries(
    modules.map((module) => {
      const moduleTests = results.filter((result) => result.module === module);
      const passed = moduleTests.filter((result) => result.passed).length;
      return [
        module,
        {
          passed,
          total: moduleTests.length,
          status: passed === moduleTests.length ? "PASS" : "FAIL",
        },
      ];
    }),
  );

  return {
    runId,
    baseUrl: BASE_URL,
    total: results.length,
    passed: results.filter((result) => result.passed).length,
    failed: results.filter((result) => !result.passed).length,
    modules: moduleResults,
    failures: results.filter((result) => !result.passed),
    results,
  };
};

const cleanupTestData = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const testUsers = await User.find({
    email: /@pgconnect\.test$/,
  }).select("_id");
  const testUserIds = testUsers.map((user) => user._id);

  const testPGs = await PGListing.find({
    pgName: /^API (Test|Extra)/,
  }).select("_id");
  const testPGIds = testPGs.map((pg) => pg._id);

  await Promise.all([
    Review.deleteMany({
      $or: [{ studentId: { $in: testUserIds } }, { pgId: { $in: testPGIds } }],
    }),
    Favorite.deleteMany({
      $or: [{ studentId: { $in: testUserIds } }, { pgId: { $in: testPGIds } }],
    }),
    Inquiry.deleteMany({
      $or: [{ studentId: { $in: testUserIds } }, { pgId: { $in: testPGIds } }],
    }),
    Booking.deleteMany({
      $or: [{ studentId: { $in: testUserIds } }, { pgId: { $in: testPGIds } }],
    }),
    Availability.deleteMany({ pgId: { $in: testPGIds } }),
    Student.deleteMany({ userId: { $in: testUserIds } }),
  ]);

  await PGListing.deleteMany({ _id: { $in: testPGIds } });
  await User.deleteMany({ _id: { $in: testUserIds } });

  await mongoose.connection.close();
};

const main = async () => {
  await bootstrap();
  await createFixtureData();
  await runTests();

  const summary = summarize();
  await cleanupTestData();

  console.log(JSON.stringify(summary, null, 2));
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
