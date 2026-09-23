const PDFDocument = require('pdfkit');

// Generate PDF receipt for a payment
exports.generatePDF = (payment) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.fontSize(20).text('Travel Explorer', { align: 'center' });
      doc.fontSize(12).text('Your Adventure Awaits', { align: 'center' });
      doc.moveDown();

      doc.moveTo(50, doc.y)
         .lineTo(doc.page.width - 50, doc.y)
         .stroke();
      doc.moveDown();

      doc.fontSize(16).text('Payment Receipt', { align: 'center' });
      doc.fontSize(10).text(`Payment ID: ${payment.paymentId}`, { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(12).text('Customer Information');
      doc.fontSize(10).text(`Name: ${payment.fullName || 'N/A'}`);
      doc.fontSize(10).text(`Email: ${payment.email || 'N/A'}`);
      doc.fontSize(10).text(`Phone: ${payment.phone || 'N/A'}`);
      doc.moveDown();

      // Add package information
      doc.fontSize(12).text('Package Details');
      doc.fontSize(10).text(`Package: ${payment.packageId?.name || 'N/A'}`);
      doc.fontSize(10).text(`Destination: ${payment.packageId?.destination || 'N/A'}`);
      doc.fontSize(10).text(`Travelers: ${payment.numberOfTravelers || 'N/A'}`);
      doc.moveDown();

      doc.fontSize(12).text('Payment Details');
      doc.fontSize(10).text(`Amount: $${payment.totalAmount?.toLocaleString() || '0'}`);
      doc.fontSize(10).text(`Payment Method: Credit Card (ending in ${payment.cardDetails?.lastFour || 'N/A'})`);
      doc.fontSize(10).text(`Status: ${payment.status?.toUpperCase() || 'N/A'}`);
      doc.fontSize(10).text(`Date: ${payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}`);
      doc.moveDown(2);

      doc.fontSize(8).text(
        'Thank you for booking with Travel Explorer. For any queries related to your booking, please contact our customer support team at support@travelexplorer.com or call us at +1-123-456-7890.',
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};