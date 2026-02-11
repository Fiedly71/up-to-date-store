"use client";
import { DEFAULT_US_ADDRESS } from "@/app/utils/pricing";

export default function CheckoutPage() {
  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Default US Shipping Address</h2>
        <div className="text-gray-700">
          <div><b>Name:</b> {DEFAULT_US_ADDRESS.name}</div>
          <div><b>Address:</b> {DEFAULT_US_ADDRESS.address}</div>
          <div><b>City:</b> {DEFAULT_US_ADDRESS.city}</div>
          <div><b>State:</b> {DEFAULT_US_ADDRESS.state}</div>
          <div><b>ZIP:</b> {DEFAULT_US_ADDRESS.zip}</div>
          <div><b>Country:</b> {DEFAULT_US_ADDRESS.country}</div>
          <div><b>Phone:</b> {DEFAULT_US_ADDRESS.phone}</div>
        </div>
      </div>
      {/* Add payment and order summary here as needed */}
    </div>
  );
}
