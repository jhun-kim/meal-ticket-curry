export const ACCESS_ROLES = ["public", "store_staff", "operator"] as const;

export type AccessRole = (typeof ACCESS_ROLES)[number];

export type AccessAction = "read" | "manage";

export type Actor =
  | {
      readonly role: "public";
    }
  | {
      readonly role: "store_staff";
      readonly storeId: string;
    }
  | {
      readonly role: "operator";
    };

export type PublicResource =
  | {
      readonly kind: "public_board";
    }
  | {
      readonly kind: "public_store";
    };

export type StoreScopedResource =
  | {
      readonly kind: "donation";
      readonly storeId: string;
    }
  | {
      readonly kind: "meal_ticket";
      readonly storeId: string;
    }
  | {
      readonly kind: "redemption";
      readonly storeId: string;
    }
  | {
      readonly kind: "settlement_report";
      readonly storeId: string;
    };

export type AdminResource =
  | {
      readonly kind: "audit_log";
    }
  | {
      readonly kind: "feedback_event";
    };

export type ProfileResource = {
  readonly kind: "profile";
  readonly profileOwner:
    | {
        readonly role: "store_staff";
        readonly storeId: string;
      }
    | {
        readonly role: "operator";
      };
};

export type AccessResource = PublicResource | StoreScopedResource | AdminResource | ProfileResource;

export type AccessRequest = {
  readonly actor: Actor;
  readonly action: AccessAction;
  readonly resource: AccessResource;
};

export type AccessDecision =
  | {
      readonly kind: "allowed";
    }
  | {
      readonly kind: "denied";
      readonly reason:
        | "admin_only"
        | "donations_read_only"
        | "manage_requires_staff"
        | "private_resource"
        | "store_scope_mismatch";
    };

export class AccessControlContractError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "AccessControlContractError";
  }
}

export function canAccessResource(request: AccessRequest): AccessDecision {
  switch (request.actor.role) {
    case "operator":
      return { kind: "allowed" };
    case "store_staff":
      return decideStoreStaffAccess(request.actor, request.action, request.resource);
    case "public":
      return decidePublicAccess(request.action, request.resource);
    default:
      return assertNever(request.actor);
  }
}

function decideStoreStaffAccess(
  actor: Extract<Actor, { readonly role: "store_staff" }>,
  action: AccessAction,
  resource: AccessResource,
): AccessDecision {
  switch (resource.kind) {
    case "public_board":
    case "public_store":
      return action === "read" ? { kind: "allowed" } : deny("manage_requires_staff");
    case "donation":
      if (action === "manage") {
        return deny("donations_read_only");
      }
      return actor.storeId === resource.storeId
        ? { kind: "allowed" }
        : deny("store_scope_mismatch");
    case "meal_ticket":
    case "redemption":
    case "settlement_report":
      return actor.storeId === resource.storeId
        ? { kind: "allowed" }
        : deny("store_scope_mismatch");
    case "audit_log":
    case "feedback_event":
      return deny("admin_only");
    case "profile":
      return resource.profileOwner.role === "store_staff" &&
        resource.profileOwner.storeId === actor.storeId &&
        action === "read"
        ? { kind: "allowed" }
        : deny("admin_only");
    default:
      return assertNever(resource);
  }
}

function decidePublicAccess(action: AccessAction, resource: AccessResource): AccessDecision {
  switch (resource.kind) {
    case "public_board":
    case "public_store":
      return action === "read" ? { kind: "allowed" } : deny("manage_requires_staff");
    case "donation":
    case "meal_ticket":
    case "redemption":
    case "settlement_report":
      return deny("private_resource");
    case "audit_log":
    case "feedback_event":
    case "profile":
      return deny("admin_only");
    default:
      return assertNever(resource);
  }
}

function deny(
  reason: Extract<AccessDecision, { readonly kind: "denied" }>["reason"],
): AccessDecision {
  return { kind: "denied", reason };
}

function assertNever(value: never): never {
  throw new AccessControlContractError(`Unhandled access-control variant: ${String(value)}`);
}
