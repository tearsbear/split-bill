import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import type { Item, Friend, AdditionalCharge } from "@/types/bill";
import { motion } from "framer-motion";

interface BillSummaryProps {
  friends: Friend[];
  items: Item[];
  additionalCharges: AdditionalCharge[];
  onEdit: () => void;
  onSave: () => void;
}

export default function BillSummary({
  friends,
  items,
  additionalCharges,
  onEdit,
  onSave,
}: BillSummaryProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateSubtotal = (friendItems: Friend["items"]) => {
    return friendItems.reduce((total, friendItem) => {
      const item = items.find((i) => i.id === friendItem.itemId);
      return total + (item ? item.price * friendItem.quantity : 0);
    }, 0);
  };

  const totalCharges = additionalCharges.reduce(
    (sum, charge) => sum + charge.amount,
    0
  );
  const activeUsers = friends.filter(
    (friend) => friend.items.length > 0
  ).length;
  const chargesPerPerson = activeUsers > 0 ? totalCharges / activeUsers : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[16px] md:text-2xl">Bill Summary</CardTitle>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Split
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {friends.map((friend, index) => {
            const subtotal = calculateSubtotal(friend.items);
            const total =
              friend.items.length > 0 ? subtotal + chargesPerPerson : 0;

            return (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b p-2 hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold">{friend.name}</h3>
                {friend.items.length > 0 ? (
                  <>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {friend.items.map((friendItem) => {
                        const item = items.find(
                          (i) => i.id === friendItem.itemId
                        );
                        if (!item) return null;

                        return (
                          <li
                            key={friendItem.itemId}
                            className="text-sm flex justify-between"
                          >
                            <span>
                              {friendItem.quantity}x {item.name}
                              {item.quantity > 1 && (
                                <span className="text-muted-foreground">
                                  {" "}
                                  (of {item.quantity} total)
                                </span>
                              )}
                            </span>
                            <span>
                              {formatPrice(item.price * friendItem.quantity)}
                            </span>
                          </li>
                        );
                      })}
                      <li className="text-sm text-muted-foreground flex justify-between">
                        <span>Share of additional charges</span>
                        <span>{formatPrice(chargesPerPerson)}</span>
                      </li>
                    </ul>
                    <p className="font-bold mt-2 flex justify-between">
                      <span>Total to pay:</span>
                      <span>{formatPrice(total)}</span>
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    No items selected
                  </p>
                )}
              </motion.div>
            );
          })}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-4 mt-6 space-y-2"
          >
            <p className="font-semibold flex justify-between">
              <span>Total Bill:</span>
              <span>
                {formatPrice(
                  items.reduce((sum, item) => sum + item.totalPrice, 0) +
                    totalCharges
                )}
              </span>
            </p>
            <p className="text-sm text-muted-foreground flex justify-between">
              <span>Additional charges per person:</span>
              <span>{formatPrice(chargesPerPerson)}</span>
            </p>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4"
        >
          <Button
            className="w-full bg-primary hover:bg-primary/90 transition-colors"
            onClick={onSave}
          >
            Save Bill
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
