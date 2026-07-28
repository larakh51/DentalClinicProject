const test = require("node:test");
const assert = require("node:assert/strict");

const {
  AppointmentStatusError,
  validateStatus,
  authorizeStatusChange,
} = require("../services/appointmentStatusService");

const appointment = {
  id: "a1",
  patient_id: "p1",
  doctor_id: "d1",
  status: "confirmed",
};

test("validateStatus accepts the four appointment statuses", () => {
  for (const status of [
    "scheduled",
    "confirmed",
    "completed",
    "cancelled",
  ]) {
    assert.doesNotThrow(() => validateStatus(status));
  }
});

test("validateStatus rejects unsupported values", () => {
  assert.throws(
    () => validateStatus("paid"),
    (error) =>
      error instanceof AppointmentStatusError &&
      error.statusCode === 400 &&
      error.message === "Invalid appointment status",
  );
});

test("assigned doctor and manager may manage an appointment", () => {
  assert.doesNotThrow(() =>
    authorizeStatusChange(
      { id: "d1", role: "doctor" },
      appointment,
      "completed",
    ),
  );
  assert.doesNotThrow(() =>
    authorizeStatusChange(
      { id: "m1", role: "manager" },
      appointment,
      "cancelled",
    ),
  );
});

test("patient may only cancel their own scheduled or confirmed appointment", () => {
  assert.doesNotThrow(() =>
    authorizeStatusChange(
      { id: "p1", role: "patient" },
      appointment,
      "cancelled",
    ),
  );
  assert.throws(
    () =>
      authorizeStatusChange(
        { id: "p1", role: "patient" },
        appointment,
        "completed",
      ),
    (error) => error.statusCode === 403,
  );
});

test("doctor cannot update another doctor's appointment", () => {
  assert.throws(
    () =>
      authorizeStatusChange(
        { id: "d2", role: "doctor" },
        appointment,
        "confirmed",
      ),
    (error) => error.statusCode === 403,
  );
});

test("missing authenticated actor is rejected", () => {
  assert.throws(
    () => authorizeStatusChange(null, appointment, "confirmed"),
    (error) =>
      error.statusCode === 401 &&
      error.message === "Not authorized",
  );
});

test("completed appointments cannot be reopened", () => {
  assert.throws(
    () =>
      authorizeStatusChange(
        { id: "d1", role: "doctor" },
        { ...appointment, status: "completed" },
        "scheduled",
      ),
    (error) =>
      error.statusCode === 409 &&
      error.message === "Completed appointments cannot be reopened",
  );
});
