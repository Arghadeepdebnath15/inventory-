import React from 'react';
import { numberToWords } from '../utils/numberToWords';

export default function PrintInvoice({ billData, items, subtotal, discountAmount, gstAmount, grandTotal, settings, billNumber, previewMode = false }) {
  const invoiceDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
  
  // Base calculations
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmountBase = subtotal - discountAmount;
  
  // Tally splits GST into CGST and SGST (half each)
  const halfGstRate = billData.gst_rate > 0 ? (billData.gst_rate / 2) : 0;
  const halfGstAmount = billData.gst_rate > 0 ? (gstAmount / 2) : 0;
  
  // Calculate exact round off
  const exactTotal = totalAmountBase + gstAmount;
  const roundedTotal = Math.round(exactTotal);
  const roundOff = roundedTotal - exactTotal;

  return (
    <div className={`${previewMode ? 'block scale-[0.8] origin-top mx-auto shadow-2xl mb-8' : 'print-only hidden print:block'} w-[210mm] min-h-[297mm] bg-white text-black font-sans m-0 p-0`} style={{ fontFamily: 'Arial, sans-serif' }}>
      
      {/* Title */}
      <div className="text-center font-bold text-lg mb-1 tracking-wider">
        TAX INVOICE
      </div>

      {/* Main Border Box */}
      <div className="border border-black flex flex-col h-[280mm]">
        
        {/* Top Section - Company & Reference Details Grid */}
        <div className="grid grid-cols-2 border-b border-black h-[65mm]">
          
          {/* Top Left - Seller & Buyer Details */}
          <div className="flex flex-col border-r border-black">
            {/* Seller Box */}
            <div className="p-1 flex-1 border-b border-black text-[11px] leading-tight">
              <div className="font-bold text-[12px]">DEBNATH TYRE AND TREAD</div>
              <div>KRISHNAPUR<br/>DHARMANAGAR<br/>NORTH TRIPURA</div>
              <div>GSTIN/UIN: 16AGDPD0240N1ZR</div>
              <div>State Name : {billData.shop_state || 'Tripura'}, Code : {billData.shop_state_code || '16'}</div>
            </div>
            
            {/* Buyer Box */}
            <div className="p-1 flex-1 text-[11px] leading-tight flex flex-col justify-between">
              <div>
                <div>Buyer (Bill to)</div>
                <div className="font-bold">{billData.customer_name || 'Cash'}</div>
                {billData.customer_phone && <div>Ph: {billData.customer_phone}</div>}
              </div>
              <div className="mt-4">
                State Name <span className="ml-4">: {billData.customer_state || 'Tripura'}, Code : {billData.customer_state_code || '16'}</span>
              </div>
            </div>
          </div>

          {/* Top Right - Invoice Reference Details */}
          <div className="grid grid-cols-2 grid-rows-5 text-[10px] leading-tight">
            {/* Row 1 */}
            <div className="border-b border-r border-black p-1">
              <div className="text-[9px]">Invoice No.</div>
              <div className="font-bold">{billNumber}</div>
            </div>
            <div className="border-b border-black p-1">
              <div className="text-[9px]">Dated</div>
              <div className="font-bold">{invoiceDate}</div>
            </div>
            {/* Row 2 */}
            <div className="border-b border-r border-black p-1">
              <div className="text-[9px]">Delivery Note</div>
              <div className="font-bold">{billData.delivery_note || ''}</div>
            </div>
            <div className="border-b border-black p-1">
              <div className="text-[9px]">Mode/Terms of Payment</div>
              <div className="font-bold">{billData.payment_mode || ''}</div>
            </div>
            {/* Row 3 */}
            <div className="border-b border-r border-black p-1">
              <div className="text-[9px]">Reference No. & Date.</div>
              <div className="font-bold">{billData.reference_no || ''}</div>
            </div>
            <div className="border-b border-black p-1">
              <div className="text-[9px]">Other References</div>
              <div className="font-bold">{billData.other_references || ''}</div>
            </div>
            {/* Row 4 */}
            <div className="border-b border-r border-black p-1">
              <div className="text-[9px]">Buyer's Order No.</div>
              <div className="font-bold">{billData.buyer_order_no || ''}</div>
            </div>
            <div className="border-b border-black p-1">
              <div className="text-[9px]">Dated</div>
              <div className="font-bold">{billData.buyer_order_date || ''}</div>
            </div>
            {/* Row 5 */}
            <div className="border-b border-r border-black p-1">
              <div className="text-[9px]">Dispatch Doc No.</div>
              <div className="font-bold">{billData.dispatch_doc_no || ''}</div>
            </div>
            <div className="border-b border-black p-1">
              <div className="text-[9px]">Delivery Note Date</div>
              <div className="font-bold">{billData.delivery_note_date || ''}</div>
            </div>
            {/* Row 6 */}
            <div className="border-b border-r border-black p-1">
              <div className="text-[9px]">Dispatched through</div>
              <div className="font-bold">{billData.dispatched_through || ''}</div>
            </div>
            <div className="border-b border-black p-1">
              <div className="text-[9px]">Destination</div>
              <div className="font-bold">{billData.destination || ''}</div>
            </div>
            {/* Row 7 (Spans full width) */}
            <div className="col-span-2 border-b border-black p-1 flex flex-col justify-between h-full">
              <div className="text-[9px]">Terms of Delivery</div>
              <div className="font-bold">{billData.terms_of_delivery || ''}</div>
            </div>
          </div>
        </div>

        {/* Main Items Table */}
        <div className="flex-1 flex flex-col text-[10px] border-b border-black">
          <table className="w-full h-full border-collapse table-fixed">
            <thead>
              <tr className="border-b border-black h-[6mm]">
                <th className="border-r border-black font-normal w-[5%] p-0.5">Sl<br/>No.</th>
                <th className="border-r border-black font-normal w-[35%] p-0.5 text-left">Description of Goods</th>
                <th className="border-r border-black font-normal w-[10%] p-0.5">HSN/SAC</th>
                <th className="border-r border-black font-normal w-[6%] p-0.5">GST<br/>Rate</th>
                <th className="border-r border-black font-normal w-[10%] p-0.5">Quantity</th>
                <th className="border-r border-black font-normal w-[10%] p-0.5">Rate<br/>(Incl. of Tax)</th>
                <th className="border-r border-black font-normal w-[8%] p-0.5">Rate</th>
                <th className="border-r border-black font-normal w-[5%] p-0.5">per</th>
                <th className="font-normal w-[11%] p-0.5">Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Items */}
              {items.map((item, idx) => {
                const isInclusive = billData.price_inclusive;
                const baseRate = isInclusive ? (item.unit_price / (1 + (billData.gst_rate/100))) : item.unit_price;
                const inclRate = isInclusive ? item.unit_price : (item.unit_price * (1 + (billData.gst_rate/100)));
                const amount = item.quantity * baseRate;

                return (
                  <tr key={idx} className="align-top">
                    <td className="border-r border-black p-1 text-center">{idx + 1}</td>
                    <td className="border-r border-black p-1 font-bold">{item.product_name}</td>
                    <td className="border-r border-black p-1 text-center">{item.hsn_code || '4004'}</td>
                    <td className="border-r border-black p-1 text-right">{billData.gst_rate || 0} %</td>
                    <td className="border-r border-black p-1 font-bold text-center">{item.quantity} PCS</td>
                    <td className="border-r border-black p-1 text-right">{inclRate.toFixed(2)}</td>
                    <td className="border-r border-black p-1 text-right">{baseRate.toFixed(2)}</td>
                    <td className="border-r border-black p-1 text-center">PCS</td>
                    <td className="p-1 font-bold text-right">{amount.toFixed(2)}</td>
                  </tr>
                );
              })}

              {/* Tax Appendages */}
              {billData.gst_rate > 0 && (
                <>
                  <tr className="align-top">
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1 font-bold italic text-right">CGST</td>
                    <td className="border-r border-black p-1"></td><td className="border-r border-black p-1"></td><td className="border-r border-black p-1"></td><td className="border-r border-black p-1"></td><td className="border-r border-black p-1"></td><td className="border-r border-black p-1"></td>
                    <td className="p-1 font-bold text-right">{halfGstAmount.toFixed(2)}</td>
                  </tr>
                  <tr className="align-top">
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1 font-bold italic text-right">SGST</td>
                    <td className="border-r border-black p-1"></td><td className="border-r border-black p-1"></td><td className="border-r border-black p-1"></td><td className="border-r border-black p-1"></td><td className="border-r border-black p-1"></td><td className="border-r border-black p-1"></td>
                    <td className="p-1 font-bold text-right">{halfGstAmount.toFixed(2)}</td>
                  </tr>
                </>
              )}
              
              {/* Round off */}
              {roundOff !== 0 && (
                <tr className="align-top">
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black p-1 font-bold italic text-right">ROUND OFF</td>
                  <td className="border-r border-black p-1"></td><td className="border-r border-black p-1"></td><td className="border-r border-black p-1"></td><td className="border-r border-black p-1"></td><td className="border-r border-black p-1"></td><td className="border-r border-black p-1"></td>
                  <td className="p-1 font-bold text-right">{roundOff > 0 ? '' : '-'}{Math.abs(roundOff).toFixed(2)}</td>
                </tr>
              )}

              {/* Spacer Row to fill height */}
              <tr className="h-full align-top">
                <td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total Row */}
        <div className="flex border-b border-black text-[10px] h-[6mm]">
          <div className="w-[40%] border-r border-black flex items-center justify-end pr-2">Total</div>
          <div className="w-[10%] border-r border-black"></div>
          <div className="w-[6%] border-r border-black"></div>
          <div className="w-[10%] border-r border-black font-bold flex items-center justify-center">{totalQty} PCS</div>
          <div className="w-[10%] border-r border-black"></div>
          <div className="w-[8%] border-r border-black"></div>
          <div className="w-[5%] border-r border-black"></div>
          <div className="w-[11%] font-bold text-sm flex items-center justify-end pr-1 tracking-wider">₹ {roundedTotal.toFixed(2)}</div>
        </div>

        {/* Amount in words */}
        <div className="border-b border-black text-[10px] p-1 flex justify-between">
          <div>
            <div className="mb-0.5">Amount Chargeable (in words)</div>
            <div className="font-bold text-[11px] uppercase tracking-wide">INR {numberToWords(roundedTotal)}</div>
          </div>
          <div className="font-bold italic">E. & O.E</div>
        </div>

        {/* Tax Table */}
        <div className="border-b border-black text-[9px]">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="border-b border-black">
                <th className="border-r border-black p-0.5 font-normal w-[20%]" rowSpan="2">HSN/SAC</th>
                <th className="border-r border-black p-0.5 font-normal w-[15%]" rowSpan="2">Taxable<br/>Value</th>
                <th className="border-r border-black p-0.5 font-normal w-[25%]" colSpan="2">CGST</th>
                <th className="border-r border-black p-0.5 font-normal w-[25%]" colSpan="2">SGST/UTGST</th>
                <th className="p-0.5 font-normal w-[15%]" rowSpan="2">Total<br/>Tax Amount</th>
              </tr>
              <tr className="border-b border-black">
                <th className="border-r border-black p-0.5 font-normal">Rate</th>
                <th className="border-r border-black p-0.5 font-normal">Amount</th>
                <th className="border-r border-black p-0.5 font-normal">Rate</th>
                <th className="border-r border-black p-0.5 font-normal">Amount</th>
              </tr>
            </thead>
            <tbody>
              {billData.gst_rate > 0 && items.length > 0 && (
                <tr className="text-right">
                  <td className="border-r border-black p-1 text-left">{items[0].hsn_code || '4004'}</td>
                  <td className="border-r border-black p-1">{totalAmountBase.toFixed(2)}</td>
                  <td className="border-r border-black p-1">{halfGstRate.toFixed(2)}%</td>
                  <td className="border-r border-black p-1">{halfGstAmount.toFixed(2)}</td>
                  <td className="border-r border-black p-1">{halfGstRate.toFixed(2)}%</td>
                  <td className="border-r border-black p-1">{halfGstAmount.toFixed(2)}</td>
                  <td className="p-1">{gstAmount.toFixed(2)}</td>
                </tr>
              )}
              <tr className="text-right font-bold border-t border-black">
                <td className="border-r border-black p-1">Total</td>
                <td className="border-r border-black p-1">{totalAmountBase.toFixed(2)}</td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1">{halfGstAmount.toFixed(2)}</td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-1">{halfGstAmount.toFixed(2)}</td>
                <td className="p-1">{gstAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tax in words */}
        <div className="border-b border-black text-[10px] p-1 h-[12mm]">
          <div className="mb-0.5">Tax Amount (in words) :</div>
          <div className="font-bold text-[11px] uppercase tracking-wide">INR {numberToWords(gstAmount)}</div>
        </div>

        {/* Footer Area Grid */}
        <div className="flex flex-1">
          {/* Declaration */}
          <div className="w-[50%] border-r border-black flex flex-col">
            <div className="p-1 text-[9px] flex-1">
              <div className="underline mb-0.5">Declaration</div>
              <div>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</div>
            </div>
            {/* Seal Area */}
            <div className="border-t border-black p-1 h-[25mm] flex items-start">
              <div className="text-[10px]">Customer's Seal and Signature</div>
            </div>
          </div>
          
          {/* Signatory */}
          <div className="w-[50%] flex flex-col h-full justify-between p-1">
            <div className="font-bold text-[10px] text-right">for DEBNATH TYRE AND TREAD</div>
            <div className="text-right text-[10px] mt-16">Authorised Signatory</div>
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] mt-1">This is a Computer Generated Invoice</div>
      
    </div>
  );
}
