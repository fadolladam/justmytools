window.initTripPlanner = function() {
    // This function is called by dashboard.js once the DOM is ready.
    const tripPlannerSection = document.getElementById('trip-planner');
    if (!tripPlannerSection) return;

    // --- STATIC HOTEL DATA ---
    const makkahHotels = [
        { name: "Makkah Clock Royal Tower, A Fairmont Hotel", stars: 5, distance: "100m", price: 250, area: "Ajyad" },
        { name: "Pullman ZamZam Makkah", stars: 5, distance: "50m", price: 220, area: "Ajyad" },
        { name: "Al Marwa Rayhaan by Rotana", stars: 5, distance: "80m", price: 230, area: "Ajyad" },
        { name: "Jabal Omar Hyatt Regency Makkah", stars: 5, distance: "450m", price: 180, area: "Ajyad" },
        { name: "Swissôtel Makkah", stars: 5, distance: "150m", price: 210, area: "Ajyad" },
        { name: "Elaf Kinda Hotel", stars: 4, distance: "200m", price: 150, area: "Ajyad" },
    ];

    const madinahHotels = [
        { name: "Dar Al-Hijra InterContinental", stars: 5, distance: "300m", price: 200, area: "Haram Area" },
        { name: "Anwar Al Madinah Mövenpick Hotel", stars: 5, distance: "150m", price: 240, area: "Haram Area" },
        { name: "Shahd Al Madinah Hotel", stars: 5, distance: "200m", price: 190, area: "Haram Area" },
        { name: "Taiba Front Hotel", stars: 4, distance: "100m", price: 170, area: "Haram Area" },
        { name: "Dar Al Iman InterContinental", stars: 5, distance: "50m", price: 260, area: "Haram Area" },
    ];

    // --- DOM ELEMENT REFERENCES ---
    const departureDateInput = document.getElementById('departureDate');
    const returnDateInput = document.getElementById('returnDate');
    const adultQuantityInput = document.getElementById('adultQuantity');
    const childQuantityInput = document.getElementById('childQuantity');
    const dateButtonsContainer = document.getElementById('dateButtons');
    const hotelGuestsDisplay = document.getElementById('hotelGuestsDisplay');
    const madinahCheckinInput = document.getElementById('madinahCheckinDate');
    const madinahCheckoutInput = document.getElementById('madinahCheckoutDate');
    const makkahCheckinInput = document.getElementById('makkahCheckinDate');
    const makkahCheckoutInput = document.getElementById('makkahCheckoutDate');
    const logisticsDates = {
        leg1: document.getElementById('logisticsDate1'),
        leg2: document.getElementById('logisticsDate2'),
        leg3: document.getElementById('logisticsDate3'),
    };
    const costInputs = {
        flight: document.getElementById('costFlight'), visa: document.getElementById('costVisa'),
        madinahHotel: document.getElementById('costMadinahHotel'), makkahHotel: document.getElementById('costMakkahHotel'),
        transportJEDMD: document.getElementById('costTransportJEDMD'), transportMDMAK: document.getElementById('costTransportMDMAK'),
        transportMAKJED: document.getElementById('costTransportMAKJED'), ziyarat: document.getElementById('costZiyarat'),
        food: document.getElementById('costFood'), markup: document.getElementById('costMarkup'),
    };
    const roomOccupancyContainer = document.getElementById('roomOccupancy');
    const budgetOutputs = {
        netCostPerPerson: document.getElementById('netCostPerPerson'), finalPrice: document.getElementById('finalPrice'),
        breakdownFlight: document.getElementById('breakdownFlight'), breakdownHotels: document.getElementById('breakdownHotels'),
        breakdownVisa: document.getElementById('breakdownVisa'), breakdownTransport: document.getElementById('breakdownTransport'),
        breakdownFood: document.getElementById('breakdownFood'), breakdownMarkup: document.getElementById('breakdownMarkup'),
    };
    const makkahHotelListContainer = document.getElementById('makkahHotelList');
    const madinahHotelListContainer = document.getElementById('madinahHotelList');
    let currentOccupancy = 4;
    let itinerary = {};
    const logisticsLinks = {
        leg1: document.getElementById('logisticsLink1'),
        leg3: document.getElementById('logisticsLink3'),
    };

    // --- UTILITY FUNCTIONS ---
    const formatDate = (date) => date.toISOString().split('T')[0];
    const formatCurrency = (amount) => isNaN(amount) ? '$0.00' : amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const getVal = (el) => parseFloat(el.value) || 0;

    // --- NEW HOTEL RENDER FUNCTION ---
    function renderHotelList(hotelData, container) {
        if (!container) return;
        container.innerHTML = hotelData.map(hotel => {
            const starHtml = Array(hotel.stars).fill('<i class="fas fa-star text-yellow-400"></i>').join('');
            const emptyStarHtml = Array(5 - hotel.stars).fill('<i class="far fa-star text-yellow-400"></i>').join('');
            return `
                <div class="bg-white p-3 rounded-lg border shadow-sm flex items-center gap-4">
                    <img src="https://placehold.co/100x75/E2E8F0/4A5568?text=${hotel.name.split(' ')[0]}" alt="${hotel.name}" class="w-20 h-16 object-cover rounded-md flex-shrink-0">
                    <div class="flex-grow">
                        <h4 class="font-bold text-sm truncate">${hotel.name}</h4>
                        <div class="text-xs text-gray-500 flex items-center justify-between mt-1">
                            <span>${starHtml}${emptyStarHtml}</span>
                            <span class="font-semibold"><i class="fas fa-walking mr-1"></i>${hotel.distance}</span>
                        </div>
                        <div class="text-sm font-bold text-green-600 mt-1">~ $${hotel.price}/night</div>
                    </div>
                    <a href="https://www.google.com/search?q=${encodeURIComponent(hotel.name)}" target="_blank" class="bg-blue-500 text-white text-xs px-2 py-1 rounded-md hover:bg-blue-600 transition-colors">View</a>
                </div>
            `;
        }).join('');
    }

    // --- CORE LOGIC ---
    const calculateBudget = () => {
        try {
            const adults = getVal(adultQuantityInput);
            const children = getVal(childQuantityInput);
            const totalPassengers = adults + children;
            if (totalPassengers === 0) return;

            const flightCost = getVal(costInputs.flight);
            const visaCost = getVal(costInputs.visa);
            const foodCost = getVal(costInputs.food) * 10;
            const madinahHotelTotal = getVal(costInputs.madinahHotel);
            const makkahHotelTotal = getVal(costInputs.makkahHotel);
            const transportTotal = getVal(costInputs.transportJEDMD) + getVal(costInputs.transportMDMAK) + getVal(costInputs.transportMAKJED) + getVal(costInputs.ziyarat);
            const markup = getVal(costInputs.markup);
            
            const hotelCostPerPerson = (madinahHotelTotal + makkahHotelTotal) / currentOccupancy;
            const transportPerPerson = totalPassengers > 0 ? transportTotal / totalPassengers : 0;

            const netCost = flightCost + visaCost + foodCost + hotelCostPerPerson + transportPerPerson;
            const finalPrice = netCost + markup;

            budgetOutputs.netCostPerPerson.textContent = formatCurrency(netCost);
            budgetOutputs.breakdownFlight.textContent = formatCurrency(flightCost);
            budgetOutputs.breakdownHotels.textContent = formatCurrency(hotelCostPerPerson);
            budgetOutputs.breakdownVisa.textContent = formatCurrency(visaCost);
            budgetOutputs.breakdownTransport.textContent = formatCurrency(transportPerPerson);
            budgetOutputs.breakdownFood.textContent = formatCurrency(foodCost);
            budgetOutputs.breakdownMarkup.textContent = formatCurrency(markup);
            budgetOutputs.finalPrice.textContent = formatCurrency(finalPrice);
        } catch (error) {
            console.error("Error in calculateBudget:", error);
        }
    };

    const updateItinerary = () => {
        try {
            const dateString = departureDateInput.value;
            if (!dateString) {
                if (returnDateInput) returnDateInput.value = "";
                itinerary = {};
                return;
            }

            const parts = dateString.split('-');
            if (parts.length !== 3) return;

            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            const departureUTC = new Date(Date.UTC(year, month, day));

            if (isNaN(departureUTC.getTime())) return;

            const addDays = (date, days) => {
                const result = new Date(date);
                result.setUTCDate(result.getUTCDate() + days);
                return result;
            };

            itinerary = {
                departure: departureUTC,
                return: addDays(departureUTC, 12),
                madinahCheckin: addDays(departureUTC, 1),
                madinahCheckout: addDays(departureUTC, 4),
                makkahCheckin: addDays(departureUTC, 4),
                makkahCheckout: addDays(departureUTC, 11),
                airportDeparture: addDays(departureUTC, 11),
            };
            
            if (returnDateInput) returnDateInput.value = formatDate(itinerary.return);
            if (madinahCheckinInput) madinahCheckinInput.value = formatDate(itinerary.madinahCheckin);
            if (madinahCheckoutInput) madinahCheckoutInput.value = formatDate(itinerary.madinahCheckout);
            if (makkahCheckinInput) makkahCheckinInput.value = formatDate(itinerary.makkahCheckin);
            if (makkahCheckoutInput) makkahCheckoutInput.value = formatDate(itinerary.makkahCheckout);
            if (logisticsDates.leg1) logisticsDates.leg1.value = formatDate(itinerary.madinahCheckin);
            if (logisticsDates.leg2) logisticsDates.leg2.value = formatDate(itinerary.makkahCheckin);
            if (logisticsDates.leg3) logisticsDates.leg3.value = formatDate(itinerary.airportDeparture);

            if (hotelGuestsDisplay) {
                hotelGuestsDisplay.innerHTML = `Guests: <span class="font-bold">${adultQuantityInput.value}</span> Adult(s), <span class="font-bold">${childQuantityInput.value}</span> Child(ren)`;
            }
            
            const googleSearchBase = 'https://www.google.com/search?q=';
            logisticsLinks.leg1.href = `${googleSearchBase}transport+jeddah+airport+to+madinah+on+${formatDate(itinerary.madinahCheckin)}`;
            logisticsLinks.leg3.href = `${googleSearchBase}transport+makkah+to+jeddah+airport+on+${formatDate(itinerary.airportDeparture)}`;

            generateDateButtons();
            calculateBudget();
        } catch (error) {
            console.error("Error in updateItinerary:", error);
        }
    };

    const generateDateButtons = () => {
        dateButtonsContainer.innerHTML = '';
        if (!departureDateInput.value) return;
        const baseDepartureDate = new Date(`${departureDateInput.value}T12:00:00Z`);
        if (isNaN(baseDepartureDate.getTime())) return;

        for (let i = 1; i <= 5; i++) {
            const newDepartureDate = new Date(baseDepartureDate);
            newDepartureDate.setDate(baseDepartureDate.getDate() + i);
            const button = document.createElement('button');
            button.textContent = `+${i} Day`;
            button.className = 'px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors';
            button.onclick = () => window.open(createFlightSearchUrl(formatDate(newDepartureDate)), '_blank');
            dateButtonsContainer.appendChild(button);
        }
    };
    
    const createFlightSearchUrl = (departure) => {
        const returnDate = new Date(departure);
        returnDate.setDate(returnDate.getDate() + 12);
        return `https://us.trip.com/flights/showfarefirst?dcity=PNH&acity=JED&ddate=${departure}&rdate=${formatDate(returnDate)}&triptype=rt&class=y&lowpricesource=searchform&quantity=${adultQuantityInput.value}&childqty=${childQuantityInput.value}&searchboxarg=t&nonstoponly=off&locale=en-US&curr=USD`;
    };

    const createHotelSearchUrl = (city, checkin, checkout) => {
        const formattedCheckin = checkin.replace(/-/g, '/');
        const formattedCheckout = checkout.replace(/-/g, '/');
        return `https://us.trip.com/hotels/${city.toLowerCase()}-hotels/list?checkin=${formattedCheckin}&checkout=${formattedCheckout}&adult=${adultQuantityInput.value}&children=${childQuantityInput.value}&locale=en-US&curr=USD`;
    };

    // --- EVENT LISTENERS ---
    if(departureDateInput) departureDateInput.addEventListener('change', updateItinerary);
    if(adultQuantityInput) adultQuantityInput.addEventListener('input', updateItinerary);
    if(childQuantityInput) childQuantityInput.addEventListener('input', updateItinerary);
    Object.values(costInputs).forEach(el => { if(el) el.addEventListener('input', calculateBudget) });
    
    if(roomOccupancyContainer) roomOccupancyContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            currentOccupancy = parseInt(e.target.dataset.value, 10);
            roomOccupancyContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('bg-blue-100', 'text-blue-800'));
            e.target.classList.add('bg-blue-100', 'text-blue-800');
            calculateBudget();
        }
    });

    const flightForm = document.getElementById('flightForm');
    if(flightForm) flightForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (departureDateInput.value) window.open(createFlightSearchUrl(departureDateInput.value), '_blank');
        else alert('Please select a departure date first.');
    });

    const madinahHotelForm = document.getElementById('madinahHotelForm');
    if(madinahHotelForm) madinahHotelForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if(madinahCheckinInput.value) window.open(createHotelSearchUrl('Medina', madinahCheckinInput.value, madinahCheckoutInput.value), '_blank');
        else alert('Please select a departure date first.');
    });

    const makkahHotelForm = document.getElementById('makkahHotelForm');
    if(makkahHotelForm) makkahHotelForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if(makkahCheckinInput.value) window.open(createHotelSearchUrl('Makkah', makkahCheckinInput.value, makkahCheckoutInput.value), '_blank');
        else alert('Please select a departure date first.');
    });
    
    // --- INITIALIZATION ---
    const currentDateEl = document.getElementById('currentDate');
    if(currentDateEl) currentDateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    // Render the static hotel lists on initial load
    renderHotelList(makkahHotels, makkahHotelListContainer);
    renderHotelList(madinahHotels, madinahHotelListContainer);
    
    calculateBudget();
};
