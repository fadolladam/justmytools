window.initQrPayment = function() {
    // This function is called by dashboard.js once the DOM is ready.
    const qrPaymentSection = document.getElementById('qr-payment');
    if (!qrPaymentSection) return; // Exit if this section isn't on the page

    // UPDATED: This now contains all the bank data from your original file.
    const bankData = {
        aba: {
            title: "ABA Bank",
            qrCodes: [
                { img: "images/aba_account1.svg", text: "ABA USD 000 153 101" },
                { img: "images/aba_account2.svg", text: "ABA KHR 002 795 210" }
            ]
        },
        rhb: {
            title: "RHB Bank",
            qrCodes: [
                { img: "images/rhb_account1.svg", text: "RHB USD 2010 0010 0080 9457" },
                { img: "images/rhb_account2.svg", text: "RHB KHR 2000 0010 0018 1190" }
            ]
        },
        wing: {
            title: "Wing Bank",
            qrCodes: [
                { img: "images/wing_bank1.svg", text: "Wing USD 02359948" }
            ]
        },
        vatanac: {
            title: "Vatanac Bank",
            qrCodes: [
                { img: "images/vatanac_account1.svg", text: "Vatanac USD 05002550094444" }
            ]
        },
        cimb: {
            title: "CIMB Bank",
            qrCodes: [
                { img: "images/cimb_account1.svg", text: "CIMB KHR 2000122000089089" },
                { img: "images/cimb_account3.svg", text: "CIMB USD 2010121000600070" },
                { img: "images/cimb_account2.svg", text: "CIMB USD 2010121000054610" }
            ]
        },
        sathapana: {
            title: "Sathapana Bank",
            qrCodes: [
                { img: "images/sathapana_account1.svg", text: "Sathapana USD 00421930" },
                { img: "images/sathapana_account2.svg", text: "Sathapana KHR 00779213" }
            ]
        },
        kbprasac: {
            title: "KB Prasac Bank",
            qrCodes: [
                { img: "images/kbprasac_account1.svg", text: "KBP USD 981001220009262" },
            ]
        },
        chipmong: {
            title: "ChipMong Bank",
            qrCodes: [
                { img: "images/chipmong_account1.svg", text: "ChipMong USD 999556444" }
            ]
        }
    };

    const bankTitle = qrPaymentSection.querySelector("#bankTitle");
    const qrGrid = qrPaymentSection.querySelector("#qrGrid");
    const logoButtons = qrPaymentSection.querySelectorAll(".logo-button");
    const copyMessage = document.getElementById("copyMessage");
    const qrModal = document.getElementById("qrModal");
    const qrModalCloseBtn = document.getElementById("qrModalCloseBtn");
    const modalImage = document.getElementById("modalImage");
    const modalImageText = document.getElementById("modalImageText");
    
    function showTempMessage(message) {
        copyMessage.querySelector('span').textContent = message;
        copyMessage.classList.add('show');
        setTimeout(() => copyMessage.classList.remove('show'), 3000);
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showTempMessage('Account number copied!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert("Copy failed. Please try manually.");
        });
    }

    function openQrModal(imgSrc, imgText) {
        modalImage.src = imgSrc;
        modalImageText.textContent = imgText;
        qrModal.classList.remove('invisible', 'opacity-0');
        qrModal.querySelector('#qrModalContent').classList.add('scale-100');
    }

    function closeQrModal() {
        qrModal.classList.add('invisible', 'opacity-0');
        qrModal.querySelector('#qrModalContent').classList.remove('scale-100');
    }

    qrModalCloseBtn.addEventListener('click', closeQrModal);
    qrModal.addEventListener('click', (e) => { if (e.target === qrModal) closeQrModal(); });
    
    function renderQrCodes(data) {
        bankTitle.textContent = data.title;
        qrGrid.innerHTML = data.qrCodes.map(qr => `
            <div class="qr-card flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 group">
                <img src="${qr.img}" alt="${qr.text}" class="qr-image w-full max-w-[280px] h-auto rounded-lg border-2 border-gray-100 object-contain shadow-inner cursor-pointer" onerror="this.onerror=null;this.src='https://placehold.co/280x280?text=QR+Not+Found';">
                <div class="mt-5 flex items-center justify-center w-full">
                    <p class="text-lg font-semibold text-gray-800 text-center">${qr.text}</p>
                    <button class="copy-button p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ml-3" data-account-number="${qr.text}" title="Copy account number">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
        `).join('');

        qrGrid.querySelectorAll('.copy-button').forEach(b => b.addEventListener('click', (e) => {
            e.stopPropagation();
            copyToClipboard(b.dataset.accountNumber)
        }));
        qrGrid.querySelectorAll('.qr-image').forEach(img => img.addEventListener('click', () => openQrModal(img.src, img.alt)));
    }

    logoButtons.forEach(button => {
        button.addEventListener('click', () => {
            logoButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const bankKey = button.dataset.bank;
            const data = bankData[bankKey];
            if (data) renderQrCodes(data);
        });
    });
};
