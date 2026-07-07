const express = require('express');
const app = express();
const PORT = 3000;

// テスト用のデータ（あとでカレンダーや課題データに変えていきます）
app.get('/api', (req, res) => {
    res.json({ message: "Hello from Backend!" });
});

app.listen(PORT, () => {
    console.log(`サーバーが起動しました！ http://localhost:${PORT}`);
});