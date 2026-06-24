import React from 'react';

export default function PrintInvoice({ billData, items, subtotal, discountAmount, gstAmount, grandTotal, settings, billNumber }) {
  const numberToWords = (num) => {
    // Very simple fallback
    return "RUPEES " + num.toFixed(2) + " ONLY";
  };

  const invoiceDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="print-only hidden print:block w-full bg-white text-black font-sans text-[11px] leading-tight m-0 p-0" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-wide mb-1" style={{ fontFamily: 'Impact, sans-serif' }}>
            {settings?.shop_name || 'MY SHOP'}
          </h1>
          <div className="bg-gray-800 text-white px-2 py-1 font-bold text-sm mb-2 w-max">
            {settings?.owner_name ? `Proprietor: ${settings.owner_name}` : 'Tyre & Accessories Retailer'}
          </div>
          <p className="whitespace-pre-wrap">{settings?.address || 'Shop Address Line 1\nCity, State - PINCODE'}</p>
        </div>
        <div className="text-right">
          <p className="mt-8 font-bold">Tel : {settings?.phone || 'N/A'}</p>
          {settings?.email && <p>Email : {settings.email}</p>}
        </div>
      </div>

      {/* Main Border Box */}
      <div className="border-[1.5px] border-black">
        
        {/* Title Row */}
        <div className="flex justify-between items-center border-b-[1.5px] border-black px-2 py-1 font-bold">
          <div className="w-1/3">PAN : {settings?.pan || 'NOT PROVIDED'}</div>
          <div className="w-1/3 text-center text-lg tracking-wider">TAX INVOICE</div>
          <div className="w-1/3 text-right">ORIGINAL FOR RECIPIENT</div>
        </div>

        {/* Customer & Invoice Details Row */}
        <div className="flex border-b-[1.5px] border-black">
          
          {/* Customer Detail */}
          <div className="w-1/2 border-r-[1.5px] border-black p-0">
            <div className="text-center font-bold border-b-[1.5px] border-black py-1">Customer Detail</div>
            <div className="p-2 grid grid-cols-[80px_1fr] gap-1">
              <span className="font-bold">Name:</span> <span>{billData.customer_name || 'Cash Customer'}</span>
              <span className="font-bold">Phone:</span> <span>{billData.customer_phone || '-'}</span>
              <span className="font-bold">Vehicle No:</span> <span>{billData.vehicle_number || '-'}</span>
              <span className="font-bold">State:</span> <span>{billData.state || 'Local'}</span>
            </div>
          </div>

          {/* Invoice Detail */}
          <div className="w-1/2 p-2 grid grid-cols-[100px_1fr_100px_1fr] gap-x-2 gap-y-1 content-start">
            <span className="font-bold">Invoice No.</span> <span>{billNumber}</span>
            <span className="font-bold">Invoice Date</span> <span>{invoiceDate}</span>
            <span className="font-bold col-span-2"></span> <span className="col-span-2"></span>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="border-b-[1.5px] border-black font-bold">
              <th className="border-r-[1.5px] border-black p-1 w-10">Sr. No.</th>
              <th className="border-r-[1.5px] border-black p-1">Name of Product / Service</th>
              <th className="border-r-[1.5px] border-black p-1 w-20">HSN / SAC</th>
              <th className="border-r-[1.5px] border-black p-1 w-20">Qty</th>
              <th className="border-r-[1.5px] border-black p-1 w-24">Rate</th>
              <th className="p-1 w-28">Taxable Value</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="align-top">
                <td className="border-r-[1.5px] border-black p-1 pt-2">{idx + 1}</td>
                <td className="border-r-[1.5px] border-black p-1 pt-2 text-left font-bold">{item.product_name}</td>
                <td className="border-r-[1.5px] border-black p-1 pt-2">{item.hsn_code || '-'}</td>
                <td className="border-r-[1.5px] border-black p-1 pt-2">{item.quantity} NOS</td>
                <td className="border-r-[1.5px] border-black p-1 pt-2 text-right">{Number(item.unit_price).toFixed(2)}</td>
                <td className="p-1 pt-2 text-right">{(item.quantity * item.unit_price).toFixed(2)}</td>
              </tr>
            ))}
            
            {/* Spacer for IGST row */}
            <tr className="align-top h-24">
              <td className="border-r-[1.5px] border-black p-1"></td>
              <td className="border-r-[1.5px] border-black p-1 font-bold text-right pr-4 pt-4">
                {billData.gst_rate > 0 ? `GST (${billData.gst_rate} %)` : (discountAmount > 0 ? 'Discount' : '')}
              </td>
              <td className="border-r-[1.5px] border-black p-1"></td>
              <td className="border-r-[1.5px] border-black p-1"></td>
              <td className="border-r-[1.5px] border-black border-b-[1.5px] p-1"></td>
              <td className="p-1 border-b-[1.5px] border-black text-right pt-4">
                <div className="font-bold mb-1 border-b border-black pb-1">{(subtotal).toFixed(2)}</div>
                {billData.gst_rate > 0 ? gstAmount.toFixed(2) : (discountAmount > 0 ? `-${discountAmount.toFixed(2)}` : '')}
              </td>
            </tr>

            {/* Subtotal Row */}
            <tr className="border-t-[1.5px] border-b-[1.5px] border-black font-bold">
              <td className="border-r-[1.5px] border-black p-1"></td>
              <td className="border-r-[1.5px] border-black p-1 text-right">Total</td>
              <td className="border-r-[1.5px] border-black p-1"></td>
              <td className="border-r-[1.5px] border-black p-1">{items.reduce((s, i) => s + i.quantity, 0)} NOS</td>
              <td className="border-r-[1.5px] border-black p-1"></td>
              <td className="p-1 text-right">₹ {grandTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Total in words */}
        <div className="border-b-[1.5px] border-black px-2 py-1 flex justify-between">
          <span>Total in words</span>
          <span className="font-bold">(E & O.E.)</span>
        </div>
        <div className="border-b-[1.5px] border-black px-2 py-1 font-bold">
          {numberToWords(grandTotal)}
        </div>

        {/* Tax Breakdown */}
        {billData.gst_rate > 0 && (
          <table className="w-full text-center border-collapse border-b-[1.5px] border-black">
            <thead>
              <tr className="border-b-[1.5px] border-black font-bold">
                <th className="border-r-[1.5px] border-black p-1" rowSpan="2">HSN / SAC</th>
                <th className="border-r-[1.5px] border-black p-1" rowSpan="2">Taxable Value</th>
                <th className="border-r-[1.5px] border-black p-1" colSpan="2">GST</th>
                <th className="p-1" rowSpan="2">Total</th>
              </tr>
              <tr className="border-b-[1.5px] border-black font-bold">
                <th className="border-r-[1.5px] border-t-[1.5px] border-black p-1">%</th>
                <th className="border-r-[1.5px] border-t-[1.5px] border-black p-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-r-[1.5px] border-black p-1">-</td>
                <td className="border-r-[1.5px] border-black p-1 text-right">{(subtotal - discountAmount).toFixed(2)}</td>
                <td className="border-r-[1.5px] border-black p-1">{billData.gst_rate}.00</td>
                <td className="border-r-[1.5px] border-black p-1 text-right">{gstAmount.toFixed(2)}</td>
                <td className="p-1 text-right">{gstAmount.toFixed(2)}</td>
              </tr>
              <tr className="border-t-[1.5px] border-black font-bold">
                <td className="border-r-[1.5px] border-black p-1 text-right">Total</td>
                <td className="border-r-[1.5px] border-black p-1 text-right">{(subtotal - discountAmount).toFixed(2)}</td>
                <td className="border-r-[1.5px] border-black p-1"></td>
                <td className="border-r-[1.5px] border-black p-1 text-right">{gstAmount.toFixed(2)}</td>
                <td className="p-1 text-right">{gstAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Tax in words */}
        {billData.gst_rate > 0 && (
          <div className="border-b-[1.5px] border-black px-2 py-1 font-bold">
            Total Tax in words: {numberToWords(gstAmount)}
          </div>
        )}

        {/* Footer Grid */}
        <div className="flex">
          
          {/* Bank Details & Terms */}
          <div className="w-1/2 border-r-[1.5px] border-black flex flex-col">
            <div className="font-bold text-center border-b-[1.5px] border-black py-1">Bank Details</div>
            <div className="p-2 grid grid-cols-[80px_1fr] gap-1 flex-1 relative">
              <span className="font-bold">Name</span> <span>{settings?.bank_name || '-'}</span>
              <span className="font-bold">Branch</span> <span>{settings?.bank_branch || '-'}</span>
              <span className="font-bold">Acc. No.</span> <span>{settings?.bank_acc_no || '-'}</span>
              <span className="font-bold">IFSC</span> <span>{settings?.bank_ifsc || '-'}</span>
              <span className="font-bold mt-2">UPI ID</span> <span className="mt-2">{settings?.upi_id || '-'}</span>
            </div>
            
            <div className="font-bold text-center border-y-[1.5px] border-black py-1">Terms and Conditions</div>
            <div className="p-2 text-[10px] leading-tight flex-1">
              Goods once sold will not be taken back.<br/>
              Subject to local jurisdiction only.
            </div>
            <div className="border-t-[1.5px] border-black p-2 font-bold mt-auto h-16">
              Customer Signature
            </div>
          </div>
          
          {/* Signatory Box */}
          <div className="w-1/2 flex flex-col">
            <div className="text-[10px] font-bold text-center p-1 border-b-[1.5px] border-black">
              Certified that the particulars given above are true and correct.
            </div>
            <div className="font-bold text-center p-2 text-sm">
              For {settings?.shop_name || 'MY SHOP'}
            </div>
            <div className="mt-auto flex flex-col items-center p-2">
              <div className="text-[10px] text-gray-500 italic mb-10 transform -rotate-12 opacity-50">
                This is a computer generated<br/>invoice no signature required.
              </div>
              <div className="font-bold text-xs">Authorised Signatory</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
