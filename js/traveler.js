window.initTravelerForm = function() {
    console.log("initTravelerForm function started.");

    // Array to hold traveler data
    const travelersData = [];

    // NEW Google Sheet URL for CSV export.
    // IMPORTANT: Ensure this Google Sheet is publicly published to the web as a CSV.
    // Go to File > Share > Publish to web, select the specific sheet (e.g., 'visa'), and choose 'Comma-separated values (.csv)'.
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1H5d3E03a1fUUPvQ6pLMAa6nXV8EW6x2-Q3ioF__uaf8/export?format=csv&gid=1124322917';

    // DOM element references for messages and table
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessageSheet = document.getElementById('errorMessageSheet');
    const noTravelersMessage = document.getElementById('noTravelersMessage');
    const travelerDataTable = document.getElementById("travelerData");

    /**
     * Updates the traveler list table with current data.
     */
    function fillTravelerForm() {
        console.log("fillTravelerForm called. Current travelersData length:", travelersData.length);
        if (!travelerDataTable) {
            console.error("Traveler data table element (ID 'travelerData') not found!");
            return;
        }

        travelerDataTable.innerHTML = ""; // Clear existing rows

        if (travelersData.length === 0) {
            noTravelersMessage.classList.remove('hidden');
        } else {
            noTravelersMessage.classList.add('hidden');
        }

        travelersData.forEach((traveler, index) => {
            const row = document.createElement("tr");
            row.classList.add("hover:bg-gray-50", "transition-colors", "duration-150", "ease-in-out");

            // Use nullish coalescing to ensure empty strings instead of 'undefined'
            row.innerHTML = `
                <td class="py-3 px-4 border-b border-gray-200 text-sm">${traveler.firstName || ''}</td>
                <td class="py-3 px-4 border-b border-gray-200 text-sm">${traveler.familyName || ''}</td>
                <td class="py-3 px-4 border-b border-gray-200 text-sm">${traveler.nationality || ''}</td>
                <td class="py-3 px-4 border-b border-gray-200 text-sm">${traveler.birthDate || ''}</td>
                <td class="py-3 px-4 border-b border-gray-200 text-sm">${traveler.documentId || ''}</td>
                <td class="py-3 px-4 border-b border-gray-200 text-sm">${traveler.expireDate || ''}</td>
                <td class="py-3 px-4 border-b border-gray-200 text-sm">
                    <button class="text-red-500 hover:text-red-700 transition-colors duration-150 ease-in-out font-medium" onclick="window.travelerApp.removeTraveler(${index})">
                        <i class="fas fa-trash-alt mr-1"></i>Remove
                    </button>
                </td>
            `;
            travelerDataTable.appendChild(row);
        });
    }

    // Expose to global scope for inline onclick (for remove button)
    window.travelerApp = {
        removeTraveler: function(index) {
            console.log("Removing traveler at index:", index);
            travelersData.splice(index, 1);
            fillTravelerForm();
        }
    };

    /**
     * Fetches and parses CSV data from the Google Sheet URL.
     */
    async function loadTravelersFromSheet() {
        console.log("loadTravelersFromSheet function triggered. Attempting to load data from Google Sheet:", sheetUrl);
        loadingMessage.classList.remove('hidden');
        errorMessageSheet.classList.add('hidden');
        noTravelersMessage.classList.add('hidden'); // Hide "no travelers" message during loading

        try {
            const response = await fetch(sheetUrl);
            console.log("Fetch response received. Status:", response.status, response.statusText);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            const csvText = await response.text();
            console.log("CSV text received (first 500 chars):", csvText.substring(0, 500));
            parseCsvAndPopulate(csvText);
        } catch (error) {
            console.error("Error loading Google Sheet:", error);
            errorMessageSheet.classList.remove('hidden');
            noTravelersMessage.classList.remove('hidden'); // Show "no travelers" message if load fails
        } finally {
            loadingMessage.classList.add('hidden');
        }
    }

    /**
     * Parses CSV text and populates the travelersData array based on new column mappings.
     * Assumes CSV columns: B: Name, E: Nationality, F: DOB, G: PassportNum, H: PassportExp
     * @param {string} csvText - The CSV data as a string.
     */
    function parseCsvAndPopulate(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        console.log("CSV lines (filtered, count):", lines.length);

        if (lines.length <= 1) { // Only header or empty
            console.log("CSV has no data rows or only header. Clearing existing data.");
            travelersData.length = 0; // Clear existing data
            fillTravelerForm();
            return;
        }

        // Clear existing data before populating from sheet
        travelersData.length = 0;

        // Skip header row (first line)
        for (let i = 1; i < lines.length; i++) {
            // Use a simple regex to split by comma, but ignore commas inside double quotes
            const columns = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
            columns.forEach((col, idx) => columns[idx] = col ? col.replace(/"/g, '').trim() : ''); // Remove quotes and trim, handle null/undefined

            // console.log(`Processing line ${i}:`, lines[i], "-> Columns:", columns); // Uncomment for detailed debugging

            // Ensure we have enough columns for the new mapping (up to H, which is index 7)
            if (columns.length > 7) { // Check if column H (index 7) exists
                const name = columns[1] || ''; // Column B: Name (index 1)
                let firstName = '';
                let familyName = '';

                // Attempt to split name into first and family
                const nameParts = name.split(' ');
                if (nameParts.length > 1) {
                    firstName = nameParts[0];
                    familyName = nameParts.slice(1).join(' ');
                } else {
                    firstName = name; // If no space, whole name is first name
                }

                const nationality = columns[4] || ''; // Column E: Nationality (index 4)
                const dob = formatDateForInput(columns[5]) || ''; // Column F: DOB (index 5)
                const passportNum = columns[6] || ''; // Column G: PassportNum (index 6)
                const passportExp = formatDateForInput(columns[7]) || ''; // Column H: PassportExp (index 7)

                const newTraveler = {
                    firstName: firstName,
                    middleName: '', // Not available in sheet, default empty
                    familyName: familyName,
                    birthDate: dob,
                    gender: 'M', // Not available in sheet, default Male (can be updated manually if form was present)
                    documentType: 'Passport', // Assuming passport for simplicity
                    documentId: passportNum,
                    expireDate: passportExp,
                    nationality: nationality,
                    specialNeeds: false // Not available in sheet, default false
                };
                travelersData.push(newTraveler);
            } else {
                console.warn(`Skipping line ${i} due to insufficient columns or malformed data for new mapping (expected at least 8 columns, got ${columns.length}):`, lines[i], columns);
            }
        }
        fillTravelerForm();
        console.log("Travelers data after parsing (count):", travelersData.length, travelersData);
    }

    /**
     * Formats a date string (e.g., 'MM/DD/YYYY', 'DD-MM-YYYY', 'YYYY/MM/DD') to 'YYYY-MM-DD' for input[type="date"].
     * Handles various common date formats.
     * @param {string} dateString - The date string from the CSV.
     * @returns {string} The formatted date string or empty if invalid.
     */
    function formatDateForInput(dateString) {
        if (!dateString) return '';
        try {
            let date;
            // Attempt to parse with common delimiters and orderings
            if (dateString.includes('/')) {
                const parts = dateString.split('/');
                if (parts[2] && parts[2].length === 4) { // YYYY is present
                    // Heuristic: if first part > 12, assume DD/MM/YYYY
                    if (parseInt(parts[0], 10) > 12) { // DD/MM/YYYY
                        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                    } else { // MM/DD/YYYY
                        date = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
                    }
                } else { // Assume MM/DD or DD/MM without year, let Date constructor guess
                    date = new Date(dateString);
                }
            } else if (dateString.includes('-')) {
                const parts = dateString.split('-');
                if (parts[0].length === 4) { // YYYY-MM-DD
                    date = new Date(dateString);
                } else { // Assume DD-MM-YYYY
                    date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                }
            } else {
                // Try general parsing for other formats (e.g., "Jan 1, 2023")
                date = new Date(dateString);
            }

            if (isNaN(date.getTime())) {
                console.warn("Invalid date string for formatting (could not parse):", dateString);
                return ''; // Invalid date
            }
            // Return in YYYY-MM-DD format
            return date.toISOString().split('T')[0];
        } catch (e) {
            console.warn("Error formatting date string:", dateString, e);
            return '';
        }
    }

    // Automatically load data from Google Sheet when the traveler form is initialized
    loadTravelersFromSheet();
    console.log("initTravelerForm function finished.");
};
