document.addEventListener('DOMContentLoaded', () => {
    const shopTypeSelect = document.getElementById('shopTypeSelect');
    const regionSelect = document.getElementById('regionSelect');
    const provinceSelect = document.getElementById('provinceSelect');
    const districtSelect = document.getElementById('districtSelect');
    const pharmacyListDiv = document.getElementById('pharmacyList');
    const searchButton = document.getElementById('searchButton');

    let allPharmacies = [];
    const jsonFilePath = 'pharmacies.json';

    fetch(jsonFilePath)
        .then(response => {
            if (!response.ok) {
                console.error(`ข้อผิดพลาด HTTP: สถานะ ${response.status}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                allPharmacies = data;
                populateShopTypes();
                displayInitialMessage();
            } else {
                pharmacyListDiv.innerHTML = '<p class="error-message">ไม่พบข้อมูลร้านยาในไฟล์ หรือข้อมูลไม่ถูกต้อง</p>';
            }
        })
        .catch(error => {
            console.error('เกิดข้อผิดพลาด:', error);
            pharmacyListDiv.innerHTML = '<p class="error-message">ไม่สามารถโหลดข้อมูลร้านยาได้ กรุณาลองใหม่อีกครั้ง</p>';
        });

    function displayInitialMessage() {
        pharmacyListDiv.innerHTML = '<p class="initial-message">กรุณาเลือกประเภทร้านค้า ภาค จังหวัด และอำเภอ เพื่อแสดงร้าน</p>';
    }

    function populateShopTypes() {
        const shopTypes = [...new Set(allPharmacies.map(p => p.ประเภทร้านค้า).filter(Boolean))].sort();
        shopTypeSelect.innerHTML = '<option value="">-- เลือกประเภทร้านค้า --</option>';
        shopTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            shopTypeSelect.appendChild(option);
        });
        shopTypeSelect.disabled = false;
        regionSelect.disabled = true;
        provinceSelect.disabled = true;
        districtSelect.disabled = true;
    }

    function populateRegions() {
        const selectedShopType = shopTypeSelect.value;
        const regions = [...new Set(allPharmacies
            .filter(p => !selectedShopType || p.ประเภทร้านค้า === selectedShopType)
            .map(p => p.ภาค)
            .filter(Boolean))].sort();

        regionSelect.innerHTML = '<option value="">-- เลือกภาค --</option>';
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        });

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
            const provinces = [...new Set(allPharmacies
                .filter(p => (!selectedShopType || p.ประเภทร้านค้า === selectedShopType) && p.ภาค === selectedRegion)
                .map(p => p.จังหวัด)
                .filter(Boolean)
            )].sort();

            provinces.forEach(province => {
                const option = document.createElement('option');
                option.value = province;
                option.textContent = province;
                provinceSelect.appendChild(option);
            });
            provinceSelect.disabled = false;
        } else {
            provinceSelect.disabled = true;
        }
    }

    function populateDistricts(selectedProvince) {
        const selectedShopType = shopTypeSelect.value;
        districtSelect.innerHTML = '<option value="">-- เลือกอำเภอ --</option>';

        if (selectedProvince) {
            const districts = [...new Set(allPharmacies
                .filter(p => (!selectedShopType || p.ประเภทร้านค้า === selectedShopType) && p.จังหวัด === selectedProvince)
                .map(p => p.อำเภอ)
                .filter(Boolean)
            )].sort();

            districts.forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                districtSelect.appendChild(option);
            });
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

        const filteredPharmacies = allPharmacies.filter(p =>
            p.ประเภทร้านค้า === selectedShopType &&
            p.ภาค === selectedRegion &&
            p.จังหวัด === selectedProvince &&
            p.อำเภอ === selectedDistrict
        );

        pharmacyListDiv.innerHTML = '';

        if (filteredPharmacies.length > 0) {
            filteredPharmacies.forEach(pharmacy => {
                const pharmacyCard = document.createElement('div');
                pharmacyCard.className = 'pharmacy-card';

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

                pharmacyCard.innerHTML = `
                    <h3>${pharmacyName}</h3>
                    <p><strong>ประเภทร้านค้า:</strong> ${shopType}</p>
                    <p><strong>ที่อยู่:</strong> ${address}</p>
                    <p><strong>ภาค:</strong> ${region}</p>
                    <p><strong>จังหวัด:</strong> ${province}</p>
                    <p><strong>อำเภอ:</strong> ${district}</p>
                    <p><strong>เบอร์โทร:</strong> ${phone}</p>
                    <a href="${mapUrl}" target="_blank" class="map-link">
                        ${mapIconSvg}
                    </a>
                `;
                pharmacyListDiv.appendChild(pharmacyCard);
            });
            console.log(`พบ ${filteredPharmacies.length} ร้านยาที่ตรงกับเงื่อนไข`);
        } else {
            pharmacyListDiv.innerHTML = '<p class="initial-message">ไม่พบร้านยาในเงื่อนไขที่เลือก</p>';
            console.log("ไม่พบร้านยาที่ตรงกับเงื่อนไข");
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
            const searchQuery = encodeURIComponent(`${name} ${district} ${province}`);
            return `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
        }
    }

    // Event listeners
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
