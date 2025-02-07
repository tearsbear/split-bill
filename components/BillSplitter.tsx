"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ItemList from "./ItemList";
import FriendSelector from "./FriendSelector";
import BillSummary from "./BillSummary";
import type { Bill, Friend, Item, AdditionalCharge } from "@/types/bill";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import { ArrowLeft, Trash2, Image as ImageIcon } from "lucide-react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import BillUploader from "@/components/BillUploader";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

export default function BillSplitter() {
  const [bill, setBill] = useState<Bill | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedBills, setSavedBills] = useState<
    Array<{
      id: string;
      date: string;
      bill: Bill;
      friends: Friend[];
      imageUrl?: string | null;
    }>
  >([]);
  const [currentBillId, setCurrentBillId] = useState<string | null>(null);
  const [billToDelete, setBillToDelete] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleAddFriend = (name: string) => {
    setFriends([...friends, { id: Date.now().toString(), name, items: [] }]);
  };

  const handleItemSelection = (
    friendId: string,
    itemId: string,
    quantity: number
  ) => {
    setFriends(
      friends.map((friend) => {
        if (friend.id === friendId) {
          const updatedItems = friend.items.filter(
            (item) => item.itemId !== itemId
          );
          if (quantity > 0) {
            updatedItems.push({ itemId, quantity });
          }
          return { ...friend, items: updatedItems };
        }
        return friend;
      })
    );
  };

  const handleAddFee = (fee: {
    name: string;
    quantity: number;
    price: number;
    category?: "menu" | "fee";
  }) => {
    if (!bill) return;

    const category = fee.category ?? "menu";

    if (category === "menu") {
      // Add as a selectable menu item
      const newItem: Item = {
        id: `custom-${Date.now()}`,
        name: fee.name,
        quantity: fee.quantity,
        price: fee.price,
        totalPrice: fee.quantity * fee.price,
      };

      setBill({
        ...bill,
        items: [...bill.items, newItem],
        totalBeforeCharges: bill.totalBeforeCharges + newItem.totalPrice,
        totalAfterCharges: bill.totalAfterCharges + newItem.totalPrice,
      });
    } else {
      // Add as a shared fee
      const newCharge: AdditionalCharge = {
        name: fee.name,
        amount: fee.price, // For fees, we use the price directly as the amount
      };

      setBill({
        ...bill,
        additionalCharges: [...bill.additionalCharges, newCharge],
        totalAfterCharges: bill.totalAfterCharges + newCharge.amount,
      });
    }
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handleEdit = () => {
    setStep(2);
  };

  const canProceed = () => {
    if (!bill) return false;

    const itemAssignments = new Map<string, number>();
    friends.forEach((friend) => {
      friend.items.forEach((item) => {
        const current = itemAssignments.get(item.itemId) || 0;
        itemAssignments.set(item.itemId, current + item.quantity);
      });
    });

    return bill.items.every((item) => {
      const assigned = itemAssignments.get(item.id) || 0;
      return assigned === item.quantity;
    });
  };

  const urlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSaveBill = async () => {
    if (!bill) return;

    let imageData = null;
    if (imagePreview) {
      try {
        imageData = await urlToBase64(imagePreview);
      } catch (error) {
        console.error("Failed to convert image:", error);
      }
    }

    const newSavedBill = {
      id: currentBillId || Date.now().toString(),
      date: new Date().toISOString(),
      bill,
      friends,
      imageUrl: imageData, // Store base64 string instead of blob URL
    };

    let updatedBills;
    if (currentBillId) {
      updatedBills = savedBills.map((saved) =>
        saved.id === currentBillId ? newSavedBill : saved
      );
      toast.success("Bill updated successfully!", {
        duration: 2000,
        className: "bg-green-50",
      });
    } else {
      updatedBills = [...savedBills, newSavedBill];
      toast.success("Bill saved successfully!", {
        duration: 2000,
        className: "bg-green-50",
      });
    }

    localStorage.setItem("savedBills", JSON.stringify(updatedBills));
    setSavedBills(updatedBills);
    setCurrentBillId(null);
    setStep(1);
  };

  const handleDeleteBill = (billId: string) => {
    // If we're currently viewing the bill that's being deleted,
    // we should reset the current view
    if (currentBillId === billId) {
      setBill(null);
      setFriends([]);
      setCurrentBillId(null);
      setStep(1);
    }

    const updatedBills = savedBills.filter((bill) => bill.id !== billId);
    localStorage.setItem("savedBills", JSON.stringify(updatedBills));
    setSavedBills(updatedBills);
    setBillToDelete(null);

    toast.success("Bill deleted successfully!", {
      duration: 2000,
      className: "bg-red-50",
    });

    // Add a slight delay before reloading to show the success toast
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleUpdateFriendName = (friendId: string, newName: string) => {
    setFriends(
      friends.map((friend) =>
        friend.id === friendId ? { ...friend, name: newName } : friend
      )
    );
  };

  const handleDeleteFriend = (friendId: string) => {
    setFriends(friends.filter((friend) => friend.id !== friendId));
    toast.success("Friend deleted successfully!");
  };

  const handleBillProcessed = (processedBill: Bill, previewUrl: string) => {
    setBill(processedBill);
    setCurrentBillId(null);
    setFriends([]);
    setImagePreview(previewUrl);
    setStep(2);

    // Sequence the notifications and preview
    toast.dismiss();
    toast.success("Bill processed successfully!", {
      duration: 800,
      onAutoClose: () => {
        // Show preview after toast is done
        setTimeout(() => setShowPreview(true), 300);
      },
    });
  };

  const handleViewBill = (savedBill: (typeof savedBills)[0]) => {
    setBill(savedBill.bill);
    setFriends(savedBill.friends);
    setCurrentBillId(savedBill.id);
    setImagePreview(savedBill.imageUrl || null);
    setStep(3);
  };

  useEffect(() => {
    const saved = localStorage.getItem("savedBills");
    if (saved) {
      setSavedBills(JSON.parse(saved));
    }
  }, []);

  return (
    <>
      <Toaster position="top-center" closeButton theme="light" richColors />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl mx-auto px-0"
      >
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
          <CardContent className="space-y-6 mt-5">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" {...fadeIn} className="space-y-6">
                  <div className="bg-primary/5 p-6 rounded-lg">
                    <BillUploader
                      onBillProcessed={handleBillProcessed}
                      isProcessing={isProcessing}
                      setIsProcessing={setIsProcessing}
                    />
                  </div>

                  {savedBills.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <motion.div
                          initial={{ rotate: -10 }}
                          animate={{ rotate: 0 }}
                        >
                          📋
                        </motion.div>
                        Saved Bills
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                        {savedBills
                          .sort((a, b) => Number(b.id) - Number(a.id))
                          .map((savedBill, index) => (
                            <motion.div
                              key={savedBill.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -100 }}
                              transition={{ delay: index * 0.1 }}
                              layout
                            >
                              <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-102 hover:bg-accent/50">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-center">
                                    <div
                                      className="flex-1"
                                      onClick={() => handleViewBill(savedBill)}
                                    >
                                      <p className="font-medium">
                                        {new Date(
                                          savedBill.date
                                        ).toLocaleDateString()}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {savedBill.friends.length} friends ·{" "}
                                        {new Intl.NumberFormat("id-ID", {
                                          style: "currency",
                                          currency: "IDR",
                                          minimumFractionDigits: 0,
                                        }).format(
                                          savedBill.bill.totalAfterCharges
                                        )}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setBillToDelete(savedBill.id);
                                        }}
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {step === 2 && bill && (
                <motion.div key="step2" {...fadeIn}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium text-muted-foreground">
                        Step {step}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map((stepNumber) => (
                          <motion.div
                            key={stepNumber}
                            className={`h-1 w-8 rounded-full ${
                              stepNumber === step
                                ? "bg-primary"
                                : stepNumber < step
                                ? "bg-primary/50"
                                : "bg-muted"
                            }`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: stepNumber * 0.1 }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between w-full md:w-auto items-center gap-2 mt-3 md:mt-0">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      {imagePreview && (
                        <Button
                          variant="outline"
                          onClick={() => setShowPreview(true)}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Preview Image
                        </Button>
                      )}
                    </div>
                  </div>
                  <ItemList
                    items={bill.items}
                    additionalCharges={bill.additionalCharges}
                    isLoading={isProcessing}
                    onAddFee={handleAddFee}
                  />
                  <FriendSelector
                    friends={friends}
                    items={bill.items}
                    onAddFriend={handleAddFriend}
                    onItemSelection={handleItemSelection}
                    onUpdateFriendName={handleUpdateFriendName}
                    onDeleteFriend={handleDeleteFriend}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      onClick={handleNextStep}
                      className="w-full mt-5"
                      disabled={!canProceed()}
                    >
                      Calculate Split
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {step === 3 && bill && (
                <motion.div key="step3" {...fadeIn}>
                  <BillSummary
                    friends={friends}
                    items={bill.items}
                    additionalCharges={bill.additionalCharges}
                    onEdit={handleEdit}
                    onSave={handleSaveBill}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      <DeleteConfirmDialog
        isOpen={!!billToDelete}
        onClose={() => setBillToDelete(null)}
        onConfirm={() => billToDelete && handleDeleteBill(billToDelete)}
      />

      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="md:max-w-1xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader className="mx-auto">
            <AlertDialogTitle className="text-center">
              Image Successfully Extracted
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Please adjust the item or fee if it's not match
            </AlertDialogDescription>
          </AlertDialogHeader>
          {imagePreview && (
            <div className="mt-4 rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="Bill preview"
                className="w-full h-auto max-h-[60vh] md:max-h-[40vh] object-contain"
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="w-full mx-auto bg-black text-white">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
