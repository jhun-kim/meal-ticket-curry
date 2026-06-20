export type TicketId = Readonly<{
  kind: "ticket";
  value: string;
}>;

export type StoreId = Readonly<{
  kind: "store";
  value: string;
}>;

export type StaffId = Readonly<{
  kind: "staff";
  value: string;
}>;

export type AvailableTicket = Readonly<{
  status: "available";
  ticketId: TicketId;
  storeId: StoreId;
  issuedAt: string;
}>;

export type RedeemedTicket = Readonly<{
  status: "redeemed";
  ticketId: TicketId;
  storeId: StoreId;
  issuedAt: string;
  redeemedAt: string;
  redeemedBy: StaffId;
}>;

export type ExpiredTicket = Readonly<{
  status: "expired";
  ticketId: TicketId;
  storeId: StoreId;
  issuedAt: string;
  expiredAt: string;
}>;

export type VoidedTicket = Readonly<{
  status: "voided";
  ticketId: TicketId;
  storeId: StoreId;
  issuedAt: string;
  voidedAt: string;
  voidedFrom: VoidableTicketStatus;
  reason: string;
}>;

export type MealTicket = AvailableTicket | RedeemedTicket | ExpiredTicket | VoidedTicket;

export type TicketStatus = MealTicket["status"];

export type VoidableTicketStatus = Exclude<TicketStatus, "voided">;

export type TicketAction = "redeem" | "expire" | "void";

export type TicketTransitionFailure =
  | Readonly<{
      kind: "duplicate_redemption";
      ticketId: TicketId;
    }>
  | Readonly<{
      kind: "invalid_transition";
      action: TicketAction;
      from: TicketStatus;
      ticketId: TicketId;
    }>;

export type Result<TValue, TError> =
  | Readonly<{ ok: true; value: TValue }>
  | Readonly<{ ok: false; error: TError }>;

export type CreateAvailableTicketInput = Readonly<{
  ticketId: TicketId;
  storeId: StoreId;
  issuedAt: string;
}>;

export type RedeemTicketInput = Readonly<{
  staffId: StaffId;
  redeemedAt: string;
}>;

export type ExpireTicketInput = Readonly<{
  expiredAt: string;
}>;

export type VoidTicketInput = Readonly<{
  voidedAt: string;
  reason: string;
}>;

export function makeTicketId(value: string): TicketId {
  return { kind: "ticket", value };
}

export function makeStoreId(value: string): StoreId {
  return { kind: "store", value };
}

export function makeStaffId(value: string): StaffId {
  return { kind: "staff", value };
}

export function createAvailableTicket(input: CreateAvailableTicketInput): AvailableTicket {
  return {
    status: "available",
    ticketId: input.ticketId,
    storeId: input.storeId,
    issuedAt: input.issuedAt,
  };
}

export function redeemTicket(
  ticket: MealTicket,
  input: RedeemTicketInput,
): Result<RedeemedTicket, TicketTransitionFailure> {
  switch (ticket.status) {
    case "available":
      return ok({
        status: "redeemed",
        ticketId: ticket.ticketId,
        storeId: ticket.storeId,
        issuedAt: ticket.issuedAt,
        redeemedAt: input.redeemedAt,
        redeemedBy: input.staffId,
      });
    case "redeemed":
      return err({
        kind: "duplicate_redemption",
        ticketId: ticket.ticketId,
      });
    case "expired":
    case "voided":
      return invalidTransition("redeem", ticket);
    default:
      return assertNever(ticket);
  }
}

export function expireTicket(
  ticket: MealTicket,
  input: ExpireTicketInput,
): Result<ExpiredTicket, TicketTransitionFailure> {
  switch (ticket.status) {
    case "available":
      return ok({
        status: "expired",
        ticketId: ticket.ticketId,
        storeId: ticket.storeId,
        issuedAt: ticket.issuedAt,
        expiredAt: input.expiredAt,
      });
    case "redeemed":
    case "expired":
    case "voided":
      return invalidTransition("expire", ticket);
    default:
      return assertNever(ticket);
  }
}

export function voidTicket(
  ticket: MealTicket,
  input: VoidTicketInput,
): Result<VoidedTicket, TicketTransitionFailure> {
  switch (ticket.status) {
    case "available":
    case "redeemed":
    case "expired":
      return ok({
        status: "voided",
        ticketId: ticket.ticketId,
        storeId: ticket.storeId,
        issuedAt: ticket.issuedAt,
        voidedAt: input.voidedAt,
        voidedFrom: ticket.status,
        reason: input.reason,
      });
    case "voided":
      return invalidTransition("void", ticket);
    default:
      return assertNever(ticket);
  }
}

function ok<TValue>(value: TValue): Result<TValue, never> {
  return { ok: true, value };
}

function err<TError>(error: TError): Result<never, TError> {
  return { ok: false, error };
}

function invalidTransition(
  action: TicketAction,
  ticket: MealTicket,
): Result<never, TicketTransitionFailure> {
  return err({
    kind: "invalid_transition",
    action,
    from: ticket.status,
    ticketId: ticket.ticketId,
  });
}

function assertNever(value: never): never {
  throw new Error(`Unhandled ticket state: ${JSON.stringify(value)}`);
}
