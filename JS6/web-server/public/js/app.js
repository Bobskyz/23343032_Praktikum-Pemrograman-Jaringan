const weatherform = document.querySelector('form')
const search = document.querySelector('#lokasi-input')
const pesanSatu = document.querySelector('#pesan-1')
const pesanDua = document.querySelector('#pesan-2')

// pesanSatu.textContent = 'From javascript'
weatherform.addEventListener('submit', (e) => {
    e.preventDefault()
    const location = search.value.trim()
    if (!location) {
        pesanSatu.textContent = 'Silakan masukkan lokasi.'
        pesanDua.textContent = ''
        return
    }
    pesanSatu.textContent = 'Sedang mencari lokasi ...'
    pesanDua.textContent = ''
    fetch('/infocuaca?address=' + encodeURIComponent(location)).then((response) => {
        response.json().then((data) => {
            if (data.error) {
                pesanSatu.textContent = data.error
            } else {
                pesanSatu.textContent = data.lokasi
                pesanDua.textContent = data.prediksiCuaca
            }
        }).catch((err) => {
            pesanSatu.textContent = 'Gagal memproses respons server.'
            pesanDua.textContent = ''
            console.error('JSON parse error:', err)
        })
    }).catch((err) => {
        pesanSatu.textContent = 'Gagal terhubung ke server.'
        pesanDua.textContent = ''
        console.error('Fetch error:', err)
    })
})