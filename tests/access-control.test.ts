import { describe, expect, it } from "vitest";
import { ACCESS_ROLES, type AccessRequest, canAccessResource } from "../src/domain/access-control";

describe("access-control contracts", () => {
  it("denies store staff access to another store's private resources", () => {
    // Given
    const request: AccessRequest = {
      actor: { role: "store_staff", storeId: "store-a" },
      action: "manage",
      resource: { kind: "meal_ticket", storeId: "store-b" },
    };

    // When
    const decision = canAccessResource(request);

    // Then
    expect(decision).toEqual({ kind: "denied", reason: "store_scope_mismatch" });
  });

  it("allows store staff access to their own store resources", () => {
    // Given
    const request: AccessRequest = {
      actor: { role: "store_staff", storeId: "store-a" },
      action: "manage",
      resource: { kind: "redemption", storeId: "store-a" },
    };

    // When
    const decision = canAccessResource(request);

    // Then
    expect(decision).toEqual({ kind: "allowed" });
  });

  it("limits store staff donations access to read-only own-store records", () => {
    // Given
    const readRequest: AccessRequest = {
      actor: { role: "store_staff", storeId: "store-a" },
      action: "read",
      resource: { kind: "donation", storeId: "store-a" },
    };
    const manageRequest: AccessRequest = {
      actor: { role: "store_staff", storeId: "store-a" },
      action: "manage",
      resource: { kind: "donation", storeId: "store-a" },
    };

    // When
    const readDecision = canAccessResource(readRequest);
    const manageDecision = canAccessResource(manageRequest);

    // Then
    expect(readDecision).toEqual({ kind: "allowed" });
    expect(manageDecision).toEqual({ kind: "denied", reason: "donations_read_only" });
  });

  it("allows operators to access private resources across stores", () => {
    // Given
    const request: AccessRequest = {
      actor: { role: "operator" },
      action: "manage",
      resource: { kind: "settlement_report", storeId: "store-b" },
    };

    // When
    const decision = canAccessResource(request);

    // Then
    expect(decision).toEqual({ kind: "allowed" });
  });

  it("denies public access to private resources", () => {
    // Given
    const request: AccessRequest = {
      actor: { role: "public" },
      action: "read",
      resource: { kind: "donation", storeId: "store-a" },
    };

    // When
    const decision = canAccessResource(request);

    // Then
    expect(decision).toEqual({ kind: "denied", reason: "private_resource" });
  });

  it("allows store staff to read their own profile contract only", () => {
    // Given
    const ownProfileRequest: AccessRequest = {
      actor: { role: "store_staff", storeId: "store-a" },
      action: "read",
      resource: { kind: "profile", profileOwner: { role: "store_staff", storeId: "store-a" } },
    };
    const otherProfileRequest: AccessRequest = {
      actor: { role: "store_staff", storeId: "store-a" },
      action: "read",
      resource: { kind: "profile", profileOwner: { role: "store_staff", storeId: "store-b" } },
    };

    // When
    const ownProfileDecision = canAccessResource(ownProfileRequest);
    const otherProfileDecision = canAccessResource(otherProfileRequest);

    // Then
    expect(ownProfileDecision).toEqual({ kind: "allowed" });
    expect(otherProfileDecision).toEqual({ kind: "denied", reason: "admin_only" });
  });

  it("allows public read access to public board and store resources", () => {
    // Given
    const requests: readonly AccessRequest[] = [
      {
        actor: { role: "public" },
        action: "read",
        resource: { kind: "public_board" },
      },
      {
        actor: { role: "public" },
        action: "read",
        resource: { kind: "public_store" },
      },
    ];

    // When
    const decisions = requests.map((request) => canAccessResource(request));

    // Then
    expect(decisions).toEqual([{ kind: "allowed" }, { kind: "allowed" }]);
  });

  it("does not represent child or guardian identity roles", () => {
    // Given
    const roles = ACCESS_ROLES;
    const prohibitedIdentityRoles: ReadonlySet<string> = new Set(["child", "guardian"]);

    // When
    const identityRoles = roles.filter((role) => prohibitedIdentityRoles.has(role));

    // Then
    expect(identityRoles).toEqual([]);
  });
});
