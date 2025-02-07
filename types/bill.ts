export interface Item {
  id: string
  name: string
  quantity: number
  price: number
  totalPrice: number
  remainingQuantity?: number // Track available quantity
}

export interface FriendItem {
  itemId: string
  quantity: number
}

export interface Friend {
  id: string
  name: string
  items: FriendItem[] // Changed from string[] to FriendItem[]
}

export interface Bill {
  items: Item[]
  additionalCharges: AdditionalCharge[]
  totalBeforeCharges: number
  totalAfterCharges: number
}

export interface AdditionalCharge {
  name: string
  amount: number
}

