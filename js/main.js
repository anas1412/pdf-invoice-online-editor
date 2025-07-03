document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT SELECTORS ---
    const editor = {
        languageSelect: document.getElementById('language-select'),
        saveStatus: document.getElementById('save-status'),
        downloadBtn: document.getElementById('download-invoice'),
        resetBtn: document.getElementById('reset-form'),
        logoUpload: document.getElementById('logo-upload'),
        showLogo: document.getElementById('show-logo'),
        fromAddress: document.getElementById('from-address'),
        toAddress: document.getElementById('to-address'),
        invoiceNumber: document.getElementById('invoice-number'),
        invoiceDate: document.getElementById('invoice-date'),
        dueDate: document.getElementById('due-date'),
        showPaymentTerms: document.getElementById('show-payment-terms'),
        paymentTerms: document.getElementById('payment-terms'),
        itemsEditorList: document.getElementById('invoice-items-editor-list'),
        addItemBtn: document.getElementById('add-item'),
        currencySelect: document.getElementById('currency'),
        taxRate: document.getElementById('tax-rate'),
        notes: document.getElementById('notes'),
        signaturePadCanvas: document.getElementById('signature-pad'),
        showSignature: document.getElementById('show-signature'),
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
        paymentTermsContainer: document.getElementById('payment-terms-preview-container'),
        paymentTerms: document.getElementById('payment-terms-preview'),
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
            paymentTerms: "Payment Terms",
            invoiceItems: "Invoice Items",
            addItem: "Add Item",
            currency: "Currency",
            taxRate: "Tax Rate (%)",
            notes: "Notes",
            notesPlaceholder: "Any additional information...",
            signature: "Signature",
            clearSignature: "Clear Signature",
            livePreview: "Live Preview",
            show: "Show",
            previewPaymentTerms: "Payment Terms:",
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
            paymentTerms: "Conditions de paiement",
            invoiceItems: "Articles de la facture",
            addItem: "Ajouter un article",
            currency: "Devise",
            taxRate: "Taux de taxe (%)",
            notes: "Notes",
            notesPlaceholder: "Toute information additionnelle...",
            signature: "Signature",
            clearSignature: "Effacer la signature",
            livePreview: "Aperçu en direct",
            show: "Afficher",
            previewPaymentTerms: "Conditions de paiement:",
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
    let saveTimeout;

    // --- LOCAL STORAGE & STATE ---
    const showSaveStatus = () => {
        clearTimeout(saveTimeout);
        editor.saveStatus.style.opacity = '1';
        saveTimeout = setTimeout(() => {
            editor.saveStatus.style.opacity = '0';
        }, 1500);
    };

    const saveState = () => {
        const items = [];
        editor.itemsEditorList.querySelectorAll('.item-editor').forEach(itemRow => {
            items.push({
                description: itemRow.querySelector('.item-description').value,
                quantity: itemRow.querySelector('.item-quantity').value,
                rate: itemRow.querySelector('.item-rate').value,
            });
        });

        const state = {
            fromAddress: editor.fromAddress.value,
            toAddress: editor.toAddress.value,
            invoiceNumber: editor.invoiceNumber.value,
            invoiceDate: editor.invoiceDate.value,
            dueDate: editor.dueDate.value,
            paymentTerms: editor.paymentTerms.value,
            notes: editor.notes.value,
            taxRate: editor.taxRate.value,
            currency: editor.currencySelect.value,
            lang: editor.languageSelect.value,
            items: items,
            signature: signaturePad.toDataURL(),
            showLogo: editor.showLogo.checked,
            showSignature: editor.showSignature.checked,
            showPaymentTerms: editor.showPaymentTerms.checked,
            logo: preview.logo.src.includes('data:image') ? preview.logo.src : null,
        };

        localStorage.setItem('invoiceState', JSON.stringify(state));
        showSaveStatus();
    };

    const loadState = () => {
        const state = JSON.parse(localStorage.getItem('invoiceState'));
        if (!state) return false;

        editor.fromAddress.value = state.fromAddress || '';
        editor.toAddress.value = state.toAddress || '';
        editor.invoiceNumber.value = state.invoiceNumber || 'INV-001';
        editor.invoiceDate.value = state.invoiceDate || '';
        editor.dueDate.value = state.dueDate || '';
        editor.paymentTerms.value = state.paymentTerms || 'Net 30';
        editor.notes.value = state.notes || '';
        editor.taxRate.value = state.taxRate || '0';
        editor.currencySelect.value = state.currency || 'USD';
        editor.languageSelect.value = state.lang || 'en';
        
        editor.showLogo.checked = state.showLogo !== false;
        editor.showSignature.checked = state.showSignature !== false;
        editor.showPaymentTerms.checked = state.showPaymentTerms !== false;

        if (state.logo) {
            preview.logo.src = state.logo;
        }
        if (state.signature) {
            signaturePad.fromDataURL(state.signature);
        }

        editor.itemsEditorList.innerHTML = '';
        if (state.items && state.items.length > 0) {
            state.items.forEach(item => addItemEditorRow(item));
        } else {
            addItemEditorRow();
        }
        
        return true; // State was loaded
    };

    // --- I18N & UI FUNCTIONS ---
    const setLanguage = (lang) => {
        currentLang = lang;
        document.querySelectorAll('[data-lang]').forEach(el => {
            const key = el.getAttribute('data-lang');
            if (translations[lang][key]) el.innerHTML = translations[lang][key];
        });
        document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
            const key = el.getAttribute('data-lang-placeholder');
            if (translations[lang][key]) el.placeholder = translations[lang][key];
        });
        document.querySelectorAll('[data-lang-preview]').forEach(el => {
            const key = el.getAttribute('data-lang-preview');
            if (translations[lang][key]) el.textContent = translations[lang][key];
        });
        editor.itemsEditorList.querySelectorAll('.item-description').forEach(item => {
            item.placeholder = translations[lang].itemDescriptionPlaceholder;
        });
        updatePreview();
    };

    const resizeCanvas = () => {
        const canvas = editor.signaturePadCanvas;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear();
    };

    // --- CORE LOGIC ---
    const updatePreview = () => {
        preview.fromAddress.textContent = editor.fromAddress.value;
        preview.toAddress.textContent = editor.toAddress.value;
        preview.invoiceNumber.textContent = `${translations[currentLang].invoiceNumberLabel} ${editor.invoiceNumber.value}`;
        preview.invoiceDate.textContent = editor.invoiceDate.value;
        preview.dueDate.textContent = editor.dueDate.value;
        preview.notes.textContent = editor.notes.value;
        preview.paymentTerms.textContent = editor.paymentTerms.value;

        preview.logo.style.display = editor.showLogo.checked ? 'block' : 'none';
        preview.signature.parentElement.style.display = editor.showSignature.checked ? 'block' : 'none';
        preview.paymentTermsContainer.style.display = editor.showPaymentTerms.checked ? 'block' : 'none';

        updateItemsAndTotals();
        if (!signaturePad.isEmpty()) {
            preview.signature.src = signaturePad.toDataURL();
        } else {
            preview.signature.src = '';
        }
        saveState();
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

    const addItemEditorRow = (item = {}) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-editor grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded';
        const total = (item.quantity || 1) * (item.rate || 0);
        itemDiv.innerHTML = `
            <input type="text" class="item-description col-span-5 p-2 border rounded" placeholder="${translations[currentLang].itemDescriptionPlaceholder}" value="${item.description || ''}">
            <input type="number" class="item-quantity col-span-2 p-2 border rounded text-right" value="${item.quantity || 1}" min="0">
            <input type="number" class="item-rate col-span-2 p-2 border rounded text-right" value="${item.rate || '0.00'}" step="0.01" min="0">
            <span class="col-span-2 text-right text-gray-600 item-total">${formatCurrency(total)}</span>
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
        if (confirm('Are you sure you want to reset everything? This will clear all saved data.')) {
            localStorage.removeItem('invoiceState');
            document.querySelectorAll('input, textarea, select').forEach(el => {
                if (el.type === 'checkbox') el.checked = true;
                else if (el.id !== 'language-select') el.value = '';
            });
            editor.itemsEditorList.innerHTML = '';
            editor.taxRate.value = '0';
            editor.currencySelect.selectedIndex = 0;
            signaturePad.clear();
            preview.logo.src = 'https://freemediatools.com/assets/images/pdf-invoice-editor-ultimate/logo.png';
            initialize(true); // Pass true to skip loading state
        }
    };

    const downloadPDF = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const PADDING = 15;
        const PAGE_WIDTH = doc.internal.pageSize.getWidth();
        const addWrappedText = (text, x, y, options) => {
            const lines = doc.splitTextToSize(text, options.maxWidth || (PAGE_WIDTH - PADDING * 2));
            doc.text(lines, x, y);
            return doc.getTextDimensions(lines).h;
        };

        if (editor.showLogo.checked && preview.logo.src && !preview.logo.src.includes('placeholder')) {
            try {
                doc.addImage(preview.logo, 'PNG', PADDING, PADDING, 40, 20);
            } catch (e) { console.error("Error adding logo image:", e); }
        }
        
        doc.setFontSize(30).setFont(undefined, 'bold');
        doc.text(translations[currentLang].invoice.toUpperCase(), PAGE_WIDTH - PADDING, PADDING + 15, { align: 'right' });
        doc.setFontSize(12).setFont(undefined, 'normal');
        doc.text(`${translations[currentLang].invoiceNumberLabel} ${editor.invoiceNumber.value}`, PAGE_WIDTH - PADDING, PADDING + 22, { align: 'right' });

        let yPos = PADDING + 40;
        doc.setFontSize(10);
        addWrappedText(editor.fromAddress.value, PADDING, yPos, { maxWidth: 80 });
        doc.setFont(undefined, 'bold');
        doc.text(translations[currentLang].billedTo.toUpperCase(), PAGE_WIDTH / 2, yPos);
        doc.setFont(undefined, 'normal');
        addWrappedText(editor.toAddress.value, PAGE_WIDTH / 2, yPos + 5, { maxWidth: 80 });

        yPos += 30;
        doc.text(`${translations[currentLang].invoiceDate} ${editor.invoiceDate.value}`, PAGE_WIDTH - PADDING, yPos, { align: 'right' });
        doc.text(`${translations[currentLang].previewDueDate} ${editor.dueDate.value}`, PAGE_WIDTH - PADDING, yPos + 7, { align: 'right' });
        if (editor.showPaymentTerms.checked && editor.paymentTerms.value) {
            doc.text(`${translations[currentLang].previewPaymentTerms} ${editor.paymentTerms.value}`, PAGE_WIDTH - PADDING, yPos + 14, { align: 'right' });
        }
        yPos += 20;

        const tableHead = [[translations[currentLang].description, translations[currentLang].qty, translations[currentLang].unitPrice, translations[currentLang].total]];
        const tableBody = [];
        let subtotal = 0;
        editor.itemsEditorList.querySelectorAll('.item-editor').forEach(itemRow => {
            const description = itemRow.querySelector('.item-description').value || '...';
            const quantity = parseFloat(itemRow.querySelector('.item-quantity').value) || 0;
            const rate = parseFloat(itemRow.querySelector('.item-rate').value) || 0;
            const total = quantity * rate;
            subtotal += total;
            tableBody.push([description, quantity, formatCurrency(rate), formatCurrency(total)]);
        });

        doc.autoTable({ startY: yPos, head: tableHead, body: tableBody, theme: 'striped', headStyles: { fillColor: [34, 34, 34] }, styles: { fontSize: 10 }, columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } } });

        yPos = doc.autoTable.previous.finalY + 10;
        const taxRate = parseFloat(editor.taxRate.value) || 0;
        const taxAmount = subtotal * (taxRate / 100);
        const totalAmount = subtotal + taxAmount;
        const totalsX = PAGE_WIDTH - PADDING - 50;
        doc.setFontSize(12);
        doc.text(`${translations[currentLang].subtotal}:`, totalsX, yPos, { align: 'left' });
        doc.text(formatCurrency(subtotal), PAGE_WIDTH - PADDING, yPos, { align: 'right' });
        doc.text(`${translations[currentLang].tax} (${taxRate}%):`, totalsX, yPos + 7, { align: 'left' });
        doc.text(formatCurrency(taxAmount), PAGE_WIDTH - PADDING, yPos + 7, { align: 'right' });
        doc.setFont(undefined, 'bold');
        doc.text(`${translations[currentLang].total}:`, totalsX, yPos + 14, { align: 'left' });
        doc.text(formatCurrency(totalAmount), PAGE_WIDTH - PADDING, yPos + 14, { align: 'right' });
        doc.setFont(undefined, 'normal');

        yPos = Math.max(yPos + 30, doc.internal.pageSize.getHeight() - 50);
        if (editor.notes.value) {
            doc.setFontSize(10).setFont(undefined, 'bold');
            doc.text(translations[currentLang].previewNotes.toUpperCase(), PADDING, yPos);
            doc.setFont(undefined, 'normal');
            addWrappedText(editor.notes.value, PADDING, yPos + 5, { maxWidth: 120 });
        }

        if (editor.showSignature.checked && !signaturePad.isEmpty()) {
            const sigImgData = signaturePad.toDataURL('image/png');
            const sigCanvas = editor.signaturePadCanvas;
            const sigRatio = sigCanvas.width / sigCanvas.height;
            const sigMaxWidth = 60;
            const sigHeight = sigMaxWidth / sigRatio;
            const sigX = PAGE_WIDTH - PADDING - sigMaxWidth;
            doc.addImage(sigImgData, 'PNG', sigX, yPos, sigMaxWidth, sigHeight);
            const lineY = yPos + sigHeight + 2;
            doc.line(sigX, lineY, sigX + sigMaxWidth, lineY);
            doc.text(translations[currentLang].previewSignature, sigX, lineY + 5);
        }

        doc.save(`invoice-${editor.invoiceNumber.value || 'download'}.pdf`);
    };

    const formatCurrency = (amount) => `${currencySymbol}${amount.toFixed(2)}`;

    // --- EVENT LISTENERS ---
    window.addEventListener('resize', resizeCanvas);
    editor.languageSelect.addEventListener('change', (e) => setLanguage(e.target.value));
    editor.addItemBtn.addEventListener('click', () => addItemEditorRow());
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
                updatePreview();
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
    const initialize = (skipLoad = false) => {
        const fpConfig = { dateFormat: "d/m/Y" };
        flatpickr(editor.invoiceDate, { ...fpConfig, defaultDate: "today" });
        flatpickr(editor.dueDate, fpConfig);
        resizeCanvas();

        if (!skipLoad && loadState()) {
            // State loaded, now update UI to reflect it
            setLanguage(editor.languageSelect.value);
            updatePreview();
        } else {
            // No state or reset, initialize fresh
            editor.paymentTerms.value = "Net 30";
            editor.invoiceNumber.value = 'INV-001';
            addItemEditorRow();
            setLanguage('en');
        }
    };

    initialize();
});