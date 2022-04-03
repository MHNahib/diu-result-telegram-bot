const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("WELCOME TO DIU RESULT BOT DEVELOPED BY M. H. NAHIB");
});

// port
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`on port ${port}`));
