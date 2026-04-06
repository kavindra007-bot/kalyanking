const express = require("express");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check
app.get("/health", (req, res) => {
  res.send("OK");
});

// ENV
const PIXEL_ID = process.env.PIXEL_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

if (!PIXEL_ID || !ACCESS_TOKEN) {
  console.error("❌ Missing ENV variables");
}

// CAPI Route
app.get("/lead", async (req, res) => {

  const eventId = req.query.event_id || ('evt_' + Date.now());

  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`,
      {
        data: [
          {
            event_name: "Subscribe",
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId,
            action_source: "website",

            event_source_url: req.query.url || "",

            user_data: {
              client_ip_address: req.ip,
              client_user_agent: req.headers['user-agent'],
              fbp: req.query.fbp,
              fbc: req.query.fbc
            },

            test_event_code: "TEST57665"
          }
        ]
      },
      {
        params: {
          access_token: ACCESS_TOKEN
        }
      }
    );

    console.log("✅ Subscribe Event Sent:", eventId);
    res.sendStatus(200);

  } catch (error) {
    console.log("❌ Error:", error.response?.data || error.message);
    res.sendStatus(500);
  }
});

// PORT FIX (IMPORTANT)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});