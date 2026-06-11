// ********* ใส่ URL ของคุณตรงนี้ให้เหมือนเดิม *********
const scriptURL = 'https://script.google.com/macros/s/AKfycbzssIfESB_zKdg0wfbKQlkjBJ67sXY_p5vVHMkZ2vQIW4dFs0Pjm93GNMjXeryX24pP-g/exec';
// ******************************************************

const form = document.getElementById('survey-form');
const btnSubmit = document.getElementById('btn-submit');
let masterData = [];

// 1. โหลดข้อมูลเขตเมื่อเปิดหน้าเว็บครั้งแรก
window.addEventListener('load', function() {
    if (scriptURL === 'ใส่_URL_ของ_Google_Apps_Script_ที่นี่' || scriptURL === '') {
        console.warn('กรุณาใส่ URL ของ Google Apps Script ก่อนใช้งาน');
        document.getElementById('region_select').innerHTML = '<option value="" disabled selected>-- ยังไม่ได้ใส่สคริปต์ URL --</option>';
        return;
    }

    fetch(scriptURL)
        .then(response => response.json())
        .then(data => {
            masterData = data;
            const uniqueRegions = [...new Set(data.map(item => item.region))].filter(r => r && r.trim() !== '');

            const regionSelect = document.getElementById('region_select');
            regionSelect.innerHTML = '<option value="" disabled selected>-- เลือกเขต --</option>';

            uniqueRegions.forEach(region => {
                regionSelect.innerHTML += `<option value="${region}">${region}</option>`;
            });
        })
        .catch(error => {
            console.error('Error loading data:', error);
            document.getElementById('region_select').innerHTML = '<option value="" disabled>โหลดข้อมูลล้มเหลว</option>';
        });
});

// 2. เหตุการณ์เมื่อมีการเปลี่ยน "เขต" -> เพื่อโหลด "ประเทศ"
function onRegionChange() {
    const selectedRegion = document.getElementById('region_select').value;
    const countryInput = document.getElementById('country_input');
    const countryList = document.getElementById('country_list');
    const templeInput = document.getElementById('wat_europe_input');

    countryInput.value = '';
    templeInput.value = '';
    countryInput.placeholder = 'คลิกหรือพิมพ์เพื่อเลือกประเทศ...';
    templeInput.placeholder = '-- กรุณาเลือกประเทศก่อน --';

    countryList.innerHTML = '';
    document.getElementById('wat_europe_list').innerHTML = '';

    const filteredCountries = [...new Set(
        masterData.filter(item => item.region === selectedRegion).map(item => item.country)
    )].filter(c => c && c.trim() !== '');

    filteredCountries.forEach(country => {
        countryList.innerHTML += `<option value="${country}">`;
    });
}

// 3. เหตุการณ์เมื่อพิมพ์หรือเลือก "ประเทศ" -> เพื่อโหลด "รายชื่อวัด"
function onCountryChange() {
    const selectedRegion = document.getElementById('region_select').value;
    const selectedCountry = document.getElementById('country_input').value;
    const templeInput = document.getElementById('wat_europe_input');
    const templeList = document.getElementById('wat_europe_list');

    templeInput.value = '';
    templeInput.placeholder = 'คลิกหรือพิมพ์เพื่อค้นหาชื่อวัด...';
    templeList.innerHTML = '';

    const filteredTemples = masterData
        .filter(item => item.region === selectedRegion && item.country === selectedCountry)
        .map(item => item.temple)
        .filter(t => t && t.trim() !== '');

    filteredTemples.forEach(temple => {
        templeList.innerHTML += `<option value="${temple}">`;
    });
}

// 4. จัดการส่งฟอร์มข้อมูลไปยัง Google Sheets
form.addEventListener('submit', e => {
    e.preventDefault();

    if (scriptURL === 'ใส่_URL_ของ_Google_Apps_Script_ที่นี่' || scriptURL === '') {
        alert('ไม่สามารถส่งข้อมูลได้เนื่องจากยังไม่ได้ตั้งค่าสคริปต์ URL');
        return;
    }

    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังบันทึกข้อมูล...';
    btnSubmit.style.background = '#666666';
    btnSubmit.disabled = true;

    fetch(scriptURL, { method: 'POST', body: new FormData(form) })
        .then(response => {
            alert('ส่งข้อมูลสำเร็จ ขอขอบพระคุณครับ/ค่ะ');
            form.reset();

            document.getElementById('country_input').placeholder = '-- กรุณาเลือกเขตก่อน --';
            document.getElementById('wat_europe_input').placeholder = '-- กรุณาเลือกประเทศก่อน --';

            btnSubmit.innerHTML = '<i class="fa-regular fa-paper-plane"></i> ส่งแบบสำรวจ';
            btnSubmit.style.background = 'linear-gradient(135deg, #8c6239 0%, #6e4823 100%)';
            btnSubmit.disabled = false;
        })
        .catch(error => {
            console.error('Error!', error.message);
            alert('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');

            btnSubmit.innerHTML = '<i class="fa-regular fa-paper-plane"></i> ส่งแบบสำรวจ';
            btnSubmit.style.background = 'linear-gradient(135deg, #8c6239 0%, #6e4823 100%)';
            btnSubmit.disabled = false;
        });
});
