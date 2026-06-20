import { describe, expect, it } from "vitest";
import {
  createAvailableTicket,
  expireTicket,
  makeStaffId,
  makeStoreId,
  makeTicketId,
  redeemTicket,
  voidTicket,
} from "../src/domain/ticket-state";

describe("ticket state machine", () => {
  it("redeems an available ticket when staff records service", () => {
    // Given
    const ticket = createAvailableTicket({
      ticketId: makeTicketId("ticket-1"),
      storeId: makeStoreId("store-1"),
      issuedAt: "2026-06-20T10:00:00.000Z",
    });
    const staffId = makeStaffId("staff-1");

    // When
    const result = redeemTicket(ticket, {
      staffId,
      redeemedAt: "2026-06-20T10:05:00.000Z",
    });

    // Then
    expect(result).toEqual({
      ok: true,
      value: {
        status: "redeemed",
        ticketId: makeTicketId("ticket-1"),
        storeId: makeStoreId("store-1"),
        issuedAt: "2026-06-20T10:00:00.000Z",
        redeemedAt: "2026-06-20T10:05:00.000Z",
        redeemedBy: staffId,
      },
    });
  });

  it("blocks duplicate redemption when a ticket is already redeemed", () => {
    // Given
    const ticket = createAvailableTicket({
      ticketId: makeTicketId("ticket-2"),
      storeId: makeStoreId("store-1"),
      issuedAt: "2026-06-20T10:00:00.000Z",
    });
    const firstRedemption = redeemTicket(ticket, {
      staffId: makeStaffId("staff-1"),
      redeemedAt: "2026-06-20T10:05:00.000Z",
    });
    const redeemedTicket = firstRedemption.ok === true ? firstRedemption.value : ticket;

    // When
    const result = redeemTicket(redeemedTicket, {
      staffId: makeStaffId("staff-2"),
      redeemedAt: "2026-06-20T10:06:00.000Z",
    });

    // Then
    expect(result).toEqual({
      ok: false,
      error: {
        kind: "duplicate_redemption",
        ticketId: makeTicketId("ticket-2"),
      },
    });
  });

  it("blocks invalid transitions without throwing", () => {
    // Given
    const ticket = createAvailableTicket({
      ticketId: makeTicketId("ticket-3"),
      storeId: makeStoreId("store-1"),
      issuedAt: "2026-06-20T10:00:00.000Z",
    });
    const expired = expireTicket(ticket, {
      expiredAt: "2026-06-20T23:59:59.000Z",
    });
    const expiredTicket = expired.ok === true ? expired.value : ticket;

    // When
    const result = redeemTicket(expiredTicket, {
      staffId: makeStaffId("staff-1"),
      redeemedAt: "2026-06-21T10:05:00.000Z",
    });

    // Then
    expect(result).toEqual({
      ok: false,
      error: {
        kind: "invalid_transition",
        action: "redeem",
        from: "expired",
        ticketId: makeTicketId("ticket-3"),
      },
    });
  });

  it("exposes status values for available redeemed expired and voided tickets", () => {
    // Given
    const baseTicket = createAvailableTicket({
      ticketId: makeTicketId("ticket-4"),
      storeId: makeStoreId("store-1"),
      issuedAt: "2026-06-20T10:00:00.000Z",
    });
    const redeemed = redeemTicket(baseTicket, {
      staffId: makeStaffId("staff-1"),
      redeemedAt: "2026-06-20T10:05:00.000Z",
    });
    const expired = expireTicket(baseTicket, {
      expiredAt: "2026-06-20T23:59:59.000Z",
    });
    const voided = voidTicket(baseTicket, {
      voidedAt: "2026-06-20T10:10:00.000Z",
      reason: "posted in error",
    });

    // When
    const statuses = [
      baseTicket.status,
      redeemed.ok === true ? redeemed.value.status : redeemed.error.kind,
      expired.ok === true ? expired.value.status : expired.error.kind,
      voided.ok === true ? voided.value.status : voided.error.kind,
    ] as const;

    // Then
    expect(statuses).toEqual(["available", "redeemed", "expired", "voided"]);
  });
});
