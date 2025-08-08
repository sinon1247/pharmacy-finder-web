document.addEventListener('DOMContentLoaded', () => {
    const shopTypeSelect = document.getElementById('shopTypeSelect');
    const regionSelect = document.getElementById('regionSelect');
    const provinceSelect = document.getElementById('provinceSelect');
    const districtSelect = document.getElementById('districtSelect');
    const pharmacyListDiv = document.getElementById('pharmacyList');

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
                populateRegions();
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
        regionSelect.disabled = false;
        provinceSelect.disabled = true;
        districtSelect.disabled = true;
    }

    function populateProvinces(selectedRegion) {
        const selectedShopType = shopTypeSelect.value;
        provinceSelect.innerHTML = '<option value="">-- เลือกจังหวัด --</option>';
        districtSelect.innerHTML = '<option value="">-- เลือกอำเภอ --</option>';
        districtSelect.disabled = true;
        clearPharmacyList();

        if (selectedRegion) {
            const provinces = [...new Set(allPharmacies
                .filter(p => (!selectedShopType || p.ประเภทร้านค้า === selectedShopType) && p.ภาค === selectedRegion)
                .map(p => p.จังหวัด)
                .filter(Boolean)
            )].sort();
        }
    }

    function populateDistricts(selectedProvince) {
        const selectedShopType = shopTypeSelect.value;
        districtSelect.innerHTML = '<option value="">-- เลือกอำเภอ --</option>';
        clearPharmacyList();

        if (selectedProvince) {
            const districts = [...new Set(allPharmacies
                .filter(p => (!selectedShopType || p.ประเภทร้านค้า === selectedShopType) && p.จังหวัด === selectedProvince)
                .map(p => p.อำเภอ)
                .filter(Boolean)
            )].sort();
        }
    }

    function displayPharmacies() {
        const selectedShopType = shopTypeSelect.value;
        const selectedRegion = regionSelect.value;
        const selectedProvince = provinceSelect.value;
        const selectedDistrict = districtSelect.value;
        
        const filteredPharmacies = allPharmacies.filter(p => 
            (!selectedShopType || p.ประเภทร้านค้า === selectedShopType) &&
            (!selectedRegion || p.ภาค === selectedRegion) &&
            (!selectedProvince || p.จังหวัด === selectedProvince) &&
            (!selectedDistrict || p.อำเภอ === selectedDistrict)
        );
    }

    shopTypeSelect.addEventListener('change', () => { // <<-- เพิ่ม
        regionSelect.value = '';
        provinceSelect.value = '';
        districtSelect.value = '';
        populateRegions();
        displayPharmacies();
    });
});
