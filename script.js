document.addEventListener('DOMContentLoaded', () => { 
    const shopTypeSelect = document.getElementById('shopTypeSelect');
    const regionSelect = document.getElementById('regionSelect');
    const provinceSelect = document.getElementById('provinceSelect');
    const districtSelect = document.getElementById('districtSelect');
    const pharmacyListDiv = document.getElementById('pharmacyList');
    const searchButton = document.getElementById('searchButton');

    let allPharmacies = [];
    const jsonFilePath = 'pharmacies.json'; // ชื่อไฟล์ข้อมูล

    fetch(jsonFilePath)
        .then(r => r.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                allPharmacies = data;
                populateShopTypes();
                displayInitialMessage();
            }
        })
        .catch(() => {
        });

    function displayInitialMessage() {
        pharmacyListDiv.innerHTML = '<p class="initial-message">กรุณาเลือกประเภทร้านค้า ภาค จังหวัด และอำเภอ เพื่อแสดงร้าน</p>';
    }

    function populateShopTypes() {
        const types = [];
        for (let i = 0; i < allPharmacies.length; i++) {
            const t = allPharmacies[i].ประเภทร้านค้า;
            if (t && types.indexOf(t) === -1) {
                types.push(t);
            }
        }
        types.sort();

        shopTypeSelect.innerHTML = '<option value="">-- เลือกประเภทร้านค้า --</option>';
        for (let i = 0; i < types.length; i++) {
            const option = document.createElement('option');
            option.value = types[i];
            option.textContent = types[i];
            shopTypeSelect.appendChild(option);
        }

        shopTypeSelect.disabled = false;
        regionSelect.disabled = true;
        provinceSelect.disabled = true;
        districtSelect.disabled = true;
    }

    function populateRegions() {
        const selectedShopType = shopTypeSelect.value;
        const regions = [];
        for (let i = 0; i < allPharmacies.length; i++) {
            const p = allPharmacies[i];
            if ((!selectedShopType || p.ประเภทร้านค้า === selectedShopType) && p.ภาค) {
                if (regions.indexOf(p.ภาค) === -1) {
                    regions.push(p.ภาค);
                }
            }
        }
        regions.sort();

        regionSelect.innerHTML = '<option value="">-- เลือกภาค --</option>';
        for (let i = 0; i < regions.length; i++) {
            const option = document.createElement('option');
            option.value = regions[i];
            option.textContent = regions[i];
            regionSelect.appendChild(option);
        }

        if (selectedShopType) {
            regionSelect.disabled = false;
        } else {
            regionSelect.disabled = true;
        }
        provinceSelect.disabled = true;
        districtSelect.disabled = true;
    }

    function populateProvinces(selectedRegion) {
        const selectedShopType = shopTypeSelect.value;
        provinceSelect.innerHTML = '<option value="">-- เลือกจังหวัด --</option>';
        districtSelect.innerHTML = '<option value="">-- เลือกอำเภอ --</option>';
        districtSelect.disabled = true;

        if (selectedRegion) {
            const provinces = [];
            for (let i = 0; i < allPharmacies.length; i++) {
                const p = allPharmacies[i];
                if ((!selectedShopType || p.ประเภทร้านค้า === selectedShopType) && p.ภาค === selectedRegion && p.จังหวัด) {
                    if (provinces.indexOf(p.จังหวัด) === -1) {
                        provinces.push(p.จังหวัด);
                    }
                }
            }
            provinces.sort();

            for (let i = 0; i < provinces.length; i++) {
                const option = document.createElement('option');
                option.value = provinces[i];
                option.textContent = provinces[i];
                provinceSelect.appendChild(option);
            }
            provinceSelect.disabled = false;
        } else {
            provinceSelect.disabled = true;
        }
    }

    function populateDistricts(selectedProvince) {
        const selectedShopType = shopTypeSelect.value;
        districtSelect.innerHTML = '<option value="">-- เลือกอำเภอ --</option>';

        if (selectedProvince) {
            const districts = [];
            for (let i = 0; i < allPharmacies.length; i++) {
                const p = allPharmacies[i];
                if ((!selectedShopType || p.ประเภทร้านค้า === selectedShopType) && p.จังหวัด === selectedProvince && p.อำเภอ) {
                    if (districts.indexOf(p.อำเภอ) === -1) {
                        districts.push(p.อำเภอ);
                    }
                }
            }
            districts.sort();

            for (let i = 0; i < districts.length; i++) {
                const option = document.createElement('option');
                option.value = districts[i];
                option.textContent = districts[i];
                districtSelect.appendChild(option);
            }
            districtSelect.disabled = false;
        } else {
            districtSelect.disabled = true;
        }
    }

    function displayPharmacies() {
        const selectedShopType = shopTypeSelect.value;
        const selectedRegion = regionSelect.value;
        const selectedProvince = provinceSelect.value;
        const selectedDistrict = districtSelect.value;

        if (!selectedShopType || !selectedRegion || !selectedProvince || !selectedDistrict) {
            pharmacyListDiv.innerHTML = '<p class="initial-message">กรุณาเลือกประเภทร้านค้า ภาค จังหวัด และอำเภอ ครบถ้วน</p>';
            return;
        }

        const filtered = [];
        for (let i = 0; i < allPharmacies.length; i++) {
            const p = allPharmacies[i];
            if (
                p.ประเภทร้านค้า === selectedShopType &&
                p.ภาค === selectedRegion &&
                p.จังหวัด === selectedProvince &&
                p.อำเภอ === selectedDistrict
            ) {
                filtered.push(p);
            }
        }

        pharmacyListDiv.innerHTML = '';

        if (filtered.length > 0) {
            for (let i = 0; i < filtered.length; i++) {
                const pharmacy = filtered[i];
                const card = document.createElement('div');
                card.className = 'pharmacy-card';

                const pharmacyName = pharmacy.ชื่อร้านยา || 'ไม่ระบุชื่อ';
                const address = pharmacy.ที่อยู่ || 'ไม่ระบุที่อยู่';
                const shopType = pharmacy.ประเภทร้านค้า || 'ไม่ระบุ';
                const region = pharmacy.ภาค || 'ไม่ระบุ';
                const province = pharmacy.จังหวัด || 'ไม่ระบุ';
                const district = pharmacy.อำเภอ || 'ไม่ระบุ';
                const phone = pharmacy.เบอร์โทร || '-';

                const mapUrl = createGoogleMapsUrl(pharmacy);

                const mapIconSvg = `
                    <svg class="map-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                    </svg>
                `;

                const phones = (phone + '').split(' / ');
                for (let j = 0; j < phones.length; j++) {
                    phones[j] = phones[j].replace(/\s/g, '');
                }
                const phoneLinksHtml = phones.map((p) => `<a href="tel:${p}" class="phone-link">${p}</a>`).join(' / ');

                card.innerHTML = `
                    <h3>${pharmacyName}</h3>
                    <p><strong>ประเภทร้านค้า:</strong> ${shopType}</p>
                    <p><strong>ที่อยู่:</strong> ${address}</p>
                    <p><strong>ภาค:</strong> ${region}</p>
                    <p><strong>จังหวัด:</strong> ${province}</p>
                    <p><strong>อำเภอ:</strong> ${district}</p>
                    <p><strong>เบอร์โทร:</strong> ${phoneLinksHtml}</p>
                    <a href="${mapUrl}" target="_blank" class="map-link">
                        ${mapIconSvg}
                    </a>
                `;
                pharmacyListDiv.appendChild(card);
            }
        } else {
            pharmacyListDiv.innerHTML = '';
        }
    }

    function clearPharmacyList() {
        pharmacyListDiv.innerHTML = '';
    }

    function createGoogleMapsUrl(pharmacy) {
        const lat = pharmacy.latitude;
        const lon = pharmacy.longitude;
        const name = pharmacy.ชื่อร้านยา || '';
        const province = pharmacy.จังหวัด || '';
        const district = pharmacy.อำเภอ || '';

        if (lat && lon && lat !== '' && lon !== '') {
            return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
        } else {
            const searchQuery = encodeURIComponent(`${name} ${district} ${province}`); // พังบ่อยซะเหลือเกินอย่าแตะมันนะ
            return `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
        }
    }

    shopTypeSelect.addEventListener('change', () => {
        regionSelect.value = '';
        provinceSelect.value = '';
        districtSelect.value = '';
        clearPharmacyList();

        if (shopTypeSelect.value) {
            populateRegions();
        } else {
            regionSelect.disabled = true;
            provinceSelect.disabled = true;
            districtSelect.disabled = true;
        }
    });

    regionSelect.addEventListener('change', () => {
        provinceSelect.value = '';
        districtSelect.value = '';
        clearPharmacyList();

        if (regionSelect.value) {
            populateProvinces(regionSelect.value);
        } else {
            provinceSelect.disabled = true;
            districtSelect.disabled = true;
        }
    });

    provinceSelect.addEventListener('change', () => {
        districtSelect.value = '';
        clearPharmacyList();

        if (provinceSelect.value) {
            populateDistricts(provinceSelect.value);
        } else {
            districtSelect.disabled = true;
        }
    });

    districtSelect.addEventListener('change', () => {
        clearPharmacyList();
    });

    searchButton.addEventListener('click', displayPharmacies);
});
