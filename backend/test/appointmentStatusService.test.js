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

const {
  changeAppointmentStatus,
} = require("../services/appointmentStatusService");

test("confirmed status persists without querying treatment prices", async () => {
  const sqlCalls = [];
  const database = {
    query: async (sql, params) => {
      sqlCalls.push({ sql, params });

      if (sql.includes("FROM appointments")) {
        return [[appointment]];
      }

      if (sql.includes("UPDATE appointments")) {
        return [{ affectedRows: 1 }];
      }

      throw new Error(`Unexpected SQL: ${sql}`);
    },
  };

  const result = await changeAppointmentStatus({
    database,
    appointmentId: "a1",
    nextStatus: "cancelled",
    actor: { id: "d1", role: "doctor" },
  });

  assert.deepEqual(result, { id: "a1", status: "cancelled" });
  assert.equal(
    sqlCalls.some(({ sql }) => sql.includes("treatment_types")),
    false,
  );
});

const createCompletionDatabase = ({
  treatmentRows = [{ price: "200.00" }],
  existingTreatmentRows = [],
  existingInvoiceRows = [],
  failInvoiceInsert = false,
} = {}) => {
  const calls = [];
  const connection = {
    beginTransaction: async () => calls.push("begin"),
    query: async (sql) => {
      calls.push(sql);

      if (sql.includes("FROM appointments")) {
        return [[{
          ...appointment,
          treatment_type_id: "tt2",
          treatment_type: "Filling",
          date: "2026-07-28",
        }]];
      }
      if (sql.includes("FROM treatment_types")) {
        return [treatmentRows];
      }
      if (sql.includes("FROM treatments")) {
        return [existingTreatmentRows];
      }
      if (sql.includes("INSERT INTO treatments")) {
        return [{ affectedRows: 1 }];
      }
      if (sql.includes("FROM invoices")) {
        return [existingInvoiceRows];
      }
      if (sql.includes("INSERT INTO invoices")) {
        if (failInvoiceInsert) {
          throw new Error("invoice insert failed");
        }
        return [{ affectedRows: 1 }];
      }
      if (sql.includes("UPDATE appointments")) {
        return [{ affectedRows: 1 }];
      }

      throw new Error(`Unexpected SQL: ${sql}`);
    },
    commit: async () => calls.push("commit"),
    rollback: async () => calls.push("rollback"),
    release: () => calls.push("release"),
  };

  return {
    database: {
      getConnection: async () => connection,
    },
    calls,
  };
};

test("completion creates one treatment and one unpaid invoice", async () => {
  const { database, calls } = createCompletionDatabase();

  const result = await changeAppointmentStatus({
    database,
    appointmentId: "a1",
    nextStatus: "completed",
    actor: { id: "d1", role: "doctor" },
  });

  assert.deepEqual(result, { id: "a1", status: "completed" });
  assert.equal(
    calls.filter((sql) => String(sql).includes("INSERT INTO treatments")).length,
    1,
  );
  assert.equal(
    calls.filter((sql) => String(sql).includes("INSERT INTO invoices")).length,
    1,
  );
  assert.equal(calls.includes("commit"), true);
  assert.equal(calls.includes("release"), true);
});

test("completion is idempotent when treatment and invoice already exist", async () => {
  const { database, calls } = createCompletionDatabase({
    existingTreatmentRows: [{ id: "t1" }],
    existingInvoiceRows: [{ id: "inv1" }],
  });

  await changeAppointmentStatus({
    database,
    appointmentId: "a1",
    nextStatus: "completed",
    actor: { id: "d1", role: "doctor" },
  });

  assert.equal(
    calls.some((sql) => String(sql).includes("INSERT INTO treatments")),
    false,
  );
  assert.equal(
    calls.some((sql) => String(sql).includes("INSERT INTO invoices")),
    false,
  );
});

test("missing treatment price rolls back completion", async () => {
  const { database, calls } = createCompletionDatabase({
    treatmentRows: [],
  });

  await assert.rejects(
    changeAppointmentStatus({
      database,
      appointmentId: "a1",
      nextStatus: "completed",
      actor: { id: "d1", role: "doctor" },
    }),
    (error) =>
      error.statusCode === 400 &&
      error.message === "No valid price is configured for Filling",
  );

  assert.equal(calls.includes("rollback"), true);
  assert.equal(calls.includes("commit"), false);
  assert.equal(calls.includes("release"), true);
});

test("invoice failure rolls back the entire completion", async () => {
  const { database, calls } = createCompletionDatabase({
    failInvoiceInsert: true,
  });

  await assert.rejects(
    changeAppointmentStatus({
      database,
      appointmentId: "a1",
      nextStatus: "completed",
      actor: { id: "d1", role: "doctor" },
    }),
    /invoice insert failed/,
  );

  assert.equal(calls.includes("rollback"), true);
  assert.equal(calls.includes("commit"), false);
  assert.equal(calls.includes("release"), true);
});
