const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({limit: '20mb'}));

const DATA_FILE = path.join(__dirname, 'inventory.json');
const UPLOAD_DIR = path.join(__dirname, 'assets', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage });

function readData(){
  try{return JSON.parse(fs.readFileSync(DATA_FILE,'utf8'));}catch(e){return []}
}
function writeData(data){
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2),'utf8');
}

app.get('/api/cars', (req, res) => {
  res.json(readData());
});

app.put('/api/cars/:id', (req, res) => {
  const id = req.params.id;
  const cars = readData();
  const idx = cars.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  cars[idx] = Object.assign(cars[idx], req.body);
  writeData(cars);
  res.json(cars[idx]);
});

app.post('/api/upload', upload.fields([{ name: 'image' }, { name: 'clip' }]), (req, res) => {
  const out = {};
  if (req.files && req.files.image && req.files.image[0]) out.image = path.posix.join('assets', 'uploads', req.files.image[0].filename);
  if (req.files && req.files.clip && req.files.clip[0]) out.clip = path.posix.join('assets', 'uploads', req.files.clip[0].filename);
  res.json(out);
});

// Serve static site as well
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Brandon Motors backend running on http://localhost:${PORT}`));
