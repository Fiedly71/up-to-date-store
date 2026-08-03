import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReceiptPrintable } from "@/components/admin/ReceiptPrintable";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ gate: string; id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order
    .findUnique({ where: { id }, include: { items: { include: { product: true } }, cashier: true } })
    .catch(() => null);

  if (!order) notFound();

  return (
    <ReceiptPrintable
      order={{
        id: order.id,
        createdAt: order.createdAt.toISOString(),
        channel: order.channel,
        customerName: order.customerName,
        status: order.status,
        paymentMethod: order.paymentMethod,
        total: order.total,
        items: order.items.map((i) => ({
          id: i.id,
          product: i.product ? { name: i.product.name } : null,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      }}
    />
  );
}
