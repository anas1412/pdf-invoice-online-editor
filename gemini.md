# Gemini Project Maintenance Guide

This document provides a technical overview of the PDF Invoice Editor project for maintenance and future development purposes.

## 1. Project Overview

A client-side, two-pane invoice generator. The left pane contains all user inputs (the "editor"), and the right pane shows a real-time, professional preview of the final invoice. The application is fully self-contained, requiring no backend or build tools, and generates lightweight, vector-based PDFs.

---

## 2. File Structure

-   `index.html`: The main and only HTML file. It defines the structure for the editor and preview panes and includes all necessary CDN links for styles and scripts.
-   `js/main.js`: The core of the application. It contains all the JavaScript logic for interactivity, state management, real-time preview updates, and native PDF generation.
-   `README.md`: The public-facing documentation for the GitHub repository.
-   `gemini.md`: This file, for internal project documentation.
-   `SCREENSHOT.png`: The screenshot used in the `README.md`.

---

## 3. Core Technologies & Libraries (All via CDN)

-   **Tailwind CSS:** Used for all styling. It's included directly via the CDN, so there is no build step.
-   **Flatpickr:** A lightweight and powerful date picker.
    -   **Reason:** Replaced the native browser `input[type="date"]` to ensure a consistent `dd/MM/yyyy` date format across all browsers and provide a better user experience.
    -   **Implementation:** Initialized in the `initialize` function in `main.js`.
-   **jsPDF:** The core library for creating PDF documents in JavaScript.
-   **jsPDF-AutoTable:** A `jsPDF` plugin for generating complex tables.
    -   **Reason:** Essential for building the invoice items table natively in the PDF, which is the key to keeping file sizes small.
-   **Signature Pad:** A library for creating smooth, responsive signature canvases.
    -   **Reason:** Provides a much better drawing experience than a standard HTML canvas implementation.
-   **Font Awesome:** Used for icons in the UI.

---

## 4. Core Logic Flow

The application's logic is centered around the `updatePreview()` function in `main.js`.

1.  **Initialization (`initialize` function):**
    -   The page loads.
    -   `flatpickr` is initialized on the date input fields.
    -   The signature pad canvas is resized correctly to prevent distortion.
    -   The default language is set (`setLanguage`).
    -   An initial item row is added (`addItemEditorRow`).
    -   The `setLanguage` function makes the final call to `updatePreview()` to render the initial state.

2.  **User Interaction:**
    -   A user changes any value in the editor pane (e.g., types in the "From" address, changes a quantity, checks a box).
    -   An `input` event listener is attached to all input elements in the editor.

3.  **Updating the Preview (`updatePreview` function):**
    -   The event listener triggers the `updatePreview()` function.
    -   This function reads the *current* value from every single input field in the editor pane.
    -   It then updates the corresponding elements in the preview pane. For example, `preview.fromAddress.textContent = editor.fromAddress.value;`.
    -   It toggles the visibility of the logo, signature, and payment terms based on the state of their respective checkboxes.
    -   It calls `updateItemsAndTotals()` to specifically handle the complex logic of recalculating the invoice table and the final totals.

4.  **PDF Generation (`downloadPDF` function):**
    -   The user clicks the "Download PDF" button.
    -   This function **does not** look at the preview pane. Instead, it reads the data directly from the **editor** input fields.
    -   It uses `jsPDF` and `jsPDF-AutoTable` to build a new PDF document from scratch, element by element.
    -   It checks the "Show Logo" and "Show Signature" toggles to decide whether to include those elements in the final document.
    -   This native generation process results in a high-quality, text-selectable, and extremely lightweight PDF file.