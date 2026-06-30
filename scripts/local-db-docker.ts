import { spawnSync } from "node:child_process";

const CONTAINER_NAME = "necatech-boilerplate-postgres";
const VOLUME_NAME = "necatech_boilerplate_postgres";
const IMAGE = "postgres:16-alpine";

function runDocker(args: string[]) {
  return spawnSync("docker", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function containerExists() {
  const result = runDocker([
    "container",
    "inspect",
    CONTAINER_NAME,
    "--format",
    "{{.Name}}",
  ]);
  return result.status === 0;
}

function isContainerRunning() {
  const result = runDocker([
    "container",
    "inspect",
    CONTAINER_NAME,
    "--format",
    "{{.State.Running}}",
  ]);
  return result.status === 0 && result.stdout.trim() === "true";
}

function up() {
  if (isContainerRunning()) {
    console.info(`Local DB already running: ${CONTAINER_NAME}`);
    return;
  }

  if (containerExists()) {
    const result = runDocker(["start", CONTAINER_NAME]);
    if (result.status !== 0) fail(result.stderr || "Failed to start local DB");
    console.info(`Local DB started: ${CONTAINER_NAME}`);
    return;
  }

  const result = runDocker([
    "run",
    "-d",
    "--name",
    CONTAINER_NAME,
    "-e",
    "POSTGRES_DB=necatech_boilerplate",
    "-e",
    "POSTGRES_USER=necatech",
    "-e",
    "POSTGRES_PASSWORD=necatech_local_password",
    "-p",
    "54329:5432",
    "-v",
    `${VOLUME_NAME}:/var/lib/postgresql/data`,
    IMAGE,
  ]);

  if (result.status !== 0) fail(result.stderr || "Failed to create local DB");
  console.info(`Local DB created: ${CONTAINER_NAME}`);
}

function down() {
  if (!containerExists()) {
    console.info(`Local DB container not found: ${CONTAINER_NAME}`);
    return;
  }

  if (!isContainerRunning()) {
    console.info(`Local DB already stopped: ${CONTAINER_NAME}`);
    return;
  }

  const result = runDocker(["stop", CONTAINER_NAME]);
  if (result.status !== 0) fail(result.stderr || "Failed to stop local DB");
  console.info(`Local DB stopped: ${CONTAINER_NAME}`);
}

const command = process.argv[2];
if (command === "up") {
  up();
} else if (command === "down") {
  down();
} else {
  fail("Usage: tsx scripts/local-db-docker.ts <up|down>");
}
