This project is a replica of the PDF Invoice Ultimate Editor from freemediatools.com, built using HTML, Tailwind CSS, and JavaScript.

**Tech Stack:**
- **HTML:** For the core structure of the invoice editor.
- **Tailwind CSS:** For all styling, included via the official CDN.
- **JavaScript:** For all client-side interactivity.
- **jsPDF & html2canvas:** JavaScript libraries (included via CDN) for generating the final PDF invoice.

**Features:**
- A "FROM" and "TO" section for sender and recipient details.
- Invoice metadata fields: Invoice #, Date, Due Date.
- A dynamic table for adding, editing, and removing line items (Description, Quantity, Rate, Total).
- Automatic calculation of subtotal, tax, and grand total.
- A logo uploader to add a company logo to the invoice.
- A currency selector.
- "Download Invoice" button to generate and save the invoice as a PDF.
- "Reset Form" button to clear all fields.
