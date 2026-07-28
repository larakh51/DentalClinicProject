const ALLOWED_STATUSES = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
];

class AppointmentStatusError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "AppointmentStatusError";
    this.statusCode = statusCode;
  }
}

const validateStatus = (nextStatus) => {
  if (!ALLOWED_STATUSES.includes(nextStatus)) {
    throw new AppointmentStatusError(400, "Invalid appointment status");
  }
};

const authorizeStatusChange = (actor, appointment, nextStatus) => {
  if (!actor) {
    throw new AppointmentStatusError(401, "Not authorized");
  }

  const isManager = actor.role === "manager";
  const isAssignedDoctor =
    actor.role === "doctor" && actor.id === appointment.doctor_id;
  const isAllowedPatientCancellation =
    actor.role === "patient" &&
    actor.id === appointment.patient_id &&
    nextStatus === "cancelled" &&
    ["scheduled", "confirmed"].includes(appointment.status);

  if (!isManager && !isAssignedDoctor && !isAllowedPatientCancellation) {
    throw new AppointmentStatusError(
      403,
      "You cannot update this appointment",
    );
  }

  if (appointment.status === "completed" && nextStatus !== "completed") {
    throw new AppointmentStatusError(
      409,
      "Completed appointments cannot be reopened",
    );
  }
};

module.exports = {
  AppointmentStatusError,
  validateStatus,
  authorizeStatusChange,
};
