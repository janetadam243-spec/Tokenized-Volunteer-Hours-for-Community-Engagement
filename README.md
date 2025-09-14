# 🌟 Tokenized Volunteer Hours for Community Engagement

Welcome to a decentralized platform that transforms how communities reward volunteer efforts! Using the Stacks blockchain and Clarity smart contracts, this project allows volunteers to earn tokenized hours for their contributions, which can be redeemed for community perks like discounts, event tickets, or exclusive benefits.

## ✨ Features
- 🕒 **Track Volunteer Hours**: Log volunteer hours securely on the blockchain.
- 🎟 **Tokenized Rewards**: Mint non-fungible tokens (NFTs) representing volunteer hours.
- 💸 **Redeem Perks**: Exchange tokens for community perks with participating partners.
- 🔍 **Transparent Verification**: Verify volunteer contributions and perk redemptions publicly.
- 🛡️ **Immutable Records**: Ensure tamper-proof records of volunteer activities.
- 🤝 **Community Governance**: Allow community members to propose and vote on new perks.

## 🛠 How It Works

### For Volunteers
1. **Log Hours**: Submit volunteer activity details (e.g., event ID, hours worked) to the platform.
2. **Mint Tokens**: Receive a unique Volunteer Hour Token (VHT) as proof of contribution.
3. **Redeem Perks**: Use VHTs to claim perks from partnered local businesses or community programs.
4. **Track Contributions**: View your volunteer history and token balance on the blockchain.

### For Community Organizers
1. **Register Events**: Create volunteer events with unique IDs and descriptions.
2. **Validate Hours**: Approve or reject submitted volunteer hours.
3. **Manage Perks**: Partner with businesses to offer perks and track redemptions.

### For Verifiers
1. **Check Contributions**: Query the blockchain to verify volunteer hours and token ownership.
2. **Audit Perks**: Confirm the legitimacy of perk redemptions.

## 📜 Smart Contracts
This project uses 8 Clarity smart contracts to power the system:

1. **VolunteerRegistry**: Manages volunteer profiles and their total hours.
2. **EventRegistry**: Stores details of volunteer events (e.g., event ID, organizer, description).
3. **HourSubmission**: Handles submission and validation of volunteer hours.
4. **VolunteerHourToken**: Implements an NFT standard for tokenized volunteer hours (VHTs).
5. **PerkRegistry**: Maintains a list of available perks and their token costs.
6. **PerkRedemption**: Manages the redemption of VHTs for perks.
7. **CommunityGovernance**: Enables community voting for new perks or system changes.
8. **AuditLog**: Tracks all actions (submissions, approvals, redemptions) for transparency.

### Example Workflow
- A volunteer works 5 hours at a community cleanup event.
- They submit their hours via `HourSubmission`, including the event ID and proof (e.g., a signed confirmation from the organizer).
- The organizer validates the submission, triggering `VolunteerHourToken` to mint 5 VHTs to the volunteer's address.
- The volunteer uses their VHTs via `PerkRedemption` to claim a discount at a local café listed in `PerkRegistry`.
- All actions are logged in `AuditLog` for transparency.

## 🚀 Getting Started
1. **Clone the Repo**: `git clone <repo-url>`
2. **Install Dependencies**: Ensure you have the Clarity development environment set up (e.g., Clarinet).
3. **Deploy Contracts**: Use Clarinet to deploy the contracts to a Stacks testnet.
4. **Interact**: Use the provided frontend or Clarity console to log hours, mint tokens, and redeem perks.

## 🛠 Smart Contract Details

### 1. VolunteerRegistry
- **Purpose**: Stores volunteer profiles and tracks total hours.
- **Functions**:
  - `register-volunteer`: Registers a new volunteer with their principal and profile data.
  - `get-volunteer-details`: Retrieves volunteer info (e.g., total hours, token balance).
  - `update-hours`: Updates total hours after validated submissions.

### 2. EventRegistry
- **Purpose**: Manages volunteer event details.
- **Functions**:
  - `create-event`: Registers a new event with ID, organizer, and description.
  - `get-event-details`: Retrieves event metadata.
  - `close-event`: Marks an event as completed.

### 3. HourSubmission
- **Purpose**: Handles submission and validation of volunteer hours.
- **Functions**:
  - `submit-hours`: Volunteers submit hours with event ID and proof.
  - `validate-submission`: Organizers approve or reject submissions.
  - `get-submission-status`: Checks the status of a submission.

### 4. VolunteerHourToken
- **Purpose**: Manages VHTs as NFTs (SIP-009 compliant).
- **Functions**:
  - `mint-token`: Mints a new VHT to a volunteer after validated hours.
  - `transfer-token`: Transfers VHTs between principals (restricted to prevent trading).
  - `get-token-details`: Retrieves token metadata (e.g., hours, event ID).

### 5. PerkRegistry
- **Purpose**: Stores available perks and their token costs.
- **Functions**:
  - `add-perk`: Adds a new perk (e.g., "10% off at Café X" for 3 VHTs).
  - `remove-perk`: Removes expired or invalid perks.
  - `get-perk-details`: Retrieves perk metadata.

### 6. PerkRedemption
- **Purpose**: Manages redemption of VHTs for perks.
- **Functions**:
  - `redeem-perk`: Burns VHTs to claim a perk.
  - `verify-redemption`: Confirms a redemption is valid.
  - `get-redemption-history`: Lists a volunteer’s redeemed perks.

### 7. CommunityGovernance
- **Purpose**: Enables community voting for system changes.
- **Functions**:
  - `propose-perk`: Submits a new perk for community approval.
  - `vote-on-proposal`: Allows volunteers to vote on proposals.
  - `finalize-proposal`: Executes approved proposals (e.g., adds new perks).

### 8. AuditLog
- **Purpose**: Ensures transparency by logging all actions.
- **Functions**:
  - `log-action`: Records actions (e.g., hour submission, token minting, perk redemption).
  - `get-audit-trail`: Retrieves the full action history for auditing.

## 🌍 Real-World Impact
This system incentivizes volunteerism by providing tangible rewards while ensuring transparency and fairness. Communities benefit from increased engagement, local businesses gain foot traffic through perk redemptions, and volunteers are recognized for their contributions in a verifiable, decentralized way.

## 🔮 Future Enhancements
- **Cross-Community Integration**: Allow tokens to be used across multiple communities.
- **Reputation System**: Introduce a reputation score based on volunteer hours.
- **Mobile App**: Build a user-friendly app for submitting hours and redeeming perks.

## 📝 License
MIT License. 