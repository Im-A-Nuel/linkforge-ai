/**
 * LinkForge AI - Set DON-hosted secret (EigenAI key) for Chainlink Functions.
 *
 * Usage:
 *   node set-don-secret.js
 *
 * Reads EIGENAI_API_KEY and PRIVATE_KEY from environment (or smartcontract/.env).
 */

if (!process.env.NODE_BACKEND) process.env.NODE_BACKEND = "js";

const { SecretsManager } = require("@chainlink/functions-toolkit");
// Use ethers v5 bundled by functions-toolkit to match expected signer type.
const ethers = require("@chainlink/functions-toolkit/node_modules/ethers");
const fs = require("fs");
const path = require("path");

function loadEnvFromFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

const envPath = path.join(__dirname, "smartcontract", ".env");
loadEnvFromFile(envPath);

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const rawArgv = process.argv.slice(2);
const keyArgIndex = rawArgv.findIndex((v) => v === "--key" || v === "-k");
const argKey =
  keyArgIndex >= 0 ? rawArgv[keyArgIndex + 1] : rawArgv.find((v) => /^sk-/.test(v));
const EIGENAI_KEY = process.env.EIGENAI_API_KEY || argKey;
const RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
const SLOT_ID = Number(process.env.CHAINLINK_SECRETS_SLOT_ID || 0);
const TTL_MINUTES = Number(process.env.CHAINLINK_SECRETS_TTL_MINUTES || 240);

const DON_ID = "fun-base-sepolia-1";
const FUNCTIONS_ROUTER = "0xf9B8fc078197181C841c296C876945aaa425B278";
const GATEWAY_URLS = [
  "https://01.functions-gateway.testnet.chain.link/",
  "https://02.functions-gateway.testnet.chain.link/",
];

async function main() {
  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not found in env or smartcontract/.env");
  }
  if (!EIGENAI_KEY) {
    throw new Error("EIGENAI_API_KEY not found. Set env var or pass --key <value>.");
  }
  if (!Number.isInteger(SLOT_ID) || SLOT_ID < 0) {
    throw new Error(`Invalid CHAINLINK_SECRETS_SLOT_ID: ${SLOT_ID}`);
  }
  if (!Number.isInteger(TTL_MINUTES) || TTL_MINUTES < 5) {
    throw new Error(`Invalid CHAINLINK_SECRETS_TTL_MINUTES: ${TTL_MINUTES}`);
  }

  console.log("============================================================");
  console.log("LinkForge AI - Upload DON-hosted Secret");
  console.log("============================================================");
  console.log(`Network  : Base Sepolia`);
  console.log(`DON ID   : ${DON_ID}`);
  console.log(`Slot ID  : ${SLOT_ID}`);
  console.log(`TTL      : ${TTL_MINUTES} minutes`);
  console.log(`Key name : eigenaiKey`);
  console.log(`Key      : ${EIGENAI_KEY.slice(0, 12)}...`);
  console.log();

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log(`Signer   : ${wallet.address}`);

  const secretsManager = new SecretsManager({
    signer: wallet,
    functionsRouterAddress: FUNCTIONS_ROUTER,
    donId: DON_ID,
  });

  await secretsManager.initialize();
  console.log("OK: SecretsManager initialized");

  console.log("-> Encrypting secret...");
  const { encryptedSecrets } = await secretsManager.encryptSecrets({
    eigenaiKey: EIGENAI_KEY,
  });
  console.log(`OK: Encrypted (${encryptedSecrets.length} chars)`);

  console.log(`-> Uploading to DON slot ${SLOT_ID} (TTL ${TTL_MINUTES} min)...`);
  const result = await secretsManager.uploadEncryptedSecretsToDON({
    encryptedSecretsHexstring: encryptedSecrets,
    gatewayUrls: GATEWAY_URLS,
    slotId: SLOT_ID,
    minutesUntilExpiration: TTL_MINUTES,
  });

  console.log("============================================================");
  console.log("Secret uploaded.");
  console.log("============================================================");
  console.log(`slotId  : ${SLOT_ID}`);
  console.log(`version : ${result.version ?? "(not returned)"}`);
  console.log(`success : ${result.success}`);
}

main().catch((error) => {
  console.error("ERROR:", error?.message || error);
  process.exit(1);
});
