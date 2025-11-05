const path = require('path')
const express = require('express')
const hbs = require('hbs')
const app = express()
const direktoriPublic = path.join(__dirname, '../public')
const direktoriViews = path.join(__dirname, '../templates/views')
const direktoriPartials = path.join(__dirname, '../templates/partials')
const geocode = require('./utils/geocode')
const forecast = require('./utils/prediksiCuaca')
// load mediastack util; support both function export and { default: fn } shapes
const _mediastack_mod = require('./utils/news')
console.log('DEBUG: typeof _mediastack_mod =', typeof _mediastack_mod, ' keys=', _mediastack_mod && Object.keys(_mediastack_mod))
const mediastack = (typeof _mediastack_mod === 'function') ? _mediastack_mod : (_mediastack_mod && typeof _mediastack_mod.default === 'function' ? _mediastack_mod.default : null)
if (!mediastack) {
    console.error('Error: mediastack util did not export a function. Check src/utils/news.js')
}

app.set('view engine', 'hbs')
app.set('views', direktoriViews)
hbs.registerPartials(direktoriPartials)
app.use(express.static(direktoriPublic))

// Prefetch news periodically to warm cache (only when MEDIASTACK_KEY is provided via env)
const GLOBAL_MEDIASTACK_KEY = process.env.MEDIASTACK_KEY;
if (GLOBAL_MEDIASTACK_KEY) {
    const prefetchOptions = { languages: 'id', limit: 10 };
    // initial warm
    mediastack(GLOBAL_MEDIASTACK_KEY, prefetchOptions, (err, arts) => {
        if (err) console.warn('Initial news prefetch failed:', err);
        else console.log('Initial news prefetch OK, items:', (arts && arts.length) || 0);
    });
    // refresh every 10 minutes
    setInterval(() => {
        mediastack(GLOBAL_MEDIASTACK_KEY, prefetchOptions, (err, arts) => {
            if (err) console.warn('Periodic news prefetch failed:', err);
            else console.log('Periodic news prefetch OK, items:', (arts && arts.length) || 0);
        });
    }, 10 * 60 * 1000);
} else {
    console.warn('MEDIASTACK_KEY not set in environment — news prefetch disabled.');
}

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
app.get('/infocuaca', (req, res) => {
    if(!req.query.address){
        return res.send({
            error:'Kamu harus memasukan lokasi yang ingin dicari'
        })
    }
    geocode(req.query.address, (error, { latitude, longitude,
    location } = {}) => {
        if (error){
            return res.send({error})
        }
        forecast(latitude, longitude, (error, dataPrediksi) => {
            if (error){
                return res.send({error})
            }
            res.send({
                prediksiCuaca: dataPrediksi,
                lokasi: location,
                address: req.query.address
            })
        })
    })
})

//ini halaman tentang
app.get('/tentang', (req, res) => {
    res.render('tentang', {
        judul: 'Tentang Saya',
        nama: 'Dafin Surya'
    })
})

// halaman berita
app.get('/berita', (req, res) => {
    // Baca API key dari environment variable (direkomendasikan)
    const API_KEY = process.env.MEDIASTACK_KEY || '97866e05da720fc1d90d617efdf0d9ba'
    if (!process.env.MEDIASTACK_KEY) {
        console.warn('Warning: MEDIASTACK_KEY not found in env; using fallback key from code. Consider setting MEDIASTACK_KEY environment variable.');
    }

    // Ambil opsi dasar untuk berita: bahasa dan batas
    const lang = req.query.lang || 'id';
    const limit = parseInt(req.query.limit || '10', 10) || 10;

    const options = { languages: lang, limit };

    // Ambil daftar berita (tanpa mendukung pencarian per kata kunci)
    mediastack(API_KEY, options, (error, articles) => {
        if (error) {
            return res.render('berita', {
                judul: 'Berita',
                nama: 'Dafin Surya',
                error: error
            })
        }

        res.render('berita', {
            judul: 'Berita',
            nama: 'Dafin Surya',
            articles
        })
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
