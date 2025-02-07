"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddFeeDialogProps {
  onAddFee: (fee: {
    name: string
    quantity: number
    price: number
    category: "menu" | "fee"
  }) => void
}

export default function AddFeeDialog({ onAddFee }: AddFeeDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState<"menu" | "fee">("menu")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numericPrice = Number.parseFloat(price.replace(/[^\d.-]/g, ""))
    const numericQuantity = Number.parseInt(quantity)

    if (name && !isNaN(numericPrice) && !isNaN(numericQuantity)) {
      onAddFee({
        name,
        quantity: numericQuantity,
        price: numericPrice,
        category,
      })
      setOpen(false)
      resetForm()
    }
  }

  const resetForm = () => {
    setName("")
    setQuantity("1")
    setPrice("")
    setCategory("menu")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Other Item/Fee</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Other Item/Fee</DialogTitle>
            <DialogDescription>
              Add additional items or fees to the bill. Menu items can be selected by friends, while fees are split
              among all friends.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select value={category} onValueChange={(value: "menu" | "fee") => setCategory(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="menu">Menu Item (Selectable)</SelectItem>
                  <SelectItem value="fee">Fee (Split Among All)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder={category === "menu" ? "e.g., Extra Rice" : "e.g., Service Charge"}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="col-span-3"
                required
                disabled={category === "fee"}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="100"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="col-span-3"
                placeholder="0"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{category === "menu" ? "Add Item" : "Add Fee"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

