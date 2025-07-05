window.initSmsBlaster = function() {
    const pricePerSMS = 0.05;
    const responses = [];
    const smsForm = document.getElementById('smsForm');
    const responseContainer = document.getElementById('response');
    const exportButton = document.getElementById('exportButton');

    function calculateMessageDetails(messageContent, charCountElementId) {
        const charCount = messageContent.length;
        const isUnicode = /[^\u0000-\u007F]/.test(messageContent);
        const maxCharsPerMessage = isUnicode ? 70 : 160;
        const messageCount = charCount === 0 ? 0 : Math.ceil(charCount / maxCharsPerMessage);
        document.getElementById(charCountElementId).textContent = `${charCount} characters, ${messageCount} message(s)`;
        return messageCount;
    }

    function calculateTotalPrice() {
        const phoneNumbers = document.getElementById('phoneNumbers').value.split(',').filter(Boolean);
        const message1 = document.getElementById('message1').value || '';
        const message2 = document.getElementById('message2').value || '';
        let totalMessages = 0;
        if (message1.trim()) totalMessages += calculateMessageDetails(message1, 'charCount1');
        if (message2.trim()) totalMessages += calculateMessageDetails(message2, 'charCount2');
        const totalPrice = phoneNumbers.length * totalMessages * pricePerSMS;
        document.getElementById('totalPrice').textContent = `$${totalPrice.toFixed(2)}`;
    }
    
    // Mock send function for demonstration
    async function sendSMS(phone, content) {
        console.log(`Sending to ${phone}: ${content}`);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500)); 
        const success = Math.random() > 0.2; // 80% success rate for demo
        const responseMessage = success ? `OK - Message to ${phone} sent.` : `FAIL - Could not send to ${phone}.`;
        return { success, message: responseMessage };
    }
    
    smsForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const phoneNumbers = document.getElementById('phoneNumbers').value.split(',').filter(p => p.trim());
        const message1 = document.getElementById('message1').value.trim();
        const message2 = document.getElementById('message2').value.trim();
        const messageDelay = parseInt(document.getElementById('messageDelay').value, 10);
        const numberDelay = parseInt(document.getElementById('numberDelay').value, 10);

        if (!phoneNumbers.length || (!message1 && !message2)) {
            alert("Please provide phone numbers and at least one message.");
            return;
        }

        responseContainer.innerHTML = ''; // Clear previous responses
        responses.length = 0;
        exportButton.disabled = true;

        for (let i = 0; i < phoneNumbers.length; i++) {
            const phone = phoneNumbers[i].trim();
            if (message1) {
                const res = await sendSMS(phone, message1);
                const color = res.success ? 'text-green-600' : 'text-red-600';
                responseContainer.innerHTML += `<p class="${color}">#${i + 1}: ${res.message}</p>`;
                responses.push(`#${i + 1}: ${res.message}`);
            }
            if (message2) {
                await new Promise(resolve => setTimeout(resolve, messageDelay));
                const res = await sendSMS(phone, message2);
                const color = res.success ? 'text-green-600' : 'text-red-600';
                responseContainer.innerHTML += `<p class="${color}">#${i + 1} (Msg 2): ${res.message}</p>`;
                responses.push(`#${i + 1} (Msg 2): ${res.message}`);
            }
            if (i < phoneNumbers.length - 1) {
                await new Promise(resolve => setTimeout(resolve, numberDelay));
            }
        }
        exportButton.disabled = false;
        alert("All messages processed!");
    });
    
    exportButton.addEventListener('click', () => {
        if (responses.length === 0) return;
        const blob = new Blob([responses.join('\n')], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'sms_responses.txt';
        link.click();
    });

    // Attach event listeners for dynamic calculation
    document.getElementById('phoneNumbers').addEventListener('input', function () {
        const phoneCount = this.value.split(',').filter(Boolean).length;
        document.getElementById('phoneCount').textContent = `${phoneCount} phone number(s)`;
        calculateTotalPrice();
    });
    ['message1', 'message2'].forEach((id, index) => {
        document.getElementById(id).addEventListener('input', function() {
            calculateMessageDetails(this.value, `charCount${index + 1}`);
            calculateTotalPrice();
        });
    });

    // Initial calculation
    calculateTotalPrice();
};
