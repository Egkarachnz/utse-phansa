// ********* ใส่ URL ของคุณตรงนี้ให้เหมือนเดิม *********
const scriptURL = 'https://script.google.com/macros/s/AKfycbyI_icTiJeiEDrYdG8Sd5Tgox3xIgRfy7dHamOGexXtJDE6jtSUs224egVxXpJjELTQEw/exec';
// ******************************************************

const form = document.getElementById('survey-form');
const btnSubmit = document.getElementById('btn-submit');
let masterData = [];

/* ── 🌙🌞 Theme Toggle Logic ── */
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = themeToggleBtn.querySelector('i');

// โหลดค่า Theme ที่บันทึกไว้ หรือดูจากการตั้งค่าเครื่อง
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'light' || (!savedTheme && !systemPrefersDark)) {
    document.documentElement.setAttribute('data-theme', 'light');
    themeIcon.className = 'fa-solid fa-moon';
}

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        themeIcon.className = 'fa-solid fa-sun';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeIcon.className = 'fa-solid fa-moon';
    }
});
/* ───────────────────────────── */

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

// 4. จัดการส่งฟอร์มข้อมูลไปยัง Google Sheets (ระบบอนิเมชั่น)
const overlay = document.getElementById('submit-overlay');
const overlayIcon = document.getElementById('overlay-icon');
const overlayText = document.getElementById('overlay-text');

form.addEventListener('submit', e => {
    e.preventDefault();

    if (scriptURL === 'ใส่_URL_ของ_Google_Apps_Script_ที่นี่' || scriptURL === '') {
        alert('ไม่สามารถส่งข้อมูลได้เนื่องจากยังไม่ได้ตั้งค่าสคริปต์ URL');
        return;
    }

    // --- สเต็ปที่ 1: แสดงอนิเมชั่น "กำลังส่งข้อมูล" (จรวดลอย) ---
    overlayIcon.className = 'overlay-icon anim-sending';
    overlayIcon.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
    overlayText.textContent = 'กำลังส่งข้อมูลแบบสำรวจ...';
    overlay.classList.add('active');

    btnSubmit.disabled = true; // ป้องกันการกดซ้ำ

    fetch(scriptURL, { method: 'POST', body: new FormData(form) })
        .then(response => {
            // --- สเต็ปที่ 2: เปลี่ยนเป็นอนิเมชั่น "สำเร็จ" (เครื่องหมายถูกเด้ง) ---
            overlayIcon.className = 'overlay-icon anim-success';
            overlayIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
            overlayText.textContent = 'ส่งข้อมูลสำเร็จ ขอขอบพระคุณครับ';
            
            form.reset(); // ล้างข้อมูลในฟอร์ม
            document.getElementById('country_input').placeholder = '-- กรุณาเลือกเขตก่อน --';
            document.getElementById('wat_europe_input').placeholder = '-- กรุณาเลือกประเทศก่อน --';

            // ปิดหน้าต่างอัตโนมัติหลังจากผ่านไป 2.5 วินาที
            setTimeout(() => {
                overlay.classList.remove('active');
                btnSubmit.disabled = false;
                loadResponseCount();
            }, 2500);
        })
        .catch(error => {
            console.error('Error!', error.message);
            
            // --- สเต็ปที่ 3: กรณีเกิดข้อผิดพลาด (กากบาทสีแดง) ---
            overlayIcon.className = 'overlay-icon anim-error';
            overlayIcon.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
            overlayText.textContent = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';

            setTimeout(() => {
                overlay.classList.remove('active');
                btnSubmit.disabled = false;
            }, 3000);
        });
});

function showCountError(message) {
    const countEl = document.getElementById('response-count');

    countEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
    countEl.style.display = 'inline-flex';
    countEl.style.background = 'rgba(239, 68, 68, 0.15)';
    countEl.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    countEl.style.color = '#ef4444';
}

function showCountValue(count) {
    const countEl = document.getElementById('response-count');

    countEl.innerHTML = `<i class="fa-solid fa-users"></i> <span class="count-text">ตอบแล้ว</span> ${count} <span class="count-text">รูป</span>`;
    countEl.style.display = 'inline-flex';
    countEl.style.background = '';
    countEl.style.borderColor = '';
    countEl.style.color = '';
}

// 5. โหลดจำนวนผู้ตอบแบบสำรวจ
function loadResponseCount() {
    const countEl = document.getElementById('response-count');
    
    if (scriptURL === 'ใส่_URL_ของ_Google_Apps_Script_ที่นี่' || scriptURL === '') {
        showCountError('ยังไม่ได้ตั้งค่า URL');
        return;
    }

    countEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังโหลดจำนวนผู้กรอก...';

    fetch(scriptURL + '?action=getStats')
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            if (data && data.count !== undefined) {
                // กรณีสำเร็จ: แสดงจำนวนคน
                showCountValue(data.count);
            } else if (data && data.error) {
                // กรณีหลังบ้านฟ้อง Error (เช่น พิมพ์ชื่อชีตผิด) ให้โชว์ป้ายสีแดง
                console.error("แจ้งเตือนจากหลังบ้าน:", data.error);
                showCountError(`Error: ${data.error}`);
            } else if (Array.isArray(data)) {
                console.error('Apps Script ยังไม่รองรับ action=getStats และคืนข้อมูลหลักกลับมาแทน');
                showCountError('ยังไม่ได้เปิดใช้ระบบนับจำนวน');
            } else {
                showCountError('ไม่พบข้อมูลจำนวนผู้กรอก');
            }
        })
        .catch(error => {
            // กรณีสคริปต์หลังบ้านเป็นเวอร์ชันเก่า หรือเกิดข้อผิดพลาดรุนแรง
            console.error('Fetch Error:', error);
            showCountError('Error: หลังบ้านยังเป็นเวอร์ชันเก่า');
        });
}

window.addEventListener('load', loadResponseCount);
