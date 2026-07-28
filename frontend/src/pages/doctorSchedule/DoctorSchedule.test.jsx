import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import api from "../../services/api";
import DoctorSchedule from "./DoctorSchedule";

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "d1",
      firstName: "Dina",
      lastName: "Doctor",
    },
  }),
}));

vi.mock("../../components/sidebar/Sidebar", () => ({
  default: () => <aside>Sidebar</aside>,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

const appointment = {
  id: "a1",
  date: "2026-07-28",
  time: "09:00:00",
  patient_id: "p1",
  patient_name: "Test Patient",
  treatment_type: "Filling",
  status: "scheduled",
};

describe("DoctorSchedule status workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows a retryable error instead of mock appointments", async () => {
    api.get.mockRejectedValue(new Error("network down"));

    render(<DoctorSchedule />);

    expect(
      await screen.findByText("Failed to load doctor schedule"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Retry" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Tamar Weiss")).not.toBeInTheDocument();
  });

  it("uses the server-confirmed status after a successful update", async () => {
    api.get.mockResolvedValue({ data: [appointment] });
    api.patch.mockResolvedValue({
      data: {
        appointment: {
          id: "a1",
          status: "confirmed",
        },
      },
    });

    const user = userEvent.setup();
    render(<DoctorSchedule />);

    const select = await screen.findByRole("combobox");
    await user.selectOptions(select, "confirmed");

    await waitFor(() => expect(select).toHaveValue("confirmed"));
    expect(api.patch).toHaveBeenCalledWith(
      "/appointments/a1/status",
      { status: "confirmed" },
    );
  });

  it("keeps the old status and displays the API message on failure", async () => {
    api.get.mockResolvedValue({ data: [appointment] });
    api.patch.mockRejectedValue({
      response: {
        data: {
          message: "No valid price is configured for Filling",
        },
      },
    });

    const user = userEvent.setup();
    render(<DoctorSchedule />);

    const select = await screen.findByRole("combobox");
    await user.selectOptions(select, "completed");

    expect(
      await screen.findByText(
        "No valid price is configured for Filling",
      ),
    ).toBeInTheDocument();
    expect(select).toHaveValue("scheduled");
  });

  it("disables a completed appointment status", async () => {
    api.get.mockResolvedValue({
      data: [{ ...appointment, status: "completed" }],
    });

    render(<DoctorSchedule />);

    expect(await screen.findByRole("combobox")).toBeDisabled();
  });

  it("only disables the appointment whose status is saving", async () => {
    api.get.mockResolvedValue({
      data: [
        appointment,
        {
          ...appointment,
          id: "a2",
          time: "10:00:00",
          patient_name: "Second Patient",
        },
      ],
    });
    api.patch.mockReturnValue(new Promise(() => {}));

    const user = userEvent.setup();
    render(<DoctorSchedule />);

    const selects = await screen.findAllByRole("combobox");
    await user.selectOptions(selects[0], "confirmed");

    expect(selects[0]).toBeDisabled();
    expect(selects[1]).toBeEnabled();
    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });
});
