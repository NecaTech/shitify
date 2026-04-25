import "dotenv/config";

async function main() {
  console.log("Seeding database…");
  // Example: await db.insert(users).values([...]);
  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
