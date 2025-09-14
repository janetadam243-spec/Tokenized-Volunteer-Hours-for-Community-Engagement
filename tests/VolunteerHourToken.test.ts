import { describe, it, expect, beforeEach } from "vitest";
import { stringUtf8CV, uintCV, principalCV } from "@stacks/transactions";

interface ClarityResponse<T> {
  ok: boolean;
  value: T;
}

interface TokenMetadata {
  hours: number;
  eventId: number;
  description: string;
  mintedAt: number;
  minter: string;
}

class VolunteerHourTokenMock {
  state: {
    tokenIdCounter: number;
    totalSupply: number;
    authorizedMinter: string | null;
    maxTokensPerMint: number;
    mintFee: number;
    transferEnabled: boolean;
    burnEnabled: boolean;
    tokenMetadata: Map<number, TokenMetadata>;
    eventMintLimits: Map<number, number>;
    userMintHistory: Map<string, number>;
  } = {
    tokenIdCounter: 0,
    totalSupply: 0,
    authorizedMinter: null,
    maxTokensPerMint: 100,
    mintFee: 500,
    transferEnabled: true,
    burnEnabled: true,
    tokenMetadata: new Map(),
    eventMintLimits: new Map(),
    userMintHistory: new Map(),
  };
  blockHeight: number = 0;
  caller: string = "ST1TEST";
  contractCaller: string = "ST1CONTRACT";
  stxTransfers: Array<{ amount: number; from: string; to: string }> = [];
  nftOwners: Map<number, string> = new Map();

  constructor() {
    this.reset();
  }

  reset() {
    this.state = {
      tokenIdCounter: 0,
      totalSupply: 0,
      authorizedMinter: null,
      maxTokensPerMint: 100,
      mintFee: 500,
      transferEnabled: true,
      burnEnabled: true,
      tokenMetadata: new Map(),
      eventMintLimits: new Map(),
      userMintHistory: new Map(),
    };
    this.blockHeight = 0;
    this.caller = "ST1TEST";
    this.contractCaller = "ST1CONTRACT";
    this.stxTransfers = [];
    this.nftOwners = new Map();
  }

  getTokenMetadata(tokenId: number): ClarityResponse<TokenMetadata | null> {
    return { ok: true, value: this.state.tokenMetadata.get(tokenId) || null };
  }

  getTokenOwner(tokenId: number): ClarityResponse<string | null> {
    return { ok: true, value: this.nftOwners.get(tokenId) || null };
  }

  getTotalSupply(): ClarityResponse<number> {
    return { ok: true, value: this.state.totalSupply };
  }

  getMintFee(): ClarityResponse<number> {
    return { ok: true, value: this.state.mintFee };
  }

  getMaxTokensPerMint(): ClarityResponse<number> {
    return { ok: true, value: this.state.maxTokensPerMint };
  }

  isTransferEnabled(): ClarityResponse<boolean> {
    return { ok: true, value: this.state.transferEnabled };
  }

  isBurnEnabled(): ClarityResponse<boolean> {
    return { ok: true, value: this.state.burnEnabled };
  }

  getAuthorizedMinter(): ClarityResponse<string | null> {
    return { ok: true, value: this.state.authorizedMinter };
  }

  getEventMintLimit(eventId: number): ClarityResponse<number> {
    return { ok: true, value: this.state.eventMintLimits.get(eventId) || 0 };
  }

  getUserMintCount(user: string): ClarityResponse<number> {
    return { ok: true, value: this.state.userMintHistory.get(user) || 0 };
  }

  setAuthorizedMinter(minter: string): ClarityResponse<boolean> {
    if (this.caller !== this.contractCaller) return { ok: false, value: false };
    if (this.state.authorizedMinter !== null) return { ok: false, value: false };
    this.state.authorizedMinter = minter;
    return { ok: true, value: true };
  }

  setMintFee(newFee: number): ClarityResponse<boolean> {
    if (this.caller !== this.state.authorizedMinter) return { ok: false, value: false };
    if (newFee <= 0) return { ok: false, value: false };
    this.state.mintFee = newFee;
    return { ok: true, value: true };
  }

  setMaxTokensPerMint(newMax: number): ClarityResponse<boolean> {
    if (this.caller !== this.state.authorizedMinter) return { ok: false, value: false };
    if (newMax <= 0) return { ok: false, value: false };
    this.state.maxTokensPerMint = newMax;
    return { ok: true, value: true };
  }

  toggleTransferEnabled(): ClarityResponse<boolean> {
    if (this.caller !== this.state.authorizedMinter) return { ok: false, value: false };
    this.state.transferEnabled = !this.state.transferEnabled;
    return { ok: true, value: this.state.transferEnabled };
  }

  toggleBurnEnabled(): ClarityResponse<boolean> {
    if (this.caller !== this.state.authorizedMinter) return { ok: false, value: false };
    this.state.burnEnabled = !this.state.burnEnabled;
    return { ok: true, value: this.state.burnEnabled };
  }

  setEventMintLimit(eventId: number, limit: number): ClarityResponse<boolean> {
    if (this.caller !== this.state.authorizedMinter) return { ok: false, value: false };
    if (limit <= 0) return { ok: false, value: false };
    this.state.eventMintLimits.set(eventId, limit);
    return { ok: true, value: true };
  }

  mintToken(recipient: string, hours: number, eventId: number, description: string): ClarityResponse<number> {
    if (this.state.authorizedMinter === null) return { ok: false, value: 120 };
    if (this.caller !== this.state.authorizedMinter) return { ok: false, value: 100 };
    if (hours <= 0) return { ok: false, value: 101 };
    if (eventId <= 0) return { ok: false, value: 106 };
    if (description.length > 256) return { ok: false, value: 107 };
    if (recipient === this.caller) return { ok: false, value: 105 };
    const eventLimit = this.state.eventMintLimits.get(eventId) || 0;
    if (eventLimit > 0 && hours > eventLimit) return { ok: false, value: 108 };
    this.stxTransfers.push({ amount: this.state.mintFee, from: this.caller, to: this.state.authorizedMinter });
    const tokenId = this.state.tokenIdCounter;
    this.nftOwners.set(tokenId, recipient);
    this.state.tokenMetadata.set(tokenId, { hours, eventId, description, mintedAt: this.blockHeight, minter: this.caller });
    this.state.tokenIdCounter++;
    this.state.totalSupply++;
    const currentCount = this.state.userMintHistory.get(recipient) || 0;
    this.state.userMintHistory.set(recipient, currentCount + 1);
    return { ok: true, value: tokenId };
  }

  transferToken(tokenId: number, recipient: string): ClarityResponse<boolean> {
    if (!this.state.transferEnabled) return { ok: false, value: false };
    const owner = this.nftOwners.get(tokenId);
    if (!owner) return { ok: false, value: false };
    if (this.caller !== owner) return { ok: false, value: false };
    this.nftOwners.set(tokenId, recipient);
    return { ok: true, value: true };
  }

  burnToken(tokenId: number): ClarityResponse<boolean> {
    if (!this.state.burnEnabled) return { ok: false, value: false };
    const owner = this.nftOwners.get(tokenId);
    if (!owner) return { ok: false, value: false };
    if (this.caller !== owner) return { ok: false, value: false };
    this.nftOwners.delete(tokenId);
    this.state.tokenMetadata.delete(tokenId);
    this.state.totalSupply--;
    return { ok: true, value: true };
  }

  updateTokenDescription(tokenId: number, newDesc: string): ClarityResponse<boolean> {
    const metadata = this.state.tokenMetadata.get(tokenId);
    if (!metadata) return { ok: false, value: false };
    if (this.caller !== metadata.minter) return { ok: false, value: false };
    if (newDesc.length > 256) return { ok: false, value: false };
    this.state.tokenMetadata.set(tokenId, { ...metadata, description: newDesc });
    return { ok: true, value: true };
  }
}

describe("VolunteerHourToken", () => {
  let contract: VolunteerHourTokenMock;

  beforeEach(() => {
    contract = new VolunteerHourTokenMock();
    contract.reset();
  });

  it("sets authorized minter successfully", () => {
    contract.caller = contract.contractCaller;
    const result = contract.setAuthorizedMinter("ST2MINTER");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    expect(contract.state.authorizedMinter).toBe("ST2MINTER");
  });

  it("rejects setting minter if already set", () => {
    contract.caller = contract.contractCaller;
    contract.setAuthorizedMinter("ST2MINTER");
    const result = contract.setAuthorizedMinter("ST3MINTER");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(false);
  });

  it("mints token successfully", () => {
    contract.caller = contract.contractCaller;
    contract.setAuthorizedMinter("ST2MINTER");
    contract.caller = "ST2MINTER";
    contract.setEventMintLimit(1, 10);
    const result = contract.mintToken("ST3RECIPIENT", 5, 1, "Volunteer work");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(0);
    const metadata = contract.getTokenMetadata(0).value;
    expect(metadata?.hours).toBe(5);
    expect(metadata?.eventId).toBe(1);
    expect(metadata?.description).toBe("Volunteer work");
    expect(contract.getTokenOwner(0).value).toBe("ST3RECIPIENT");
    expect(contract.getTotalSupply().value).toBe(1);
    expect(contract.stxTransfers).toEqual([{ amount: 500, from: "ST2MINTER", to: "ST2MINTER" }]);
  });

  it("rejects mint without authorized minter", () => {
    const result = contract.mintToken("ST3RECIPIENT", 5, 1, "Volunteer work");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(120);
  });

  it("rejects mint with invalid hours", () => {
    contract.caller = contract.contractCaller;
    contract.setAuthorizedMinter("ST2MINTER");
    contract.caller = "ST2MINTER";
    const result = contract.mintToken("ST3RECIPIENT", 0, 1, "Volunteer work");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(101);
  });

  it("transfers token successfully", () => {
    contract.caller = contract.contractCaller;
    contract.setAuthorizedMinter("ST2MINTER");
    contract.caller = "ST2MINTER";
    contract.mintToken("ST3RECIPIENT", 5, 1, "Volunteer work");
    contract.caller = "ST3RECIPIENT";
    const result = contract.transferToken(0, "ST4NEW");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    expect(contract.getTokenOwner(0).value).toBe("ST4NEW");
  });

  it("rejects transfer if not enabled", () => {
    contract.caller = contract.contractCaller;
    contract.setAuthorizedMinter("ST2MINTER");
    contract.caller = "ST2MINTER";
    contract.mintToken("ST3RECIPIENT", 5, 1, "Volunteer work");
    contract.toggleTransferEnabled();
    contract.caller = "ST3RECIPIENT";
    const result = contract.transferToken(0, "ST4NEW");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(false);
  });

  it("burns token successfully", () => {
    contract.caller = contract.contractCaller;
    contract.setAuthorizedMinter("ST2MINTER");
    contract.caller = "ST2MINTER";
    contract.mintToken("ST3RECIPIENT", 5, 1, "Volunteer work");
    contract.caller = "ST3RECIPIENT";
    const result = contract.burnToken(0);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    expect(contract.getTokenOwner(0).value).toBe(null);
    expect(contract.getTotalSupply().value).toBe(0);
  });

  it("rejects burn if not enabled", () => {
    contract.caller = contract.contractCaller;
    contract.setAuthorizedMinter("ST2MINTER");
    contract.caller = "ST2MINTER";
    contract.mintToken("ST3RECIPIENT", 5, 1, "Volunteer work");
    contract.toggleBurnEnabled();
    contract.caller = "ST3RECIPIENT";
    const result = contract.burnToken(0);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(false);
  });

  it("updates token description successfully", () => {
    contract.caller = contract.contractCaller;
    contract.setAuthorizedMinter("ST2MINTER");
    contract.caller = "ST2MINTER";
    contract.mintToken("ST3RECIPIENT", 5, 1, "Old desc");
    contract.caller = "ST2MINTER";
    const result = contract.updateTokenDescription(0, "New desc");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    const metadata = contract.getTokenMetadata(0).value;
    expect(metadata?.description).toBe("New desc");
  });

  it("rejects update description by non-minter", () => {
    contract.caller = contract.contractCaller;
    contract.setAuthorizedMinter("ST2MINTER");
    contract.caller = "ST2MINTER";
    contract.mintToken("ST3RECIPIENT", 5, 1, "Old desc");
    contract.caller = "ST3RECIPIENT";
    const result = contract.updateTokenDescription(0, "New desc");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(false);
  });

  it("sets mint fee successfully", () => {
    contract.caller = contract.contractCaller;
    contract.setAuthorizedMinter("ST2MINTER");
    contract.caller = "ST2MINTER";
    const result = contract.setMintFee(1000);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    expect(contract.state.mintFee).toBe(1000);
  });

  it("rejects invalid mint fee", () => {
    contract.caller = contract.contractCaller;
    contract.setAuthorizedMinter("ST2MINTER");
    contract.caller = "ST2MINTER";
    const result = contract.setMintFee(0);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(false);
  });

  it("sets event mint limit successfully", () => {
    contract.caller = contract.contractCaller;
    contract.setAuthorizedMinter("ST2MINTER");
    contract.caller = "ST2MINTER";
    const result = contract.setEventMintLimit(1, 20);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    expect(contract.getEventMintLimit(1).value).toBe(20);
  });

  it("rejects mint exceeding event limit", () => {
    contract.caller = contract.contractCaller;
    contract.setAuthorizedMinter("ST2MINTER");
    contract.caller = "ST2MINTER";
    contract.setEventMintLimit(1, 10);
    const result = contract.mintToken("ST3RECIPIENT", 15, 1, "Volunteer work");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(108);
  });

  it("gets user mint count correctly", () => {
    contract.caller = contract.contractCaller;
    contract.setAuthorizedMinter("ST2MINTER");
    contract.caller = "ST2MINTER";
    contract.mintToken("ST3RECIPIENT", 5, 1, "Work1");
    contract.mintToken("ST3RECIPIENT", 3, 2, "Work2");
    const result = contract.getUserMintCount("ST3RECIPIENT");
    expect(result.value).toBe(2);
  });

  it("parses Clarity values", () => {
    const desc = stringUtf8CV("Test desc");
    const hours = uintCV(5);
    const principal = principalCV("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM");
    expect(desc.value).toBe("Test desc");
    expect(hours.value).toEqual(BigInt(5));
    expect(principal.value).toBe("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM");
  });
});