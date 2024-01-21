const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios").default;

const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

router.get("/", (req, res) => {
  res.send("Welcome to the Webhook Server!");
});

router.post("/webhook-1", (req, res) => {
  console.log(req.body);
  res.send("Webhook 1 successfully received.");
});

router.post("/webhook-2", (req, res) => {
  console.log(req.body);
  res.send("Webhook 2 successfully received.");
});

// Incorporando o código do webhook fornecido
router.post("/webhook", (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));

  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from;
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;

      axios({
        method: "POST",
        url:
          "https://graph.facebook.com/v12.0/" +
          phone_number_id +
          "/messages?access_token=" +
          process.env.WHATSAPP_TOKEN,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: { body: "Ack: " + msg_body },
        },
        headers: { "Content-Type": "application/json" },
      });
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.use(router);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
