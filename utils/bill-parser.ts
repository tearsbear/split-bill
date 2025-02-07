import type { Bill, Item, AdditionalCharge } from "@/types/bill";

function parseAmount(amount: string): number {
  // Remove 'Rp', '@', '-', and any thousand separators, then convert to number
  return Number.parseInt(amount.replace(/[Rp@.,\-]/g, ""));
}

export function parseExtractedText(text: string): Bill {
  const items: Item[] = [];
  const additionalCharges: AdditionalCharge[] = [];
  let id = 1;
  let isParsingFees = false;

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip header and greeting lines
    if (
      line.toLowerCase().includes("hai") ||
      line.toLowerCase().includes("makasih udah pakai") ||
      line.toLowerCase().includes("total dibayar") ||
      line.toLowerCase().includes("transaction details") ||
      line.toLowerCase().includes("rincian transaksi") ||
      line.toLowerCase().includes("paid with") ||
      line.toLowerCase().includes("bayar pakai")
    ) {
      continue;
    }

    // Check if we've reached the totals section
    if (
      line.toLowerCase().includes("pasal harga") ||
      line.toLowerCase().includes("total price")
    ) {
      isParsingFees = true;
      continue;
    }

    if (isParsingFees) {
      // Handle fees and discounts section
      if (
        line.toLowerCase().includes("biaya penanganan") ||
        line.toLowerCase().includes("biaya lainnya") ||
        line.toLowerCase().includes("handling and delivery fee")
      ) {
        const amount = line.match(/Rp([\d.,]+)/)?.[1];
        if (amount) {
          // Keep the original fee name for Indonesian version
          const feeName = line.toLowerCase().includes("biaya")
            ? line.split("Rp")[0].trim()
            : "Handling and Delivery Fee";
          additionalCharges.push({
            name: feeName,
            amount: parseAmount(amount),
          });
        }
      } else if (
        line.toLowerCase().includes("diskon") ||
        line.toLowerCase().includes("discount")
      ) {
        const amount = line.match(/[-]?Rp([\d.,]+)/)?.[1];
        if (amount) {
          additionalCharges.push({
            name: "Discount",
            amount: -parseAmount(amount),
          });
        }
      }
      continue;
    }

    // Match item pattern
    const itemMatch = line.match(/^(\d+)\s+(.+?)\s+@Rp([\d.,]+)/);
    if (itemMatch) {
      const [, quantity, name, price] = itemMatch;
      const priceNum = parseAmount(price);
      const quantityNum = parseInt(quantity);

      // Look ahead for additional item description
      let fullName = name;
      if (
        i + 1 < lines.length &&
        !lines[i + 1].match(/^\d+\s+|@Rp|Rp|Total|Handling|Discount/i) &&
        !lines[i + 1].toLowerCase().includes("cutlery") &&
        !lines[i + 1].toLowerCase().includes("straws") &&
        !lines[i + 1].toLowerCase().includes("tanpa alat")
      ) {
        fullName += " " + lines[i + 1].trim();
        i++;
      }

      // Clean up item name by removing waste message if it got included
      fullName = fullName.replace(/No cutlery\/straws.+waste!?/i, "").trim();
      fullName = fullName
        .replace(/Tanpa alat makan\/sedotan.+sekali!?/i, "")
        .trim();

      items.push({
        id: id.toString(),
        name: fullName,
        quantity: quantityNum,
        price: priceNum,
        totalPrice: priceNum * quantityNum,
      });
      id++;
    }
  }

  const totalBeforeCharges = items.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );
  const totalCharges = additionalCharges.reduce(
    (sum, charge) => sum + charge.amount,
    0
  );

  return {
    items,
    additionalCharges,
    totalBeforeCharges,
    totalAfterCharges: totalBeforeCharges + totalCharges,
  };
}
