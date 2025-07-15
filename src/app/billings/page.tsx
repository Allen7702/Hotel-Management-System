'use client';

import { useEffect, useState } from 'react';
import {  Invoice } from '@/services/api';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';

export default function Billings() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        // const data = await getInvoices();
        // setInvoices(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load invoices:', error);
        toast.error('Failed to load invoices');
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const downloadPDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    doc.text(`Invoice #${invoice.id}`, 10, 10);
    doc.text(`Booking ID: ${invoice.booking_id}`, 10, 20);
    doc.text(`Amount: $${invoice.amount}`, 10, 30);
    doc.text(`Tax: $${invoice.tax}`, 10, 40);
    doc.text(`Status: ${invoice.status}`, 10, 50);
    doc.text(`Payment Method: ${invoice.payment_method}`, 10, 60);
    doc.text(`Receipt: ${invoice.receipt}`, 10, 70);
    doc.save(`invoice_${invoice.id}.pdf`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Billings</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Invoice ID</th>
            <th className="p-2">Booking ID</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Tax</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b">
              <td className="p-2">{invoice.id}</td>
              <td className="p-2">{invoice.booking_id}</td>
              <td className="p-2">${invoice.amount}</td>
              <td className="p-2">${invoice.tax}</td>
              <td className="p-2">{invoice.status}</td>
              <td className="p-2">
                <button onClick={() => downloadPDF(invoice)} className="text-blue-500">
                  Download PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}