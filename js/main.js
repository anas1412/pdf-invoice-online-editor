document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT SELECTORS ---
    const editor = {
        languageSelect: document.getElementById('language-select'),
        downloadBtn: document.getElementById('download-invoice'),
        resetBtn: document.getElementById('reset-form'),
        logoUpload: document.getElementById('logo-upload'),
        fromAddress: document.getElementById('from-address'),
        toAddress: document.getElementById('to-address'),
        invoiceNumber: document.getElementById('invoice-number'),
        invoiceDate: document.getElementById('invoice-date'),
        dueDate: document.getElementById('due-date'),
        itemsEditorList: document.getElementById('invoice-items-editor-list'),
        addItemBtn: document.getElementById('add-item'),
        currencySelect: document.getElementById('currency'),
        taxRate: document.getElementById('tax-rate'),
        notes: document.getElementById('notes'),
        signaturePadCanvas: document.getElementById('signature-pad'),
        clearSignatureBtn: document.getElementById('clear-signature'),
    };

    const preview = {
        container: document.getElementById('invoice-preview-container'),
        logo: document.getElementById('logo-preview'),
        fromAddress: document.getElementById('from-address-preview'),
        toAddress: document.getElementById('to-address-preview'),
        invoiceNumber: document.getElementById('invoice-number-preview'),
        invoiceDate: document.getElementById('invoice-date-preview'),
        dueDate: document.getElementById('due-date-preview'),
        itemsTable: document.getElementById('invoice-items-preview'),
        subtotal: document.getElementById('subtotal-preview'),
        tax: document.getElementById('tax-preview'),
        total: document.getElementById('total-preview'),
        notes: document.getElementById('notes-preview'),
        signature: document.getElementById('signature-preview'),
    };

    // --- I18N TRANSLATIONS ---
    const translations = {
        en: {
            invoiceEditor: "Invoice Editor",
            language: "Language",
            downloadPDF: "Download PDF",
            resetForm: "Reset Form",
            companyLogo: "Company Logo",
            chooseFile: "Choose File",
            fromYourDetails: "From (Your Details)",
            toClientDetails: "To (Client Details)",
            invoiceNumberLabel: "Invoice #",
            date: "Date",
            dueDate: "Due Date",
            invoiceItems: "Invoice Items",
            addItem: "Add Item",
            currency: "Currency",
            taxRate: "Tax Rate (%)",
            notes: "Notes",
            notesPlaceholder: "Any additional information...",
            signature: "Signature",
            clearSignature: "Clear Signature",
            livePreview: "Live Preview",
            // Preview Pane
            invoice: "INVOICE",
            billedTo: "Billed To",
            invoiceDate: "Invoice Date:",
            previewDueDate: "Due Date:",
            description: "Description",
            qty: "Qty",
            unitPrice: "Unit Price",
            total: "Total",
            subtotal: "Subtotal",
            tax: "Tax",
            previewNotes: "Notes",
            previewSignature: "Signature",
            itemDescriptionPlaceholder: "Item Description"
        },
        fr: {
            invoiceEditor: "Éditeur de Facture",
            language: "Langue",
            downloadPDF: "Télécharger le PDF",
            resetForm: "Réinitialiser",
            companyLogo: "Logo de l'entreprise",
            chooseFile: "Choisir un fichier",
            fromYourDetails: "De (Vos détails)",
            toClientDetails: "À (Détails du client)",
            invoiceNumberLabel: "Facture n°",
            date: "Date",
            dueDate: "Date d'échéance",
            invoiceItems: "Articles de la facture",
            addItem: "Ajouter un article",
            currency: "Devise",
            taxRate: "Taux de taxe (%)",
            notes: "Notes",
            notesPlaceholder: "Toute information additionnelle...",
            signature: "Signature",
            clearSignature: "Effacer la signature",
            livePreview: "Aperçu en direct",
            // Preview Pane
            invoice: "FACTURE",
            billedTo: "Facturé à",
            invoiceDate: "Date de la facture:",
            previewDueDate: "Date d'échéance:",
            description: "Description",
            qty: "Qté",
            unitPrice: "Prix Unitaire",
            total: "Total",
            subtotal: "Sous-total",
            tax: "Taxe",
            previewNotes: "Notes",
            previewSignature: "Signature",
            itemDescriptionPlaceholder: "Description de l'article"
        }
    };

    // --- STATE MANAGEMENT ---
    let currencySymbol = '$';
    let currentLang = 'en';
    const signaturePad = new SignaturePad(editor.signaturePadCanvas);

    // --- I18N & UI FUNCTIONS ---
    const setLanguage = (lang) => {
        currentLang = lang;
        document.querySelectorAll('[data-lang]').forEach(el => {
            const key = el.getAttribute('data-lang');
            if (translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });
        document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
            const key = el.getAttribute('data-lang-placeholder');
            if (translations[lang][key]) {
                el.placeholder = translations[lang][key];
            }
        });
        document.querySelectorAll('[data-lang-preview]').forEach(el => {
            const key = el.getAttribute('data-lang-preview');
            if (translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
        // Update item placeholders
        editor.itemsEditorList.querySelectorAll('.item-description').forEach(item => {
            item.placeholder = translations[lang].itemDescriptionPlaceholder;
        });
        updatePreview(); // Ensure preview is updated immediately after language change
    };

    const resizeCanvas = () => {
        const canvas = editor.signaturePadCanvas;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear();
    };

    const formatDisplayDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // --- CORE LOGIC ---
    const updatePreview = () => {
        preview.fromAddress.textContent = editor.fromAddress.value;
        preview.toAddress.textContent = editor.toAddress.value;
        preview.invoiceNumber.textContent = `${translations[currentLang].invoiceNumberLabel} ${editor.invoiceNumber.value}`;
        preview.invoiceDate.textContent = formatDisplayDate(editor.invoiceDate.value);
        preview.dueDate.textContent = formatDisplayDate(editor.dueDate.value);
        preview.notes.textContent = editor.notes.value;
        updateItemsAndTotals();
        if (!signaturePad.isEmpty()) {
            preview.signature.src = signaturePad.toDataURL();
        } else {
            preview.signature.src = '';
        }
    };

    const updateItemsAndTotals = () => {
        preview.itemsTable.innerHTML = '';
        let subtotal = 0;
        editor.itemsEditorList.querySelectorAll('.item-editor').forEach(itemRow => {
            const description = itemRow.querySelector('.item-description').value || '...';
            const quantity = parseFloat(itemRow.querySelector('.item-quantity').value) || 0;
            const rate = parseFloat(itemRow.querySelector('.item-rate').value) || 0;
            const total = quantity * rate;
            subtotal += total;
            const previewRow = document.createElement('tr');
            previewRow.className = 'border-b border-gray-200';
            previewRow.innerHTML = `
                <td class="p-3">${description}</td>
                <td class="p-3 text-center">${quantity}</td>
                <td class="p-3 text-right">${formatCurrency(rate)}</td>
                <td class="p-3 text-right">${formatCurrency(total)}</td>
            `;
            preview.itemsTable.appendChild(previewRow);
        });
        const taxRate = parseFloat(editor.taxRate.value) || 0;
        const taxAmount = subtotal * (taxRate / 100);
        const totalAmount = subtotal + taxAmount;
        preview.subtotal.textContent = formatCurrency(subtotal);
        preview.tax.textContent = formatCurrency(taxAmount);
        preview.total.textContent = formatCurrency(totalAmount);
    };

    const addItemEditorRow = () => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-editor grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded';
        itemDiv.innerHTML = `
            <input type="text" class="item-description col-span-5 p-2 border rounded" placeholder="${translations[currentLang].itemDescriptionPlaceholder}">
            <input type="number" class="item-quantity col-span-2 p-2 border rounded text-right" value="1" min="0">
            <input type="number" class="item-rate col-span-2 p-2 border rounded text-right" value="0.00" step="0.01" min="0">
            <span class="col-span-2 text-right text-gray-600 item-total">${formatCurrency(0)}</span>
            <button class="remove-item col-span-1 text-red-500 hover:text-red-700"><i class="fas fa-trash-alt"></i></button>
        `;
        editor.itemsEditorList.appendChild(itemDiv);
        updatePreview();
    };

    const handleItemInput = (e) => {
        const itemRow = e.target.closest('.item-editor');
        if (!itemRow) return;
        const quantity = parseFloat(itemRow.querySelector('.item-quantity').value) || 0;
        const rate = parseFloat(itemRow.querySelector('.item-rate').value) || 0;
        itemRow.querySelector('.item-total').textContent = formatCurrency(quantity * rate);
        updatePreview();
    };

    const resetForm = () => {
        if (confirm('Are you sure you want to reset everything?')) {
            document.querySelectorAll('input, textarea, select').forEach(el => {
                if (el.id !== 'language-select') el.value = '';
            });
            editor.itemsEditorList.innerHTML = '';
            editor.taxRate.value = '0';
            editor.currencySelect.selectedIndex = 0;
            signaturePad.clear();
            preview.logo.src = 'https://freemediatools.com/assets/images/pdf-invoice-editor-ultimate/logo.png';
            initialize();
        }
    };

    const downloadPDF = () => {
        const { jsPDF } = window.jspdf;
        const invoice = document.getElementById('invoice-preview');
        html2canvas(invoice, { scale: 3, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            let imgWidth = pdfWidth;
            let imgHeight = imgWidth / ratio;
            if (imgHeight > pdfHeight) {
                imgHeight = pdfHeight;
                imgWidth = imgHeight * ratio;
            }
            pdf.addImage(imgData, 'PNG', 5, 5, imgWidth - 10, imgHeight - 10);
            pdf.save(`invoice-${editor.invoiceNumber.value || 'download'}.pdf`);
        });
    };

    const formatCurrency = (amount) => `${currencySymbol}${amount.toFixed(2)}`;
    const setDate = (element) => {
        const today = new Date().toISOString().split('T')[0];
        element.value = today;
    };

    // --- EVENT LISTENERS ---
    window.addEventListener('resize', resizeCanvas);
    editor.languageSelect.addEventListener('change', (e) => setLanguage(e.target.value));
    editor.addItemBtn.addEventListener('click', addItemEditorRow);
    editor.resetBtn.addEventListener('click', resetForm);
    editor.downloadBtn.addEventListener('click', downloadPDF);
    editor.itemsEditorList.addEventListener('input', handleItemInput);
    editor.itemsEditorList.addEventListener('click', (e) => {
        if (e.target.closest('.remove-item')) {
            e.target.closest('.item-editor').remove();
            updatePreview();
        }
    });
    Object.values(editor).forEach(element => {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
            element.addEventListener('input', updatePreview);
        }
    });
    editor.logoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                preview.logo.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    signaturePad.addEventListener("endStroke", updatePreview);
    editor.clearSignatureBtn.addEventListener('click', () => {
        signaturePad.clear();
        updatePreview();
    });
    editor.currencySelect.addEventListener('change', (e) => {
        currencySymbol = e.target.options[e.target.selectedIndex].getAttribute('data-symbol');
        updatePreview();
    });

    // --- INITIALIZATION ---
    const initialize = () => {
        resizeCanvas();
        setDate(editor.invoiceDate);
        editor.invoiceNumber.value = 'INV-001';
        addItemEditorRow();
        setLanguage(currentLang); // This will also call updatePreview
    };

    initialize();
});