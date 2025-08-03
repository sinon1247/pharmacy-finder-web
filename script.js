document.addEventListener('DOMContentLoaded', () => {
    const regionSelect = document.getElementById('regionSelect');
    const provinceSelect = document.getElementById('provinceSelect');
    const districtSelect = document.getElementById('districtSelect');
    const pharmacyListDiv = document.getElementById('pharmacyList');

    let allPharmacies = []; 
    
    const jsonFilePath = 'pharmacies.json'; 

    console.log("กำลังเริ่มต้นโหลดข้อมูลจาก:", jsonFilePath);

    fetch(jsonFilePath)
        .then(response => {
            if (!response.ok) {
                console.error(`ข้อผิดพลาด HTTP: สถานะ ${response.status} - ไม่พบไฟล์ JSON หรือเข้าถึงไม่ได้`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("ข้อมูลโหลดสำเร็จแล้ว:", data);
            
            if (Array.isArray(data) && data.length > 0) {
                allPharmacies = data;
                populateRegions();
                displayInitialMessage();
            } else {
                console.warn("ไฟล์ JSON ว่างเปล่าหรือไม่ใช่รูปแบบ Array ที่คาดไว้");
                pharmacyListDiv.innerHTML = '<p class="error-message">ไม่พบข้อมูลร้านยาในไฟล์ หรือข้อมูลไม่ถูกต้อง</p>';
            }
        })
        .catch(error => {
            console.error('เกิดข้อผิดพลาดในการดึงหรือประมวลผลข้อมูลร้านยา:', error);
            pharmacyListDiv.innerHTML = '<p class="error-message">ไม่สามารถโหลดข้อมูลร้านยาได้ กรุณาลองใหม่อีกครั้ง</p>';
        });

    function displayInitialMessage() {
        pharmacyListDiv.innerHTML = '<p class="initial-message">กรุณาเลือกภาค จังหวัด และอำเภอ เพื่อแสดงร้านยา</p>';
    }

    function populateRegions() {
        const regions = [...new Set(allPharmacies.map(p => p.ภาค).filter(Boolean))].sort(); 
        
        regionSelect.innerHTML = '<option value="">-- เลือกภาค --</option>';
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        });
        regionSelect.disabled = false;
        provinceSelect.disabled = true;
        districtSelect.disabled = true;
        console.log("สร้างตัวเลือกภาคแล้ว:", regions);
    }

    function populateProvinces(selectedRegion) {
        provinceSelect.innerHTML = '<option value="">-- เลือกจังหวัด --</option>';
        districtSelect.innerHTML = '<option value="">-- เลือกอำเภอ --</option>';
        districtSelect.disabled = true;
        clearPharmacyList();

        if (selectedRegion) {
            const provinces = [...new Set(allPharmacies
                .filter(p => p.ภาค === selectedRegion)
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
            console.log(`สร้างตัวเลือกจังหวัดสำหรับภาค '${selectedRegion}' แล้ว:`, provinces);
        } else {
            provinceSelect.disabled = true;
            console.log("ไม่ได้เลือกภาค, ปิดใช้งานตัวเลือกจังหวัด");
        }
    }

    function populateDistricts(selectedProvince) {
        districtSelect.innerHTML = '<option value="">-- เลือกอำเภอ --</option>';
        clearPharmacyList();

        if (selectedProvince) {
            const districts = [...new Set(allPharmacies
                .filter(p => p.จังหวัด === selectedProvince)
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
            console.log(`สร้างตัวเลือกอำเภอสำหรับจังหวัด '${selectedProvince}' แล้ว:`, districts);
        } else {
            districtSelect.disabled = true;
            console.log("ไม่ได้เลือกจังหวัด, ปิดใช้งานตัวเลือกอำเภอ");
        }
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
            const searchQuery = encodeURIComponent(`${name} ${district} ${province} ร้านยา`);
            return `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
        }
    }

    function displayPharmacies() {
        const selectedRegion = regionSelect.value;
        const selectedProvince = provinceSelect.value;
        const selectedDistrict = districtSelect.value;

        console.log(`กำลังแสดงร้านยา: ภาค='${selectedRegion}', จังหวัด='${selectedProvince}', อำเภอ='${selectedDistrict}'`);

        if (!selectedRegion || !selectedProvince || !selectedDistrict) {
            displayInitialMessage();
            return;
        }

        const filteredPharmacies = allPharmacies.filter(p => 
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
            pharmacyListDiv.innerHTML = '<p class="initial-message">ไม่พบร้านยาในอำเภอนี้</p>';
            console.log("ไม่พบร้านยาที่ตรงกับเงื่อนไข");
        }
    }

    function clearPharmacyList() {
        pharmacyListDiv.innerHTML = '';
    }

    regionSelect.addEventListener('change', () => {
        populateProvinces(regionSelect.value);
        provinceSelect.value = '';
        districtSelect.value = '';
        displayPharmacies();
    });

    provinceSelect.addEventListener('change', () => {
        populateDistricts(provinceSelect.value);
        districtSelect.value = '';
        displayPharmacies();
    });

    districtSelect.addEventListener('change', () => {
        displayPharmacies();
    });
});
