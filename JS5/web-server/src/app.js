const path = require('path')
const express = require('express')
const hbs = require('hbs')
const app = express()
const direktoriPublic = path.join(__dirname, '../public')
const direktoriViews = path.join(__dirname, '../templates/views')
const direktoriPartials = path.join(__dirname, '../templates/partials')

app.set('view engine', 'hbs')
app.set('views', direktoriViews)
hbs.registerPartials(direktoriPartials)
app.use(express.static(direktoriPublic))

//ini halaman utama
app.get('', (req, res) => {
    res.render('index', {
        judul: 'Aplikasi Cek Cuaca',
        nama: 'Dafin Surya'
    })
})

//ini halaman bantuan/FAQ (Frequently Asked Questions)
app.get('/bantuan', (req, res) => {
    res.render('bantuan', {
        judul: 'Bantuan',
        nama: 'Dafin Surya',
        teksBantuan: 'ini adalah teks bantuan'
    })
})

// ini halaman info cuaca
app.get('/infoCuaca', (req, res) => {
	res.send([{ prediksiCuaca: 'cuaca berpotensi hujan', lokasi: 'Padang' }])
})

//ini halaman tentang
app.get('/tentang', (req, res) => {
    res.render('tentang', {
        judul: 'Tentang Saya',
        nama: 'Dafin Surya'
    })
})

app.get(/^\/bantuan\/.*$/, (req, res) => {
    res.render('404', {
        judul: '404',
        nama: 'Dafin Surya',
        pesanKesalahan: 'Artikel yang dicari tidak ditemukan.'
    })
})

app.get(/^.*$/, (req, res) => {
    res.render('404', {
        judul: '404',
        nama: 'Dafin Surya',
        pesanKesalahan: 'Halaman tidak ditemukan.'
    })
})

app.listen(4000, () => {
console.log('Server berjalan pada port 4000.')
})
