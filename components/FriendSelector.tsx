"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Minus,
  UserPlus2,
  Edit2,
  Trash2,
  ChevronDown,
} from "lucide-react";
import type { Item, Friend } from "@/types/bill";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { toast } from "sonner";
import DeleteFriendDialog from "@/components/DeleteFriendDialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FriendSelectorProps {
  friends: Friend[];
  items: Item[];
  onAddFriend: (name: string) => void;
  onItemSelection: (friendId: string, itemId: string, quantity: number) => void;
  onUpdateFriendName: (friendId: string, newName: string) => void;
  onDeleteFriend: (friendId: string) => void;
}

export default function FriendSelector({
  friends,
  items,
  onAddFriend,
  onItemSelection,
  onUpdateFriendName,
  onDeleteFriend,
}: FriendSelectorProps) {
  const [newFriendName, setNewFriendName] = useState("");
  const [editingFriendId, setEditingFriendId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [friendToDelete, setFriendToDelete] = useState<Friend | null>(null);
  const [openCollapsibles, setOpenCollapsibles] = useState<string[]>([]);

  useEffect(() => {
    setOpenCollapsibles(friends.map((friend) => friend.id));
  }, [friends]);

  const getItemQuantityInfo = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return { total: 0, assigned: 0, remaining: 0 };

    const assigned = friends.reduce((sum, friend) => {
      const friendItem = friend.items.find((i) => i.itemId === itemId);
      return sum + (friendItem?.quantity || 0);
    }, 0);

    return {
      total: item.quantity,
      assigned,
      remaining: item.quantity - assigned,
    };
  };

  const handleAddFriend = () => {
    const trimmedName = newFriendName.trim();
    if (!trimmedName) {
      toast.error("Friend name cannot be empty!");
      return;
    }

    if (
      friends.some((f) => f.name.toLowerCase() === trimmedName.toLowerCase())
    ) {
      toast.error("A friend with this name already exists!");
      return;
    }

    onAddFriend(trimmedName);
    setNewFriendName("");
    toast.success("Friend added successfully!");
  };

  const handleEditName = (friendId: string) => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      toast.error("Friend name cannot be empty!");
      return;
    }

    if (
      friends.some(
        (f) =>
          f.id !== friendId &&
          f.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      toast.error("A friend with this name already exists!");
      return;
    }

    onUpdateFriendName(friendId, trimmedName);
    setEditingFriendId(null);
    setEditName("");
    toast.success("Friend name updated successfully!");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const toggleCollapsible = (friendId: string) => {
    setOpenCollapsibles((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  return (
    <Card className="mt-6 overflow-auto">
      <CardHeader>
        <CardTitle className="text-[16px] md:text-2xl">
          Select Items for Each Friend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex gap-2">
            <Input
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              placeholder="Friend's name"
              className="max-w-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddFriend();
                }
              }}
            />
            <Button onClick={handleAddFriend}>
              <UserPlus2 className="h-4 w-4 mr-2" />
              Add Friend
            </Button>
          </div>

          {friends.length > 0 ? (
            <div className="h-[400px] pr-0">
              <div className="space-y-6">
                {friends.map((friend) => (
                  <Collapsible
                    key={friend.id}
                    open={openCollapsibles.includes(friend.id)}
                    onOpenChange={() => toggleCollapsible(friend.id)}
                  >
                    <div className="rounded-lg p-1">
                      <div className="flex justify-between items-center mb-4">
                        {editingFriendId === friend.id ? (
                          <div className="flex gap-2 items-center flex-1">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyPress={(e) =>
                                e.key === "Enter" && handleEditName(friend.id)
                              }
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleEditName(friend.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingFriendId(null);
                                setEditName("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80">
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  openCollapsibles.includes(friend.id)
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                              <h3 className="text-lg font-medium">
                                {friend.name}
                              </h3>
                            </CollapsibleTrigger>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingFriendId(friend.id);
                                  setEditName(friend.name);
                                }}
                                className="hover:bg-accent hover:text-accent-foreground transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setFriendToDelete(friend)}
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                      <CollapsibleContent>
                        <div className="overflow-x-auto relative">
                          <div className="min-w-[700px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Item</TableHead>
                                  <TableHead>Quantity</TableHead>
                                  <TableHead className="text-right">
                                    Price
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {items.map((item) => {
                                  const friendItem = friend.items.find(
                                    (i) => i.itemId === item.id
                                  );
                                  const quantity = friendItem?.quantity || 0;
                                  const { total, assigned, remaining } =
                                    getItemQuantityInfo(item.id);

                                  return (
                                    <TableRow key={item.id}>
                                      <TableCell>
                                        <div className="flex flex-col">
                                          <span className="font-medium">
                                            {item.name}
                                          </span>
                                          <span className="text-sm text-muted-foreground">
                                            Total: {assigned}/{total} assigned
                                            {remaining > 0 &&
                                              ` (${remaining} remaining)`}
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() =>
                                              onItemSelection(
                                                friend.id,
                                                item.id,
                                                quantity - 1
                                              )
                                            }
                                            disabled={quantity === 0}
                                          >
                                            <Minus className="h-4 w-4" />
                                          </Button>
                                          <span className="w-8 text-center">
                                            {quantity}
                                          </span>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() =>
                                              onItemSelection(
                                                friend.id,
                                                item.id,
                                                quantity + 1
                                              )
                                            }
                                            disabled={remaining === 0}
                                          >
                                            <Plus className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatPrice(item.price * quantity)}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus2 className="mx-auto h-12 w-12 mb-4" />
              <p>Add friends to start splitting the bill</p>
            </div>
          )}
        </div>
      </CardContent>
      <DeleteFriendDialog
        isOpen={!!friendToDelete}
        onClose={() => setFriendToDelete(null)}
        onConfirm={() => {
          if (friendToDelete) {
            onDeleteFriend(friendToDelete.id);
            setFriendToDelete(null);
          }
        }}
        friendName={friendToDelete?.name || ""}
      />
    </Card>
  );
}
