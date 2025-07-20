"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import PricingDialog, { PricingPlan } from "@/components/pricing-dialog";
import { Separator } from "@/components/ui/separator";

// Payment form validation schema
const paymentSchema = z.object({
  paymentMethod: z.enum(["card", "paypal"], {
    message: "Please select a payment method",
  }),
  cardNumber: z
    .string()
    .min(1, "Card number is required")
    .regex(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, "Please enter a valid card number"),
  expirationDate: z
    .string()
    .min(1, "Expiration date is required")
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Please enter a valid date (MM/YY)"),
  cvv: z
    .string()
    .min(3, "CVV must be at least 3 digits")
    .max(4, "CVV must be at most 4 digits")
    .regex(/^\d+$/, "CVV must contain only numbers"),
  saveCard: z.boolean().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [showPricingDialog, setShowPricingDialog] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "card",
      saveCard: false,
    },
  });

  const paymentMethod = watch("paymentMethod");

  const handleSelectPlan = async (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setShowPricingDialog(false);

    // If it's the free plan, skip payment and go directly to dashboard
    if (plan.price === 0) {
      try {
        // TODO: Replace with your actual API endpoint to activate free plan
        const response = await fetch("/api/plans/activate-free", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: plan.id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to activate free plan");
        }

        toast.success("Welcome to NALA! Your free plan is now active.");
        console.log("Free plan activated successfully");
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        toast.error(errorMessage);
        console.error("Free plan activation error:", error);
      }
    }
  };

  const handleChangePlan = () => {
    setShowPricingDialog(true);
  };

  // Format card number input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "").replace(/\D/g, "");
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    if (formattedValue.length <= 19) {
      setValue("cardNumber", formattedValue);
    }
  };

  // Format expiration date input
  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    let formattedValue = value;
    if (value.length >= 2) {
      formattedValue = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    if (formattedValue.length <= 5) {
      setValue("expirationDate", formattedValue);
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    if (!selectedPlan) return;

    setIsLoading(true);

    try {
      // TODO: Replace with your actual payment API endpoint
      const response = await fetch("/api/payments/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: selectedPlan,
          paymentData: data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Payment failed");
      }

      const result = await response.json();

      // Success
      toast.success("Payment successful! Welcome to your new plan.");

      // Redirect to payment confirmation page
      window.location.href = `/payment-confirmation?plan=${
        selectedPlan.id
      }&amount=${total.toFixed(2)}`;
      console.log("Payment successful:", result);
    } catch (error) {
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
      console.error("Payment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show pricing dialog if no plan is selected
  if (showPricingDialog || !selectedPlan) {
    return (
      <PricingDialog
        onSelectPlan={handleSelectPlan}
        currentPlan={selectedPlan}
      />
    );
  }

  const subtotal = selectedPlan.price;
  const tax = 0; // You can calculate tax based on your requirements
  const total = subtotal + tax;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6 bg-secondary rounded-2xl">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Image
              src="/svgs/Golden-Paw.svg"
              alt="Nala Logo"
              width={32}
              height={32}
              className="text-primary"
            />
            <h1 className="text-2xl font-bold text-foreground">NALA</h1>
          </div>

          <div className="grid grid-cols-2 gap-8 space-y-8">
            {/* Plan Details */}
            <div className="">
              <CardHeader>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChangePlan}
                    className="text-primary border-primary hover:bg-primary hover:text-primary-foreground "
                  >
                    Change Plan
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">
                      Upgrade Plan
                    </CardTitle>
                    <p className="text-muted-foreground mt-3">
                      {selectedPlan.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    ${selectedPlan.price}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {selectedPlan.period}
                  </span>
                </div>

                <Separator className="my-4" orientation="horizontal" />

                {/* Features List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="mt-8 pt-6 border-t border-border space-y-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sub Total</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator className="" orientation="horizontal" />

                  <div className="flex justify-between text-lg font-semibold text-primary border-t border-border pt-3">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="">
              <CardHeader>
                <CardTitle className="text-primary">
                  {selectedPlan.price === 0
                    ? "Plan Activated"
                    : "Payment Method"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPlan.price === 0 ? (
                  // Free Plan - Simple Continue Button
                  <div className="text-center space-y-6">
                    <div className="text-muted-foreground">
                      Your free plan is ready to use. Click below to continue to
                      your dashboard.
                    </div>

                    <Button
                      onClick={() =>
                        (window.location.href =
                          "/payment-confirmation?plan=free")
                      }
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Continue to Dashboard
                    </Button>

                    <div className="text-sm text-muted-foreground">
                      Want more features? You can upgrade to a paid plan anytime
                      by clicking "Change Plan" above.
                    </div>
                  </div>
                ) : (
                  // Paid Plan - Show Payment Form
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                      <Label className="text-foreground">Pay With:</Label>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={(value) =>
                          setValue("paymentMethod", value as "card" | "paypal")
                        }
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="text-foreground">
                            Card
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="paypal" id="paypal" />
                          <Label htmlFor="paypal" className="text-foreground">
                            PayPal
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {paymentMethod === "card" && (
                      <>
                        {/* Card Number */}
                        <div className="space-y-2">
                          <Label className="text-foreground">Card Number</Label>
                          <Input
                            {...register("cardNumber")}
                            placeholder="1234 5678 9101 1121"
                            onChange={handleCardNumberChange}
                            className={`bg-input border-border ${
                              errors.cardNumber
                                ? "border-destructive focus-visible:ring-destructive"
                                : ""
                            }`}
                          />
                          {errors.cardNumber && (
                            <p className="text-sm text-destructive">
                              {errors.cardNumber.message}
                            </p>
                          )}
                        </div>

                        {/* Expiration Date and CVV */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-foreground">
                              Expiration Date
                            </Label>
                            <Input
                              {...register("expirationDate")}
                              placeholder="MM/YY"
                              onChange={handleExpirationChange}
                              className={`bg-input border-border ${
                                errors.expirationDate
                                  ? "border-destructive focus-visible:ring-destructive"
                                  : ""
                              }`}
                            />
                            {errors.expirationDate && (
                              <p className="text-sm text-destructive">
                                {errors.expirationDate.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-foreground">CVV</Label>
                            <Input
                              {...register("cvv")}
                              placeholder="123"
                              maxLength={4}
                              className={`bg-input border-border ${
                                errors.cvv
                                  ? "border-destructive focus-visible:ring-destructive"
                                  : ""
                              }`}
                            />
                            {errors.cvv && (
                              <p className="text-sm text-destructive">
                                {errors.cvv.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Save Card Checkbox */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="saveCard"
                            checked={watch("saveCard")}
                            onCheckedChange={(checked) =>
                              setValue("saveCard", checked as boolean)
                            }
                          />
                          <Label
                            htmlFor="saveCard"
                            className="text-sm text-muted-foreground"
                          >
                            Save card details
                          </Label>
                        </div>
                      </>
                    )}

                    {/* Pay Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                    >
                      {isLoading
                        ? "Processing..."
                        : `Pay USD$${total.toFixed(2)}`}
                    </Button>

                    {/* Privacy Notice */}
                    <p className="text-xs text-muted-foreground text-center">
                      Your personal data will be used to process your order,
                      support your experience throughout this website, and for
                      other purposes described in our privacy policy.
                    </p>
                  </form>
                )}
              </CardContent>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
