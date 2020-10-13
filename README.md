## How to use this repos

Update `data/transactions.json` with the following command:

```bash
npx ts-node scripts/record.ts
```

The following command extracts the transactions that need to be executed:

```bash
npx ts-node scripts/compute.ts
npx ts-node scripts/dry.ts
```

Execute the transaction with the following command:

```bash
npx ts-node scripts/write.ts
```
