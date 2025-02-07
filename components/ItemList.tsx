import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Item, AdditionalCharge } from "@/types/bill";
import AddFeeDialog from "./AddFeeDialog";

interface ItemListProps {
  items: Item[];
  additionalCharges: AdditionalCharge[];
  isLoading?: boolean;
  onAddFee: (fee: { name: string; quantity: number; price: number }) => void;
}

export default function ItemList({
  items,
  additionalCharges,
  isLoading,
  onAddFee,
}: ItemListProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(price));
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const charges = additionalCharges.filter((charge) => charge.amount > 0);
  const discounts = additionalCharges.filter((charge) => charge.amount < 0);
  const totalCharges = charges.reduce((sum, charge) => sum + charge.amount, 0);
  const totalDiscounts = discounts.reduce(
    (sum, discount) => sum + discount.amount,
    0
  );
  const total = subtotal + totalCharges + totalDiscounts;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bill Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
            <div className="h-[1px] bg-border my-4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-[120px]" />
              <Skeleton className="h-5 w-[100px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[16px] md:text-2xl">Bill Details</CardTitle>
        <AddFeeDialog onAddFee={onAddFee} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Qty</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-right">
                  {formatPrice(item.price)}
                </TableCell>
                <TableCell className="text-right">
                  {formatPrice(item.totalPrice)}
                </TableCell>
              </TableRow>
            ))}

            <TableRow>
              <TableCell colSpan={3} className="text-right font-medium">
                Subtotal
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatPrice(subtotal)}
              </TableCell>
            </TableRow>

            {charges.map((charge, index) => (
              <TableRow key={`charge-${index}`}>
                <TableCell colSpan={3} className="text-right">
                  {charge.name}
                </TableCell>
                <TableCell className="text-right">
                  {formatPrice(charge.amount)}
                </TableCell>
              </TableRow>
            ))}

            {discounts.map((discount, index) => (
              <TableRow key={`discount-${index}`} className="text-green-600">
                <TableCell colSpan={3} className="text-right">
                  {discount.name}
                </TableCell>
                <TableCell className="text-right">
                  -{formatPrice(discount.amount)}
                </TableCell>
              </TableRow>
            ))}

            <TableRow>
              <TableCell colSpan={3} className="text-right font-bold">
                Total
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatPrice(total)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
